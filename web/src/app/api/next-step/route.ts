import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { invokeStructured, MODEL_HAIKU } from '@/lib/engine';
import { requireSession, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';
import type { NextStepResponse } from '@ouija/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  elements: z.array(z.any()),
  graph: z.any().optional(),
  position: z.string(),
  step_instruction: z.string(),
  structure: z.record(z.unknown()).optional(),
});

const NEXT_STEP_SCHEMA = {
  type: 'object',
  properties: {
    elementIndex: { type: 'integer' },
    tooltip: { type: 'string' },
    pointDirection: { enum: ['above', 'below', 'left', 'right'] },
    done: { type: 'boolean' },
    confidence: { type: 'number' },
  },
  required: ['elementIndex', 'tooltip', 'pointDirection', 'done', 'confidence'],
  additionalProperties: false,
};

export async function POST(req: NextRequest) {
  try {
    const s = requireSession(req);
    if (isResponse(s)) return s;
    if (!rateLimit('next-step:' + s.sid, 240)) return tooMany();

    const body = await parseBody(req, BodySchema);
    if (isResponse(body)) return body;
    const { elements, position, step_instruction, structure } = body;

    const result = await invokeStructured<NextStepResponse>(
      [
        {
          role: 'user',
          content: `You are Ouija, guiding a user through software onboarding. You perceive the page and point to the next element they should interact with. You NEVER act — only guide.

Current step instruction: ${step_instruction}
Current graph position: ${position}

Serialized interactive elements on the page:
${JSON.stringify(elements, null, 2)}

${structure ? `Page structure (title, headings, landmarks, dialogs):\n${JSON.stringify(structure)}` : ''}

Pick the element index the user should interact with next. Provide a short, friendly tooltip explaining what to do. If the step is complete, set done=true.`,
        },
      ],
      NEXT_STEP_SCHEMA,
      512,
      MODEL_HAIKU // cheap, high-frequency per-step perception
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/next-step]', error);
    return NextResponse.json({ error: 'Engine call failed' }, { status: 500 });
  }
}
