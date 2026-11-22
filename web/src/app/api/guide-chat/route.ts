import { NextRequest } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { anthropic, MODEL_SONNET } from '@/lib/engine';
import { requireSession, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';
import Exa from 'exa-js';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  message: z.string(),
  elements: z.array(z.any()).optional(),
  url: z.string().optional(),
  position: z.string().optional(),
  step_instruction: z.string().optional(),
  graph: z.any().optional(),
  structure: z.record(z.unknown()).optional(),
  diff: z.any().optional(),
  pendingScreenshot: z.string().optional(),
  pendingPageState: z.any().optional(),
  clipboard: z.array(z.any()).optional(),
});

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'capture_screenshot',
    description: "Capture a screenshot of the user's current browser tab. Call this when you need to visually see the page — e.g. when DOM elements alone are insufficient to understand the state, when a modal might be open, or when the user asks you to look at their screen.",
    input_schema: { type: 'object', properties: { reason: { type: 'string', description: 'Why you need the screenshot' } }, required: ['reason'] },
  },
  {
    name: 'highlight_element',
    description: 'Highlight a specific interactive element on the page with a visual overlay and tooltip. Call this to show the user exactly where to click/type.',
    input_schema: { type: 'object', properties: { element_index: { type: 'integer', description: 'Index of the element from the interactive elements list' }, tooltip: { type: 'string', description: 'Short tooltip text to show (e.g. "Click this button")' } }, required: ['element_index', 'tooltip'] },
  },
  {
    name: 'search_docs',
    description: 'Search the web for documentation about the current software/step. Call this when you are unsure about how a feature works, where a button is located, or need to verify current UI layout. Uses Exa search.',
    input_schema: { type: 'object', properties: { query: { type: 'string', description: 'Search query (e.g. "Shopify customer events settings location 2025")' } }, required: ['query'] },
  },
  {
    name: 'check_page_state',
    description: "Get a fresh snapshot of the page's interactive elements, structure, and what changed since last check. Call this after the user says they did something, to see the current state.",
    input_schema: { type: 'object', properties: { reason: { type: 'string', description: 'Why you need a fresh snapshot' } }, required: ['reason'] },
  },
  {
    name: 'respond_to_user',
    description: 'Send your final response to the user. Call this when you have enough information to give a helpful answer. This ENDS the conversation turn.',
    input_schema: { type: 'object', properties: { message: { type: 'string', description: 'Your response to the user (1-4 sentences, warm, specific, non-technical)' } }, required: ['message'] },
  },
];

const SYSTEM_PROMPT = `You are Ouija, an AI guide helping a non-technical user through software onboarding. You have tools to perceive the page and assist the user.

IMPORTANT RULES:
- You MUST call respond_to_user as your final action to send a message to the user.
- You can call other tools first to gather information, then respond_to_user.
- Be concise (1-4 sentences in your response). Warm, specific, non-technical.
- If the user needs to navigate somewhere, provide the full URL.
- If you can help them find something on the page, use highlight_element.
- If you're unsure about the current page state, call check_page_state or capture_screenshot.
- Stay focused on the current onboarding step. Don't get distracted.
- You CAN see the page structure and elements. You CAN take screenshots. You CAN search docs.
- Never tell the user you can't see their screen — you CAN, via your tools.`;

export async function POST(req: NextRequest) {
  try {
    const s = requireSession(req);
    if (isResponse(s)) return s;
    if (!rateLimit('guide-chat:' + s.sid, 60)) return tooMany();

    const body = await parseBody(req, BodySchema);
    if (isResponse(body)) return body;
    const { message, elements, url, position, step_instruction, graph, structure, diff, pendingScreenshot, pendingPageState, clipboard } = body;

    const currentNode = graph?.nodes?.find((n: any) => n.id === position);
    const targetSite = currentNode?.site || '';

    const contextBlock = `Current step: "${step_instruction || 'none'}"
Target site: ${targetSite || 'unknown'}
User is on: ${url || 'unknown'}
${targetSite && url && !url.includes(targetSite) ? `⚠️ User is NOT on the correct site. They need: https://${targetSite}` : ''}

Interactive elements (${elements?.length || 0} found):
${elements ? JSON.stringify(elements.slice(0, 20), null, 1) : '[]'}

Page structure:
${structure ? JSON.stringify(structure) : 'not available'}

What changed since last action:
${diff ? JSON.stringify(diff) : 'nothing detected'}

${clipboard?.length ? `Ouija clipboard (credentials the user has copied this session):\n${clipboard.map((c: any) => `- ${c.label}: ${c.preview}`).join('\n')}` : 'Clipboard: empty'}

${graph ? `Journey: ${graph.nodes?.map((n: any) => (n.id === position ? '→' : '') + n.instruction + ' (' + n.site + ')').join(' | ')}` : ''}`;

    const userContent: Anthropic.ContentBlockParam[] = [];
    if (pendingScreenshot) {
      const base64Data = pendingScreenshot.replace(/^data:image\/\w+;base64,/, '');
      userContent.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Data } });
    }
    userContent.push({ type: 'text', text: `${contextBlock}\n\nUser says: "${message}"` });

    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userContent }];

    let finalResponse = '';
    let requestScreenshot = false;
    const toolResults: { highlight?: { element_index: number; tooltip: string } } = {};

    for (let turn = 0; turn < 5; turn++) {
      const response = await anthropic.messages.create({
        model: MODEL_SONNET,
        max_tokens: 1024,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages,
        tools: TOOLS,
      });

      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'end_turn') {
        const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
        finalResponse = textBlock?.text || finalResponse;
        break;
      }

      if (response.stop_reason !== 'tool_use') break;

      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        const input = block.input as any;
        let resultText = '';

        switch (block.name) {
          case 'respond_to_user':
            finalResponse = input.message;
            resultText = 'Response delivered to user.';
            break;
          case 'capture_screenshot':
            if (pendingScreenshot) {
              resultText = 'Screenshot already provided in the initial message. Analyze the image above.';
            } else {
              requestScreenshot = true;
              resultText = 'Capturing screenshot — the client will retry with the image attached.';
            }
            break;
          case 'highlight_element':
            toolResults.highlight = { element_index: input.element_index, tooltip: input.tooltip };
            resultText = `Element ${input.element_index} highlighted with tooltip: "${input.tooltip}"`;
            break;
          case 'search_docs': {
            try {
              const exa = new Exa(process.env.EXA_API_KEY!);
              const searchResults = await exa.searchAndContents(input.query, {
                type: 'auto', numResults: 3,
                text: { maxCharacters: 3000, includeHtmlTags: false },
              });
              resultText = searchResults.results?.map((r) => `${r.title}: ${r.text?.slice(0, 800)}`).join('\n---\n') || 'No results found.';
            } catch {
              resultText = 'Search failed. Respond based on your existing knowledge.';
            }
            break;
          }
          case 'check_page_state':
            resultText = pendingPageState
              ? JSON.stringify(pendingPageState)
              : `Current state already provided above: ${elements?.length || 0} elements, structure available. Analyze what's there.`;
            break;
          default:
            resultText = `Unknown tool: ${block.name}`;
        }

        results.push({ type: 'tool_result', tool_use_id: block.id, content: resultText });
      }

      messages.push({ role: 'user', content: results });

      // Model asked to see the screen and we have no image yet — bail so the client
      // can re-call with a screenshot, rather than answering blind.
      if (requestScreenshot) break;
      if (finalResponse) break;
    }

    return new Response(JSON.stringify({
      message: finalResponse || 'I need a moment to think about this.',
      highlight: toolResults.highlight || null,
      screenshot_needed: requestScreenshot && !pendingScreenshot,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[/api/guide-chat]', error);
    return new Response(JSON.stringify({ error: 'Guide chat failed', detail: error?.message || String(error) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
