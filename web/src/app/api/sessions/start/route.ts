import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { signSessionToken } from '@/lib/auth';
import { parseBody, isResponse } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';
import type { JourneyGraph } from '@ouija/types';

export const runtime = 'nodejs';
export const maxDuration = 20;

const StartBody = z.object({
  device_id: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  flow: z.string().max(200).optional(),
  demo_key_type: z.enum(['shopify', 'stripe', 'aws']).nullable().optional(),
  api_key: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  // Entry point: issues the session token, so it cannot require one — but validate + rate-limit.
  const body = await parseBody(req, StartBody);
  if (isResponse(body)) return body;
  const { device_id, company, flow, demo_key_type, api_key } = body;
  if (!rateLimit(`start:${device_id}`, 30)) return tooMany();

  try {
    let resolvedCompany = company || '';
    let resolvedFlow = flow || 'default';

    // If api_key provided, look up company from DB
    if (api_key && !company) {
      const { data: companyRecord } = await supabase()
        .from('companies')
        .select('site, name')
        .eq('api_key', api_key)
        .single();

      if (!companyRecord) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      resolvedCompany = companyRecord.site;
    }

    // Get journey graph from Supabase
    let graph: JourneyGraph | null = null;
    try {
      const { data: doc } = await supabase()
        .from('docs')
        .select('graph_template')
        .eq('site', resolvedCompany)
        .eq('task', resolvedFlow)
        .single();
      graph = doc?.graph_template ?? null;
    } catch {
      // Supabase query failed — continue with null
    }

    // Fallback: try matching by site alone (any doc with a graph_template)
    if (!graph) {
      try {
        const { data: doc } = await supabase()
          .from('docs')
          .select('graph_template')
          .eq('site', resolvedCompany)
          .not('graph_template', 'is', null)
          .limit(1)
          .single();
        graph = doc?.graph_template ?? null;
      } catch { /* */ }
    }

    if (!graph) {
      return NextResponse.json(
        { error: `No pre-built graph for ${resolvedCompany}/${resolvedFlow}` },
        { status: 404 }
      );
    }

    // Guard against an empty/malformed graph_template so we return a clear error
    // instead of a generic 500 from dereferencing graph.nodes[0] below.
    if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) {
      return NextResponse.json(
        { error: `Graph for ${resolvedCompany}/${resolvedFlow} has no steps` },
        { status: 422 }
      );
    }

    // Try to persist to DB — but don't block the response if it fails
    let sessionId = `local_${Date.now()}`;
    try {
      const { data: session, error: sessionError } = await supabase()
        .from('sessions')
        .insert({ device_id, company: resolvedCompany, flow: resolvedFlow, demo_key_type: demo_key_type || null })
        .select()
        .single();

      if (!sessionError && session) {
        sessionId = session.id;

        // Abandoned lifecycle (best-effort): starting a new guided session implies the
        // device's prior still-active session was left incomplete. Stamp those 'abandoned'
        // so the ledger carries a real abandonment signal (vs only 'active'/'completed').
        // A TTL cron is the production-grade version; this covers the common case for free.
        supabase()
          .from('sessions')
          .update({ status: 'abandoned' })
          .eq('device_id', device_id)
          .eq('status', 'active')
          .neq('id', session.id)
          .then(() => {});

        // These are best-effort — don't fail the whole request
        await supabase().from('journey_graphs').insert({
          session_id: session.id,
          graph,
          position: graph.nodes[0].id,
          forks: [],
        }).then(() => {});

        // First ledger event carries a real payload (was {}): records the entry step, the
        // flow, and the graph size so the audit trail is meaningful from step one.
        await supabase().from('events').insert({
          session_id: session.id,
          step: graph.nodes[0].id,
          action: 'enter',
          payload: {
            from_step: null,
            to_step: graph.nodes[0].id,
            source: 'session-start',
            flow: resolvedFlow,
            graph_size: graph.nodes.length,
            via_device: device_id,
          },
        }).then(() => {});
      }
    } catch {
      // DB write failed — still return the graph so guidance works
    }

    return NextResponse.json({
      session_id: sessionId,
      graph,
      position: graph.nodes[0].id,
      session_token: signSessionToken({ sid: String(sessionId), did: device_id }),
    }, { status: 201 });
  } catch (error) {
    console.error('[/api/sessions/start]', error);
    return NextResponse.json(
      { error: 'Failed to start session', detail: String(error) },
      { status: 500 }
    );
  }
}
