import { invokeStructured, MODEL_HAIKU } from '@/lib/engine';
import type { SerializedElement } from '@ouija/types';

export interface ClassifyResult {
  severity: 'simple' | 'complex';
  reason: string;
  nudge?: string;
}

const CLASSIFY_SCHEMA = {
  type: 'object',
  properties: {
    severity: { enum: ['simple', 'complex'] },
    reason: { type: 'string' },
    nudge: { type: 'string' },
  },
  required: ['severity', 'reason'],
  additionalProperties: false,
};

export async function classifyFailure(
  errorSignal: string,
  nodeInstruction: string,
  elements: SerializedElement[],
  url: string
): Promise<ClassifyResult> {
  return invokeStructured<ClassifyResult>(
    [
      {
        role: 'user',
        content: `You are a failure severity classifier for an onboarding guidance system.

A user is stuck on a step. Classify whether this is a SIMPLE issue (nudge is enough) or COMPLEX (needs investigation).

SIMPLE examples: element is below the fold (user needs to scroll), user hasn't clicked yet, element is in a dropdown they haven't opened.
COMPLEX examples: expected element doesn't exist on the page, URL is completely wrong, an error toast appeared, the page looks nothing like expected.

Current step instruction: "${nodeInstruction}"
Error signal: "${errorSignal}"
Current URL: ${url}
Visible elements on page: ${elements.filter(e => e.visibleInViewport).length} / ${elements.length} total

If SIMPLE, provide a friendly "nudge" message (one sentence, specific). If COMPLEX, leave nudge empty.`,
      },
    ],
    CLASSIFY_SCHEMA,
    256,
    MODEL_HAIKU // simple severity classification
  );
}
