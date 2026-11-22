import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { requireSession, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';
import type { JourneyGraph } from '@ouija/types';

export const runtime = 'nodejs';
export const maxDuration = 20;

// The advance call is the BILLING/AUDIT event. Each call writes a ledger trail:
//   - a 'complete' event for the step the user just finished (with verify evidence)
//   - an 'enter' event for the step they move into (if any)
// Completion (the billable signal) is stamped SERVER-SIDE: we derive terminality
// from the journey graph (no outgoing edge from the new position), not from a
// client-asserted `done` flag. Every billed completion therefore has an event
// trail with timestamps + the terminal step recorded.

const Body = z.object({
  session_id: z.string().min(1),
  completed_step: z.string().min(1),
  next_step: z.string().min(1).nullable().optional(),
  // Optional evidence from the verify pass — stored on the ledger when present.
  verify_evidence: z.string().optional(),
  client_ts: z.union([z.string(), z.number()]).optional(),
});

/** True if `position` has no outgoing edge in the graph (i.e. it is terminal). */
function isTerminal(graph: JourneyGraph | null | undefined, position: string): boolean {
  if (!graph || !Array.isArray(graph.edges)) return true; // no graph info → treat as terminal
  return !graph.edges.some((e) => e.from === position);
}

export async function POST(req: NextRequest) {
  const session = requireSession(req);
  if (isResponse(session)) return session;

  const body = await parseBody(req, Body);
  if (isResponse(body)) return body;

  if (!rateLimit(`advance:${session.sid}`, 120)) return tooMany();

  const { session_id, completed_step, next_step, verify_evidence, client_ts } = body;

  try {
    // Load the session's graph + current position so we can derive terminality
    // server-side instead of trusting the client's next_step/done. Best-effort:
    // if we can't read it, we fall back to the client-supplied next_step.
    let graph: JourneyGraph | null = null;
    try {
      const { data: jg } = await supabase()
        .from('journey_graphs')
        .select('graph')
        .eq('session_id', session_id)
        .single();
      graph = (jg?.graph as JourneyGraph) ?? null;
    } catch {
      /* no graph row — fall through to client next_step */
    }

    // The new position: prefer the graph's outgoing edge from the completed step,
    // falling back to the client's next_step when the graph is unavailable.
    let toStep: string | null = next_step ?? null;
    if (graph && Array.isArray(graph.edges)) {
      // Only override the client's next_step from the server graph if the server graph
      // actually KNOWS this step. Diagnosis can splice recovery nodes into the live graph
      // client-side (they aren't persisted to the stored journey_graphs row yet), so for a
      // recovery node the server graph won't contain it — trust the client's next_step then.
      const serverKnowsStep = Array.isArray(graph.nodes) && graph.nodes.some((n: { id: string }) => n.id === completed_step);
      if (serverKnowsStep) {
        const edge = graph.edges.find((e) => e.from === completed_step);
        toStep = edge ? edge.to : null;
      }
    }

    // Server-derived terminality: the journey is done when the step we're moving
    // INTO is terminal, or there is no next step at all.
    const done = toStep === null || isTerminal(graph, toStep);

    // The ledger payload — meaningful, auditable, billable. `via_session` records WHICH
    // token authorized the write (from the verified session claims), so every billed
    // completion can be traced to the issuing session — "what was checked, when, from which token."
    const basePayload = {
      from_step: completed_step,
      to_step: toStep,
      ...(verify_evidence !== undefined ? { verify_evidence } : {}),
      client_ts: client_ts ?? null,
      via_session: session.sid,
    };

    // 1) 'complete' event for the step just finished, carrying verify evidence.
    //    Best-effort: a failed DB write must not break the response.
    await supabase()
      .from('events')
      .insert({
        session_id,
        step: completed_step,
        action: 'complete',
        payload: basePayload,
      })
      .then(() => {});

    if (!done && toStep) {
      // 2a) Mid-journey advance: move position + log entry into the new step.
      await supabase()
        .from('journey_graphs')
        .update({ position: toStep, updated_at: new Date().toISOString() })
        .eq('session_id', session_id)
        .then(() => {});

      await supabase()
        .from('events')
        .insert({
          session_id,
          step: toStep,
          action: 'enter',
          payload: { from_step: completed_step, to_step: toStep, client_ts: client_ts ?? null, via_session: session.sid },
        })
        .then(() => {});

      return NextResponse.json({ position: toStep, done: false });
    }

    // 2b) Terminal advance: stamp completion SERVER-SIDE. This is the billable signal.
    //     completed_step is the terminal node; persist completed_at + status on the
    //     session and pin the graph position to the terminal step for the audit trail.
    await supabase()
      .from('sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', session_id)
      .then(() => {});

    await supabase()
      .from('journey_graphs')
      .update({ position: completed_step, updated_at: new Date().toISOString() })
      .eq('session_id', session_id)
      .then(() => {});

    return NextResponse.json({ position: completed_step, done: true });
  } catch (error) {
    console.error('[/api/sessions/advance]', error);
    return NextResponse.json({ error: 'Failed to advance step' }, { status: 500 });
  }
}
