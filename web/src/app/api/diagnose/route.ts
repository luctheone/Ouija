import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { converseWithTools, type ToolDefinition } from '@/lib/engine';
import { requireSession, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';
import { classifyFailure } from '@/lib/agents/classify';
import { researchFailure } from '@/lib/agents/research';
import { searchClientDocs } from '@/lib/agents/docs';
import type { DiagnoseResponse } from '@ouija/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const DiagnoseBody = z.object({
  elements: z.array(z.any()).max(60),
  graph: z.object({ nodes: z.array(z.any()), edges: z.array(z.any()) }).passthrough(),
  position: z.string().min(1),
  error_signal: z.string().max(2000),
  url: z.string().max(2000),
  site: z.string().max(200).optional(),
  task: z.string().max(200).optional(),
});

const DIAGNOSIS_SYSTEM_PROMPT = `You are the Ouija Diagnosis agent. A non-technical user is being guided through cross-site software onboarding. They hit a breakpoint — the expected state of the page diverged from what was actually observed.

You have been provided with:
- Research context from the web (if available) — recent docs, known issues, UI changes
- Client documentation (if available) — the vendor's own instructions for this step

Your job:
1. Use inspect_elements to re-examine specific areas of the page.
2. Use check_url_state to verify navigation.
3. Consider the research and client docs provided — they may explain the issue.
4. Call submit_diagnosis with:
   - hypothesis: what went wrong and why (reference docs if they helped)
   - fork: an alternative path (set deadEnd=true only if genuinely unrecoverable)
   - recovery_instruction: clear, warm, specific for a non-technical user

Always investigate before diagnosing. Call inspect_elements at least once.`;

const TOOLS: ToolDefinition[] = [
  {
    name: 'inspect_elements',
    description: 'Re-examine elements on the page matching a focus area.',
    input_schema: {
      type: 'object',
      properties: {
        focus_area: { type: 'string', description: 'Keyword to filter elements by' },
      },
      required: ['focus_area'],
      additionalProperties: false,
    },
  },
  {
    name: 'check_url_state',
    description: 'Check if current URL matches expected site/path.',
    input_schema: {
      type: 'object',
      properties: {
        expected_site: { type: 'string', description: 'Expected URL fragment' },
      },
      required: ['expected_site'],
      additionalProperties: false,
    },
  },
  {
    name: 'submit_diagnosis',
    description: 'Submit your final diagnosis. Ends the investigation.',
    input_schema: {
      type: 'object',
      properties: {
        hypothesis: { type: 'string' },
        fork: {
          type: 'object',
          properties: {
            at: { type: 'string' },
            branch: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  site: { type: 'string' },
                  selector_hint: { type: 'string' },
                  instruction: { type: 'string' },
                  verify_condition: { type: 'string' },
                },
                required: ['id', 'site', 'selector_hint', 'instruction', 'verify_condition'],
                additionalProperties: false,
              },
            },
            deadEnd: { type: 'boolean' },
          },
          required: ['at', 'branch', 'deadEnd'],
          additionalProperties: false,
        },
        recovery_instruction: { type: 'string' },
      },
      required: ['hypothesis', 'fork', 'recovery_instruction'],
      additionalProperties: false,
    },
  },
];

export async function POST(req: NextRequest) {
  const session = requireSession(req);
  if (isResponse(session)) return session;

  const body = await parseBody(req, DiagnoseBody);
  if (isResponse(body)) return body;
  if (!rateLimit(`diagnose:${session.sid}`, 30)) return tooMany();

  try {
    const { elements, graph, position, error_signal, url, site, task } = body;

    const currentNode = graph.nodes.find((n: any) => n.id === position);
    const nodeInstruction = currentNode?.instruction || '';
    const nodeSite = currentNode?.site || site || '';
    const nodeTask = task || '';

    // ── Step 1: Classify severity ─────────────────────────────────
    const classification = await classifyFailure(
      error_signal,
      nodeInstruction,
      elements,
      url
    );

    if (classification.severity === 'simple') {
      return NextResponse.json({
        severity: 'simple',
        nudge: classification.nudge || classification.reason,
      });
    }

    // ── Step 2: Research Agent (Exa — web context) ────────────────
    const research = await researchFailure(nodeSite, error_signal, nodeInstruction);

    // ── Step 3: Docs Agent (client metadata — bespoke) ────────────
    const clientDocs = await searchClientDocs(nodeSite, nodeTask, position);

    // ── Step 4: Diagnosis Agent (Bedrock tool_use) ────────────────
    let diagnosis: DiagnoseResponse | null = null;

    const toolHandlers: Record<string, (input: any) => Promise<string>> = {
      inspect_elements: async (input: { focus_area: string }) => {
        const query = input.focus_area.toLowerCase();
        const matched = elements.filter(
          (el) =>
            el.text.toLowerCase().includes(query) ||
            el.ariaLabel.toLowerCase().includes(query) ||
            el.nearbyLabel.toLowerCase().includes(query)
        );
        if (matched.length === 0) {
          return JSON.stringify({ found: 0, message: `No elements matched "${input.focus_area}".` });
        }
        return JSON.stringify({ found: matched.length, elements: matched });
      },

      check_url_state: async (input: { expected_site: string }) => {
        const matches = url.toLowerCase().includes(input.expected_site.toLowerCase());
        return JSON.stringify({
          current_url: url,
          expected: input.expected_site,
          matches,
          message: matches ? 'URL matches.' : 'URL does NOT match — user may have navigated away.',
        });
      },

      submit_diagnosis: async (input: DiagnoseResponse) => {
        diagnosis = input;
        return JSON.stringify({ status: 'accepted' });
      },
    };

    // Build context message with research + docs
    let contextBlock = '';
    if (research.findings) {
      contextBlock += `\n\n## Web research (recent docs & known issues)\n${research.findings}`;
    }
    if (clientDocs.hasClientDocs) {
      contextBlock += `\n\n## Client documentation (vendor's own instructions for this step)\n${clientDocs.content}`;
    }

    const userMessage = `Breakpoint hit during onboarding guidance.

Position: "${position}"
Error signal: "${error_signal}"
Current URL: ${url}
Node instruction: "${nodeInstruction}"

Journey graph: ${JSON.stringify(graph, null, 2)}

There are ${elements.length} elements on the page. Use inspect_elements to examine relevant areas.${contextBlock}

Investigate, then submit your diagnosis.`;

    await converseWithTools(
      DIAGNOSIS_SYSTEM_PROMPT,
      [{ role: 'user', content: userMessage }],
      TOOLS,
      toolHandlers,
      8
    );

    if (!diagnosis) {
      return NextResponse.json(
        { error: 'Diagnosis agent did not submit a diagnosis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      severity: 'complex',
      ...(diagnosis as DiagnoseResponse),
      research_sources: research.sources,
      has_client_docs: clientDocs.hasClientDocs,
    });
  } catch (error) {
    console.error('[/api/diagnose]', error);
    return NextResponse.json({ error: 'Diagnosis failed' }, { status: 500 });
  }
}
