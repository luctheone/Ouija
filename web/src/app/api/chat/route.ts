import { NextRequest } from 'next/server';
import { z } from 'zod';
import { anthropic, MODEL_SONNET } from '@/lib/engine';
import { supabase } from '@/lib/supabase';
import { requireSession, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  message: z.string(),
  company_id: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const s = requireSession(req);
    if (isResponse(s)) return s;
    if (!rateLimit('chat:' + s.sid, 60)) return tooMany();

    const body = await parseBody(req, BodySchema);
    if (isResponse(body)) return body;
    const { message, company_id } = body;

    // Assemble context from DB
    const context = await assembleContext(company_id);

    const systemPrompt = `You are the Ouija Synthesis Agent for the company "${context.companyName}" (${context.site}). You have access to their onboarding data and can answer questions about user behavior, drop-off points, journey performance, and documentation.

Be concise, specific, and data-driven. Reference exact step names and numbers when relevant. If you don't have enough data to answer confidently, say so.

Company context:
- Site: ${context.site}
- Status: ${context.status}
- Total sessions: ${context.stats.total}
- Completion rate: ${context.stats.total > 0 ? Math.round((context.stats.completed / context.stats.total) * 100) : 0}%

Journey graph:
${context.graphSummary}

Documentation excerpts:
${context.docsSummary}

Recent session events:
${context.eventsSummary}

Breakpoint annotations:
${context.breakpointsSummary}`;

    const anthropicStream = await anthropic.messages.create({
      model: MODEL_SONNET,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[/api/chat]', error);
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function assembleContext(companyId: string) {
  const { data: company } = await supabase()
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  const site = company?.site || '';
  const companyName = company?.name || 'Unknown';
  const status = company?.status || 'discovered';

  // Get docs (general + breakpoints)
  const { data: docs } = await supabase()
    .from('docs')
    .select('site, task, content, graph_template')
    .eq('site', site)
    .limit(10);

  // Get sessions + stats
  const { data: sessions } = await supabase()
    .from('sessions')
    .select('id, status')
    .eq('company', site);

  const total = sessions?.length || 0;
  const completed = sessions?.filter((s: any) => s.status === 'completed').length || 0;
  const abandoned = sessions?.filter((s: any) => s.status === 'abandoned').length || 0;

  // Get recent events — SCOPED to this company's sessions. The events table has no
  // company column, so without this filter the prompt would leak every tenant's
  // activity into this company's synthesis context.
  const sessionIds = (sessions || []).map((s: any) => s.id);
  let events: any[] = [];
  if (sessionIds.length > 0) {
    const { data: ev } = await supabase()
      .from('events')
      .select('step, action, timestamp, session_id')
      .in('session_id', sessionIds)
      .order('timestamp', { ascending: false })
      .limit(20);
    events = ev || [];
  }

  // Build summaries
  const graphDoc = docs?.find((d: any) => d.graph_template);
  const graphSummary = graphDoc?.graph_template
    ? JSON.stringify(graphDoc.graph_template.nodes?.map((n: any) => `${n.id}: ${n.instruction}`))
    : 'No journey graph configured.';

  const generalDocs = docs?.filter((d: any) => !d.task.includes(':')) || [];
  const docsSummary = generalDocs.length > 0
    ? generalDocs.map((d: any) => `[${d.task}]: ${d.content.slice(0, 500)}`).join('\n')
    : 'No documentation ingested.';

  const breakpoints = docs?.filter((d: any) => d.task.includes(':')) || [];
  const breakpointsSummary = breakpoints.length > 0
    ? breakpoints.map((d: any) => `Node ${d.task}: ${d.content.slice(0, 300)}`).join('\n')
    : 'No breakpoint annotations.';

  const eventsSummary = events && events.length > 0
    ? events.slice(0, 15).map((e: any) => `${e.action} at ${e.step}`).join(', ')
    : 'No events recorded yet.';

  return {
    companyName,
    site,
    status,
    stats: { total, completed, abandoned },
    graphSummary,
    docsSummary,
    breakpointsSummary,
    eventsSummary,
  };
}
