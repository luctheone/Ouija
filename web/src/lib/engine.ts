// Engine — Anthropic Messages API (migrated off AWS Bedrock during the hackathon).
//
// Model split: cheap, high-frequency per-step perception runs on Haiku; the rare
// agentic/reasoning calls (chat, diagnosis, planning, verify) run on Sonnet. Callers
// pass MODEL_HAIKU explicitly for the cheap path; everything defaults to Sonnet.
//
// This is the real engine module. `bedrock.ts` is a deprecated re-export shim kept so
// existing imports keep working; new code should import from '@/lib/engine'.
import Anthropic from '@anthropic-ai/sdk';

export const MODEL_SONNET = 'claude-sonnet-4-6';
export const MODEL_HAIKU = 'claude-haiku-4-5';

// Reads ANTHROPIC_API_KEY from the environment.
export const anthropic = new Anthropic();

/**
 * Forced-tool structured output. The model is required to call `structured_output`
 * with data matching `schema`, and we return that validated input object.
 */
export async function invokeStructured<T>(
  messages: { role: string; content: string }[],
  schema: Record<string, unknown>,
  maxTokens = 512,
  model: string = MODEL_SONNET
): Promise<T> {
  const toolName = 'structured_output';
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: 'You must respond by calling the structured_output tool with the requested data. Do not respond with text.',
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    tools: [
      {
        name: toolName,
        description: 'Return the structured response',
        input_schema: schema as Anthropic.Tool['input_schema'],
      },
    ],
    tool_choice: { type: 'tool', name: toolName },
  });

  const toolUseBlock = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
  );
  if (!toolUseBlock) throw new Error('No tool_use block in response');

  // Runtime re-validation: the SDK does not check the returned tool input
  // against input_schema, so a malformed object would otherwise be cast straight to T. Verify
  // the schema's required keys are present and fail loudly instead of returning a bad shape.
  assertRequiredKeys(toolUseBlock.input, schema);

  return toolUseBlock.input as T;
}

/** Minimal structural guard: every key in schema.required must be present (non-undefined). */
function assertRequiredKeys(input: unknown, schema: Record<string, unknown>): void {
  const required = schema?.required;
  if (!Array.isArray(required) || required.length === 0) return;
  if (input === null || typeof input !== 'object') {
    throw new Error('Structured output is not an object');
  }
  const obj = input as Record<string, unknown>;
  const missing = required.filter((k) => typeof k === 'string' && obj[k] === undefined);
  if (missing.length > 0) {
    throw new Error(`Structured output missing required field(s): ${missing.join(', ')}`);
  }
}

export type ConversationMessage = Anthropic.MessageParam;

export type ToolDefinition = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

/**
 * Multi-turn agentic tool loop. Runs the model with the given tools, dispatches each
 * tool call to its handler, feeds results back, and loops until end_turn (or maxTurns).
 */
export async function converseWithTools(
  systemPrompt: string,
  messages: ConversationMessage[],
  tools: ToolDefinition[],
  toolHandlers: Record<string, (input: any) => Promise<string>>,
  maxTurns = 10,
  model: string = MODEL_SONNET
): Promise<string> {
  const conversation: Anthropic.MessageParam[] = [...messages];

  const anthropicTools: Anthropic.Tool[] = tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema as Anthropic.Tool['input_schema'],
  }));

  for (let turn = 0; turn < maxTurns; turn++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: conversation,
      tools: anthropicTools,
    });

    conversation.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'tool_use') {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        const handler = toolHandlers[block.name];
        const result = handler
          ? await handler(block.input)
          : `Unknown tool: ${block.name}`;
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
      conversation.push({ role: 'user', content: toolResults });
      continue;
    }

    if (response.stop_reason === 'end_turn' || response.stop_reason === 'stop_sequence') {
      const textBlock = response.content.find(
        (b): b is Anthropic.TextBlock => b.type === 'text'
      );
      return textBlock?.text ?? '';
    }

    // max_tokens / refusal / pause_turn — stop rather than re-loop on a partial message.
    break;
  }

  // Fallback: return the last assistant text if the loop exited without a clean end_turn.
  const lastAssistant = [...conversation].reverse().find((m) => m.role === 'assistant');
  if (lastAssistant && Array.isArray(lastAssistant.content)) {
    const textBlock = lastAssistant.content.find(
      (b): b is Anthropic.TextBlockParam => (b as any).type === 'text'
    );
    if (textBlock && 'text' in textBlock) return textBlock.text;
  }

  throw new Error('converseWithTools exceeded maxTurns without final response');
}
