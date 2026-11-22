import { NextRequest } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { anthropic, MODEL_SONNET } from '@/lib/engine';
import { requireSession, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BodySchema = z.object({
  message: z.string(),
  screenshot: z.string().optional(),
  elements: z.array(z.any()).optional(),
  structure: z.record(z.unknown()).optional(),
  url: z.string().optional(),
  step_instruction: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const s = requireSession(req);
    if (isResponse(s)) return s;
    if (!rateLimit('guide-chat-visual:' + s.sid, 30)) return tooMany();

    const body = await parseBody(req, BodySchema);
    if (isResponse(body)) return body;
    const { message, screenshot, elements, structure, url, step_instruction } = body;

    const systemPrompt = `You are Ouija, guiding a non-technical user through software onboarding. You can SEE their screen via the attached screenshot.

THE USER'S CURRENT TASK — this is the ONLY thing you are helping them do right now:
"${step_instruction || 'complete the current onboarding step'}"
Current URL: ${url || 'unknown'}
Page structure: ${structure ? JSON.stringify(structure) : 'not available'}

Interactive elements on page:
${elements ? JSON.stringify(elements.slice(0, 15), null, 1) : 'none captured'}

Rules:
- Drive the user through the CURRENT TASK above and nothing else. Do NOT present a menu of options or ask "what would you like to do?" — give the single concrete next action toward the task.
- Look at the screenshot and name the exact next thing to click or type to complete the task (e.g. "Click the blue 'Create product' button in the top-right corner").
- If the screenshot shows the task is already done, say so and tell them to press the "Done ✓" button in the Ouija panel to continue.
- Be specific about what you SEE (positions, button labels). Concise: 2-3 sentences.
- If they genuinely need to navigate elsewhere for this task, give the full URL.
- Warm, friendly, non-technical. Never mention dev tools or anything technical.`;

    const content: Anthropic.ContentBlockParam[] = [];
    if (screenshot) {
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Data } });
    }
    content.push({ type: 'text', text: message });

    const anthropicStream = await anthropic.messages.create({
      model: MODEL_SONNET,
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
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
  } catch (error: any) {
    console.error('[/api/guide-chat-visual]', error);
    const detail = error?.message || error?.name || String(error);
    return new Response(JSON.stringify({ error: 'Visual chat failed', detail, model: MODEL_SONNET }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
