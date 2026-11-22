import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { invokeStructured, MODEL_HAIKU, MODEL_SONNET } from '@/lib/engine';
import { requireSession, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';
import type { VerifyResponse } from '@ouija/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  elements: z.array(z.any()),
  expected_condition: z.string(),
  url: z.string(),
  structure: z.record(z.unknown()).optional(),
});

// Verify is a high-frequency per-step perception call → run it on cheap Haiku, and only
// ESCALATE to Sonnet when Haiku is not confident. A false "completed" advances the user past a
// step they didn't finish, so the model must self-report confidence; below the floor we pay for
// the second opinion. (Unit-economics doctrine — keep per-step calls cheap.)
const CONFIDENCE_FLOOR = 0.75;

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    completed: { type: 'boolean' },
    evidence: { type: 'string' },
    confidence: { type: 'number', description: '0.0–1.0: how sure you are about `completed`.' },
    newUrl: { type: 'string' },
  },
  required: ['completed', 'evidence', 'confidence'],
  additionalProperties: false,
};

type VerifyOut = VerifyResponse & { confidence?: number };

export async function POST(req: NextRequest) {
  try {
    const s = requireSession(req);
    if (isResponse(s)) return s;
    if (!rateLimit('verify:' + s.sid, 240)) return tooMany();

    const body = await parseBody(req, BodySchema);
    if (isResponse(body)) return body;
    const { elements, expected_condition, url, structure } = body;

    const messages = [
      {
        role: 'user',
        content: `You are verifying whether a user completed an onboarding step.

Expected completion condition: ${expected_condition}
Current URL: ${url}

Current interactive elements on the page:
${JSON.stringify(elements, null, 2)}

${structure ? `Page structure (title, headings, active dialog, landmarks):\n${JSON.stringify(structure)}` : ''}

Did the user complete this step? Provide evidence from the DOM state, and a confidence (0.0–1.0) for your verdict. Pay special attention to activeDialog — if a modal/dialog is open it may indicate a confirmation step.`,
      },
    ];

    // Cheap first pass on Haiku.
    let result = await invokeStructured<VerifyOut>(messages, VERIFY_SCHEMA, 512, MODEL_HAIKU);

    // Escalate to Sonnet only when Haiku isn't sure — the clear-cut majority stay cheap.
    if (typeof result.confidence === 'number' && result.confidence < CONFIDENCE_FLOOR) {
      result = await invokeStructured<VerifyOut>(messages, VERIFY_SCHEMA, 512, MODEL_SONNET);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/verify]', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
