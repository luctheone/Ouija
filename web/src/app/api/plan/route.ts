import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { converseWithTools, invokeStructured, MODEL_HAIKU } from '@/lib/engine';
import { researchColdFlow } from '@/lib/agents/research';
import { requireSession, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';
import type { JourneyGraph, PlanResponse } from '@ouija/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

const PlanBody = z.object({
  site: z.string().min(1).max(200),
  task: z.string().min(1).max(200),
  query: z.string().max(2000).optional(),
});

/** PlanResponse, optionally carrying the cold-research brief summary when source==='cold'. */
export type PlanFlowResult = PlanResponse & {
  research?: {
    sites_involved: string[];
    cross_site_moments: string[];
    known_failure_points: string[];
    sources: { title: string; url: string; relevance: number }[];
  };
};

const PLANNER_SYSTEM_PROMPT = `You are Ouija Planner — you build step-by-step journey graphs for cross-site software onboarding.

You have received a structured research brief about this task. Use it to build the graph.

Rules:
- Each node = ONE atomic user action on a specific site domain. Prefer one atomic action per node so its verify is unambiguous.
- Include: id, site (domain), selector_hint, instruction (human-friendly), verify_condition, confidence (0.0-1.0).
- selector_hint must be a human/role description the runtime can match by ROLE and visible LABEL — e.g. \`role=button name="Connect"\` or \`the "Add pixel" button\` — NOT a brittle CSS/XPath selector, because the docs you were given never contain real DOM selectors and the runtime matches by role + nearby label.
- verify_condition MUST, whenever possible, be one of these LOCAL, FREE, INSTANT forms:
  - \`URL contains <substring>\` — when the step lands on a URL containing a distinctive path.
  - \`clipboard contains <substring>\` — when the step copies a value.
  Only use a short plain-English condition (e.g. "the success banner is visible") when NEITHER url NOR clipboard applies — those are slower/paid LLM checks, so minimize them.
- Confidence scoring: 0.85+ = from official docs with clear instructions. 0.6-0.84 = from community guides or potentially stale. <0.6 = uncertain, UI may have changed.
- Cross-site transitions: add explicit navigation instructions ("Now switch to Meta Business Suite...").
- Use retrieve_docs for additional targeted searches if the research brief is unclear.
- Use verify_current_ui to check if a specific UI element still exists (searches recent sources).
- Call validate_step for each step to self-check.
- When complete, call submit_graph with final nodes + edges.
- Identify cross_site_moments: where the user must switch between sites.`;

const PLANNER_TOOLS = [
  {
    name: 'retrieve_docs',
    description: 'Targeted search for specific documentation. Use when the research brief lacks detail on a particular step.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'verify_current_ui',
    description: 'Check if a specific UI element/button/page still exists on a site. Searches recent sources to verify the element has not been moved or removed.',
    input_schema: {
      type: 'object',
      properties: {
        element: { type: 'string', description: 'The UI element to verify (e.g. "Add custom pixel button")' },
        site: { type: 'string', description: 'The site domain to check' },
      },
      required: ['element', 'site'],
      additionalProperties: false,
    },
  },
  {
    name: 'validate_step',
    description: 'Self-check: is this step logical given prior steps?',
    input_schema: {
      type: 'object',
      properties: {
        step_instruction: { type: 'string' },
        site: { type: 'string' },
        previous_steps: { type: 'array', items: { type: 'string' } },
      },
      required: ['step_instruction', 'site', 'previous_steps'],
      additionalProperties: false,
    },
  },
  {
    name: 'submit_graph',
    description: 'Submit the final journey graph. Call when all steps are validated and complete.',
    input_schema: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              site: { type: 'string' },
              selector_hint: { type: 'string' },
              instruction: { type: 'string' },
              verify_condition: { type: 'string' },
              confidence: { type: 'number' },
            },
            required: ['id', 'site', 'selector_hint', 'instruction', 'verify_condition', 'confidence'],
            additionalProperties: false,
          },
        },
        edges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              from: { type: 'string' },
              to: { type: 'string' },
              condition: { type: 'string' },
            },
            required: ['from', 'to'],
            additionalProperties: false,
          },
        },
        cross_site_moments: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['nodes', 'edges', 'cross_site_moments'],
      additionalProperties: false,
    },
  },
];

const VALIDATE_STEP_SCHEMA = {
  type: 'object',
  properties: {
    valid: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['valid', 'reason'],
  additionalProperties: false,
};

/**
 * Core planning logic: warm lookup (Supabase graph template) → cold research + iterative
 * tool-calling planner. Returns the PlanResponse (plus a `research` brief on the cold path).
 * Called in-process by /api/sessions/cold-start and by the POST handler below.
 */
export async function planFlow({
  site,
  task,
  query,
}: {
  site: string;
  task: string;
  query?: string;
}): Promise<PlanFlowResult> {
  // ── WARM path: graph from Supabase ─────────────────────────────
  const { data: doc } = await supabase()
    .from('docs')
    .select('graph_template')
    .eq('site', site)
    .eq('task', task)
    .single();

  if (doc?.graph_template) {
    return { graph: doc.graph_template, source: 'warm' };
  }

    // ── COLD path: multi-query research → iterative planning ─────
    const researchBrief = await researchColdFlow(query || `${task} on ${site}`, site);

    let finalGraph: JourneyGraph | null = null;
    let crossSiteMoments: string[] = [];

    const toolHandlers: Record<string, (input: any) => Promise<string>> = {
      async retrieve_docs(input: { query: string }) {
        const { researchFailure } = await import('@/lib/agents/research');
        const result = await researchFailure(site, '', input.query);
        return result.findings || 'No additional docs found.';
      },

      async verify_current_ui(input: { element: string; site: string }) {
        if (!process.env.EXA_API_KEY) {
          return JSON.stringify({ exists: false, message: 'Verification unavailable (no web search key).' });
        }
        const Exa = (await import('exa-js')).default;
        const exa = new Exa(process.env.EXA_API_KEY);
        try {
          const res = await exa.searchAndContents(
            `"${input.element}" ${input.site} 2024 2025`,
            { type: 'auto', numResults: 2, text: { maxCharacters: 2000, includeHtmlTags: false } }
          );
          if (res.results && res.results.length > 0) {
            return JSON.stringify({ exists: true, evidence: res.results[0].text?.slice(0, 500) });
          }
          return JSON.stringify({ exists: false, message: 'Could not confirm this UI element still exists.' });
        } catch {
          return JSON.stringify({ exists: false, message: 'Verification search failed.' });
        }
      },

      async validate_step(input: { step_instruction: string; site: string; previous_steps: string[] }) {
        const result = await invokeStructured<{ valid: boolean; reason: string }>(
          [{
            role: 'user',
            content: `Validate this onboarding step:\nSite: ${input.site}\nPrevious: ${input.previous_steps.join(' → ') || '(first step)'}\nProposed: "${input.step_instruction}"\n\nIs it logical, atomic, and specific enough?`,
          }],
          VALIDATE_STEP_SCHEMA,
          256,
          MODEL_HAIKU
        );
        return result.valid ? 'valid' : `Invalid: ${result.reason}`;
      },

      async submit_graph(input: { nodes: any[]; edges: any[]; cross_site_moments: string[] }) {
        finalGraph = { nodes: input.nodes, edges: input.edges };
        crossSiteMoments = input.cross_site_moments || [];
        return 'Graph submitted. Planning complete.';
      },
    };

    const userMessage = `Build a journey graph for: "${query || task}" on "${site}".

## Research Brief
- Sites involved: ${researchBrief.sites_involved.join(', ')}
- Estimated steps: ${researchBrief.estimated_steps}
- Cross-site moments: ${researchBrief.cross_site_moments.join('; ') || 'none detected'}
- Known failure points: ${researchBrief.known_failure_points.join('; ') || 'none found'}

## Documentation
${researchBrief.raw_docs.slice(0, 12000)}

Build the graph now. Validate each step. Submit when complete.`;

    await converseWithTools(
      PLANNER_SYSTEM_PROMPT,
      [{ role: 'user', content: userMessage }],
      PLANNER_TOOLS,
      toolHandlers,
      20
    );

    if (!finalGraph) {
      throw new Error('Planner did not produce a graph');
    }

    // ── Cache the generated graph ────────────────────────────────
    await cacheGeneratedGraph(site, task, finalGraph);

    // ── Ensure company record exists ─────────────────────────────
    await ensureCompanyRecord(site);

  return {
    graph: finalGraph,
    source: 'cold',
    research: {
      sites_involved: researchBrief.sites_involved,
      cross_site_moments: crossSiteMoments,
      known_failure_points: researchBrief.known_failure_points,
      sources: researchBrief.sources.slice(0, 5),
    },
  };
}

export async function POST(req: NextRequest) {
  // /api/plan as an HTTP endpoint is expensive (research + iterative planning) — gate it
  // behind a valid session token. (cold-start calls planFlow() in-process, not over HTTP.)
  const session = requireSession(req);
  if (isResponse(session)) return session;

  const body = await parseBody(req, PlanBody);
  if (isResponse(body)) return body;
  if (!rateLimit(`plan:${session.sid}`, 10)) return tooMany();

  try {
    const { site, task, query } = body;
    const result = await planFlow({ site, task, query });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/plan]', error);
    return NextResponse.json({ error: 'Planning failed' }, { status: 500 });
  }
}

async function cacheGeneratedGraph(site: string, task: string, graph: JourneyGraph) {
  try {
    await supabase()
      .from('docs')
      .upsert(
        {
          site,
          task,
          content: `Auto-generated journey graph for ${task} on ${site}`,
          graph_template: graph,
        },
        { onConflict: 'site,task' }
      );
  } catch (e) {
    console.error('[cache graph]', e);
  }
}

async function ensureCompanyRecord(site: string) {
  try {
    const { data: existing } = await supabase()
      .from('companies')
      .select('id')
      .eq('site', site)
      .single();

    if (!existing) {
      await supabase().from('companies').insert({
        name: site.split('.')[0],
        site,
        status: 'discovered',
      });
    }
  } catch {
    // companies table may not exist yet — non-blocking
  }
}
