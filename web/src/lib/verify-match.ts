// verify-match — pure, reusable fast-path matcher for journey-node verify conditions.
//
// Mirrors the extension's local verification (extension/src/content.ts → requestVerify):
// simple "URL contains X" and "clipboard contains X" conditions are evaluated locally
// (case-insensitive) so the runtime can skip the LLM call. Anything else is not locally
// evaluable and the caller must fall back to the model.
//
// Extracted here so the backend has a tested version of logic that previously lived
// only in the (untested) content script.

export interface ClipboardItem {
  label: string;
  value: string;
}

export interface MatchContext {
  url: string;
  clipboard?: ClipboardItem[];
}

export interface MatchResult {
  local: boolean;
  completed?: boolean;
}

/**
 * Mirrors the extension's local fast-path: "URL contains X" and "clipboard contains X"
 * (case-insensitive). Returns {local:true, completed} when the condition is locally
 * evaluable, else {local:false} (caller must fall back to the LLM).
 */
export function matchVerifyCondition(condition: string, ctx: MatchContext): MatchResult {
  const urlMatch = condition.match(/^URL contains (.+)$/i);
  if (urlMatch) {
    const target = urlMatch[1].trim().toLowerCase();
    return { local: true, completed: ctx.url.toLowerCase().includes(target) };
  }

  const clipMatch = condition.match(/^clipboard contains (.+)$/i);
  if (clipMatch) {
    const target = clipMatch[1].trim().toLowerCase();
    const items = ctx.clipboard ?? [];
    const completed = items.some(
      (item) =>
        item.label.toLowerCase().includes(target) ||
        item.value.toLowerCase().includes(target)
    );
    return { local: true, completed };
  }

  return { local: false };
}
