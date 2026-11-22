import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { parseBody, isResponse } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';
import { signSessionToken } from '@/lib/auth';
import { planFlow } from '@/app/api/plan/route';

export const runtime = 'nodejs';
export const maxDuration = 300;

const Body = z.object({
  device_id: z.string().min(1),
  query: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // ENTRY POINT: the popup calls this before it has any session token, so this route is
  // intentionally NOT requireSession-gated. It IS the single most expensive op (research +
  // iterative planning), so rate-limit hard by device_id.
  const body = await parseBody(req, Body);
  if (isResponse(body)) return body;
  const { device_id, query } = body;

  if (!rateLimit('cold:' + device_id, 5)) return tooMany();

  try {
    // Extract site hint from query
    const siteHint = extractSiteFromQuery(query);
    const taskSlug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);

    // Research + build the graph IN-PROCESS (no HTTP self-fetch).
    const planData = await planFlow({ site: siteHint, task: taskSlug, query });
    const graph = planData.graph;

    // Guard against an empty graph (planner produced nothing usable).
    if (!graph.nodes?.[0]) {
      return NextResponse.json(
        { error: 'Planner produced an empty graph for this query.' },
        { status: 422 }
      );
    }

    // Create session
    const { data: session, error: sessionError } = await supabase()
      .from('sessions')
      .insert({
        device_id,
        company: siteHint,
        flow: taskSlug,
        demo_key_type: null,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Create journey graph record
    await supabase().from('journey_graphs').insert({
      session_id: session.id,
      graph,
      position: graph.nodes[0].id,
      forks: [],
    });

    // Log first step
    await supabase().from('events').insert({
      session_id: session.id,
      step: graph.nodes[0].id,
      action: 'enter',
      payload: { source: planData.source },
    });

    // Increment company session count (best-effort, non-blocking)
    supabase()
      .from('companies')
      .select('session_count')
      .eq('site', siteHint)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase()
            .from('companies')
            .update({ session_count: (data.session_count || 0) + 1 })
            .eq('site', siteHint)
            .then(() => {});
        }
      });

    return NextResponse.json(
      {
        session_id: session.id,
        session_token: signSessionToken({
          sid: String(session.id ?? `local_${Date.now()}`),
          did: device_id,
        }),
        graph,
        position: graph.nodes[0].id,
        source: planData.source,
        research: planData.research || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[/api/sessions/cold-start]', error);
    return NextResponse.json({ error: 'Cold start failed' }, { status: 500 });
  }
}

function extractSiteFromQuery(query: string): string {
  const knownSites: Record<string, string> = {
    shopify: 'shopify',
    stripe: 'stripe',
    meta: 'meta',
    facebook: 'meta',
    google: 'google',
    mailchimp: 'mailchimp',
    hubspot: 'hubspot',
    notion: 'notion',
    slack: 'slack',
    github: 'github',
    vercel: 'vercel',
    aws: 'aws',
  };

  const lower = query.toLowerCase();
  for (const [keyword, site] of Object.entries(knownSites)) {
    if (lower.includes(keyword)) return site;
  }

  // Fallback: use first significant word
  const words = lower.split(/\s+/).filter((w) => w.length > 3);
  return words[0] || 'unknown';
}
