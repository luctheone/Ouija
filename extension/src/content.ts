// Content script — DOM serialization, overlay rendering, SPA nav intercept
// Light and vanilla — heavy React only in the sidebar iframe.

import type { SerializedElement, ExtensionMessage, NextStepResponse } from '../../web/src/types';
import { detectScheme, schemeToVars } from './theme';

// ── Safe chrome wrapper (prevents "Extension context invalidated" errors) ────

function safeChrome(fn: () => void) {
  try { fn(); } catch (e) {
    if (!(e instanceof Error && e.message.includes('Extension context invalidated'))) {
      console.warn('[Ouija]', e);
    }
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 320;
const SIDEBAR_GAP = 8;
const BACKEND_URL = process.env.OUIJA_BACKEND_URL || '';

const OUIJA_IDS = [
  'ouija-sidebar-root',
  'ouija-step-overlay',
  'ouija-highlight',
  'ouija-style',
  'ouija-bubble',
];

const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  "input:not([type='hidden'])",
  'textarea',
  'select',
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "[role='menuitem']",
].join(', ');

// ── Structural context interfaces ────────────────────────────────────────────

interface PageStructure {
  title: string;
  url: string;
  breadcrumbs: string[];
  headings: string[];
  landmarks: string[];
  activeDialog: {
    title: string;
    elements: string[];
  } | null;
  activeSection: string;
}

interface DomDiff {
  added: string[];
  removed: string[];
}

// ── State ─────────────────────────────────────────────────────────────────────

let lastElementTexts: Set<string> = new Set();
let sidebarContainer: HTMLDivElement | null = null;
let graphPanelContainer: HTMLDivElement | null = null;
let expanded = true;
let sidebarHidden = false;
let graphPanelHidden = false;
let graphPanelWasOpen = false;
let graphPanelOpen = false;
let sidebarSide: 'right' | 'left' = 'right';
// UI chameleon — the matched scheme's accent hue/chroma, used to recolor host-page overlays
// (highlight spotlight + clipboard panel) to harmonize with the site. Default = Reliquary amber.
let schemeHue = 35;
let schemeChroma = 0.18;
let schemeMode: 'light' | 'dark' = 'dark';
// Once a real host scan has run, a stale cached scheme must NOT clobber it (the cache write is
// async, so a late applyCachedScheme could otherwise re-apply the previous visit's mode).
let chameleonScanned = false;
let highlightEl: HTMLDivElement | null = null;
let trackedEl: Element | null = null;
let scrollHandler: (() => void) | null = null;
let resizeHandler: (() => void) | null = null;
let mutationObserver: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let analysisAbortController: AbortController | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let backendUrl = '';
let currentApiKey = '';
let ouijaToken = '';

// Every backend call must carry the session token (issued by /api/sessions/start).
function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ouijaToken) h['X-Ouija-Token'] = ouijaToken;
  return h;
}
let currentStepInstruction = '';
let currentGraphPosition = '';
let ouijaClipboardItems: { label: string; value: string }[] = [];
let clipboardLoaded = false;

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function dedupeClipboard(items: { label: string; value: string }[]): { label: string; value: string }[] {
  const seen = new Set<string>();
  const out: { label: string; value: string }[] = [];
  for (const it of items) {
    if (!it || seen.has(it.value)) continue;
    seen.add(it.value);
    out.push(it);
  }
  return out;
}

// Clipboard is EPHEMERAL by contract (PDPA): items live only in chrome.storage.session
// (gone on browser close), are dropped after a TTL of inactivity, and are cleared on flow
// completion / disconnect. This makes the "cleared after your session" claim true in code.
const CLIPBOARD_TTL_MS = 30 * 60 * 1000; // 30 minutes since last copy

function loadClipboardFromStorage(): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clipboardLoaded = true;
      resolve();
    };
    // Safety net: never hang if chrome.storage.session is inaccessible from this
    // context or the callback simply never fires (the bug this guards against).
    const timer = setTimeout(done, 800);
    try {
      chrome.storage.session.get(['ouija_clipboard_items', 'ouija_clipboard_savedAt'], (result) => {
        clearTimeout(timer);
        const savedAt = Number(result?.ouija_clipboard_savedAt || 0);
        const expired = savedAt > 0 && Date.now() - savedAt > CLIPBOARD_TTL_MS;
        if (expired) {
          // TTL elapsed — purge stale credentials rather than resurrect them.
          ouijaClipboardItems = [];
          try { chrome.storage.session.remove(['ouija_clipboard_items', 'ouija_clipboard_savedAt']); } catch {}
        } else if (!chrome.runtime.lastError && result?.ouija_clipboard_items?.length) {
          // Merge, never replace — a just-copied in-memory item must not be lost to a
          // storage read that raced behind it (see the onChanged listener note).
          ouijaClipboardItems = dedupeClipboard(ouijaClipboardItems.concat(result.ouija_clipboard_items));
        }
        done();
      });
    } catch {
      clearTimeout(timer);
      done();
    }
  });
}

loadClipboardFromStorage();

function persistClipboard() {
  try {
    chrome.storage.session.set({
      ouija_clipboard_items: ouijaClipboardItems,
      ouija_clipboard_savedAt: Date.now(), // rolling TTL — refreshed on every copy
    });
  } catch {}
}

// Clear all clipboard state — in-memory, storage, and the visible panel. Called on flow
// completion (CLEAR_CLIPBOARD from the sidebar) and on disconnect (AUTH_CLEARED).
function clearClipboard() {
  ouijaClipboardItems = [];
  try { chrome.storage.session.remove(['ouija_clipboard_items', 'ouija_clipboard_savedAt']); } catch {}
  if (clipboardPanelContainer) renderClipboardItems();
}

// Sync clipboard from sidebar (which also persists) in case postMessage was missed
try {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'session' && changes.ouija_clipboard_items?.newValue) {
      // MERGE (union), never replace — two near-simultaneous copies (e.g. the AWS
      // "Copy credentials" button) race the storage sync, and a stale single-item write
      // landing last would otherwise drop the other item from the list the verify checks.
      ouijaClipboardItems = dedupeClipboard(ouijaClipboardItems.concat(changes.ouija_clipboard_items.newValue));
      clipboardLoaded = true;
      if (clipboardPanelContainer) renderClipboardItems();
    }
  });
} catch {}

// ── Element extraction (validated on Meta Business Suite) ──────────────────────

function isOuijaElement(el: Element): boolean {
  return OUIJA_IDS.some((id) => el.closest(`#${id}`) !== null);
}

function isHidden(el: Element): boolean {
  const s = window.getComputedStyle(el);
  return s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0;
}

function getElementType(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (tag === 'a') return 'link';
  if (tag === 'button') return 'button';
  if (tag === 'input') return 'input';
  if (tag === 'textarea') return 'input';
  if (tag === 'select') return 'select';
  return el.getAttribute('role') || tag;
}

function getNearbyLabel(el: Element): string {
  const id = (el as HTMLElement).id;
  if (id) {
    try {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (label) return (label.textContent || '').trim().slice(0, 80);
    } catch { /* CSS.escape may not exist */ }
  }
  const parentLabel = el.closest('label');
  if (parentLabel) {
    const clone = parentLabel.cloneNode(true) as HTMLElement;
    clone.querySelector('input, textarea, select')?.remove();
    return (clone.textContent || '').trim().slice(0, 80);
  }
  const prev = el.previousElementSibling;
  if (prev?.tagName === 'LABEL') return (prev.textContent || '').trim().slice(0, 80);
  return '';
}

// ── PII / secret redaction (P0 — values must never leave the browser unredacted) ──
//
// We ship element *text* to the backend → Anthropic so the model can pick the right element.
// For inputs that means the field's value could leak. Redact two ways:
//   1. by field metadata (type/name/id/autocomplete/aria-label matching credential/PII words)
//   2. by value SHAPE (an email/card/SSN/token-looking value, regardless of field metadata)
// Sensitive → send a presence marker ('••• (redacted)') so verify conditions like "field has
// a value" still work, but never the value. All values are length-capped before they leave.
const MAX_VALUE_LEN = 60;
const SENSITIVE_META = /pass|secret|token|cvv|card|ssn|social.?security|routing|iban|swift|sort.?code|\botp\b|\bpin\b|\bkey\b|\bapi\b|account|\bemail\b|\bphone\b|\btel\b|\bdob\b|birth/;

function valueLooksSensitive(v: string): boolean {
  const s = v.trim();
  if (!s) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return true;            // email
  if (/^(?:\d[ -]?){13,19}$/.test(s)) return true;                   // card-like (13–19 digits)
  if (/^\d{3}-\d{2}-\d{4}$/.test(s)) return true;                    // US SSN
  if (/\b(sk|pk|rk)_[A-Za-z0-9]/.test(s) || s.startsWith('eyJ')) return true; // secret prefix / JWT
  if (s.length >= 24 && !/\s/.test(s) && /[A-Za-z]/.test(s) && /\d/.test(s)) return true; // long token
  return false;
}

function redactInputValue(inp: HTMLInputElement): string {
  const meta = `${inp.type} ${inp.name || ''} ${inp.id || ''} ${inp.autocomplete || ''} ${inp.getAttribute('aria-label') || ''}`.toLowerCase();
  const raw = inp.value || inp.defaultValue || '';
  const sensitive =
    inp.type === 'password' ||
    inp.type === 'email' ||
    inp.type === 'tel' ||
    SENSITIVE_META.test(meta) ||
    valueLooksSensitive(raw);
  if (sensitive) return raw ? '••• (redacted)' : '';
  return raw.slice(0, MAX_VALUE_LEN);
}

function extractInteractiveElements(): SerializedElement[] {
  const nodes = Array.from(document.querySelectorAll(INTERACTIVE_SELECTOR));
  const elements: SerializedElement[] = [];
  let index = 0;

  for (const el of nodes) {
    if (elements.length >= 40) break;
    if (isOuijaElement(el) || isHidden(el)) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const tag = el.tagName.toLowerCase();
    let text = '';
    if (tag === 'input') {
      text = redactInputValue(el as HTMLInputElement);
    } else if (tag === 'select') {
      text = ((el as HTMLSelectElement).selectedOptions[0]?.text || '').slice(0, MAX_VALUE_LEN);
    } else {
      text = (el.textContent || '').trim();
    }

    elements.push({
      index,
      type: getElementType(el),
      text: text.slice(0, 80),
      id: (el as HTMLElement).id || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      placeholder: (el as HTMLInputElement).placeholder || '',
      nearbyLabel: getNearbyLabel(el),
      visibleInViewport:
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0,
    });
    index++;
  }

  return elements;
}

// ── Page structure extraction (lightweight structural map for LLM context) ───

function extractPageStructure(): PageStructure {
  // Headings: visible h1-h6
  const headingEls = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  const headings: string[] = [];
  for (const h of headingEls) {
    if (isHidden(h)) continue;
    const txt = (h.textContent || '').trim().slice(0, 60);
    if (txt) headings.push(txt);
  }

  // Breadcrumbs
  const breadcrumbs: string[] = [];
  const breadcrumbNav = document.querySelector(
    'nav[aria-label*="breadcrumb"], nav[aria-label*="Breadcrumb"], ol.breadcrumb, [class*="breadcrumb"]'
  );
  if (breadcrumbNav) {
    const items = breadcrumbNav.querySelectorAll('li, a');
    items.forEach((item) => {
      const txt = (item.textContent || '').trim().slice(0, 40);
      if (txt && !breadcrumbs.includes(txt)) breadcrumbs.push(txt);
    });
  }

  // Landmarks
  const landmarks: string[] = [];
  const landmarkEls = document.querySelectorAll(
    'main,[role="main"],nav,[role="navigation"],aside,[role="complementary"],header,[role="banner"],footer,[role="contentinfo"]'
  );
  for (const el of Array.from(landmarkEls)) {
    if (isOuijaElement(el)) continue;
    const label = el.getAttribute('aria-label');
    if (label) {
      landmarks.push(label.slice(0, 50));
    } else {
      const heading = el.querySelector('h1,h2,h3');
      const txt = heading ? (heading.textContent || '').trim().slice(0, 50) : el.tagName.toLowerCase();
      landmarks.push(txt);
    }
  }

  // Active dialog/modal
  let activeDialog: PageStructure['activeDialog'] = null;
  const dialogEl = document.querySelector(
    'dialog[open],[role="dialog"],[class*="modal"].show,[class*="modal"][style*="display: block"],[class*="modal"][style*="display:block"]'
  );
  if (dialogEl && !isHidden(dialogEl)) {
    const dialogHeading = dialogEl.querySelector('h1,h2,h3,h4');
    const title = dialogHeading ? (dialogHeading.textContent || '').trim().slice(0, 60) : '';
    const interactiveInDialog = Array.from(dialogEl.querySelectorAll(INTERACTIVE_SELECTOR));
    const elements: string[] = [];
    for (const el of interactiveInDialog.slice(0, 10)) {
      const txt = (el.textContent || '').trim().slice(0, 40) || el.getAttribute('aria-label') || '';
      if (txt) elements.push(txt);
    }
    activeDialog = { title, elements };
  }

  // Active section: heading closest to viewport center
  let activeSection = '';
  const viewportCenter = window.innerHeight / 2;
  let minDist = Infinity;
  for (const h of headingEls) {
    if (isHidden(h)) continue;
    const rect = h.getBoundingClientRect();
    const dist = Math.abs(rect.top + rect.height / 2 - viewportCenter);
    if (dist < minDist) {
      minDist = dist;
      activeSection = (h.textContent || '').trim().slice(0, 60);
    }
  }

  return {
    title: document.title.slice(0, 100),
    url: window.location.href,
    breadcrumbs: breadcrumbs.slice(0, 8),
    headings: headings.slice(0, 12),
    landmarks: landmarks.slice(0, 8),
    activeDialog,
    activeSection,
  };
}

// ── DOM diff (tracks what changed since last extraction) ─────────────────────

function extractDomDiff(elements: SerializedElement[]): DomDiff {
  const currentTexts = new Set<string>();
  for (const el of elements) {
    const key = `${el.type}|${el.text}|${el.ariaLabel}`;
    currentTexts.add(key);
  }

  const added: string[] = [];
  const removed: string[] = [];

  for (const key of currentTexts) {
    if (!lastElementTexts.has(key)) {
      added.push(key.split('|').slice(1).filter(Boolean).join(' - ') || key);
    }
  }

  for (const key of lastElementTexts) {
    if (!currentTexts.has(key)) {
      removed.push(key.split('|').slice(1).filter(Boolean).join(' - ') || key);
    }
  }

  lastElementTexts = currentTexts;

  return {
    added: added.slice(0, 10),
    removed: removed.slice(0, 5),
  };
}

function findElementByIndex(targetIndex: number): Element | null {
  const nodes = Array.from(document.querySelectorAll(INTERACTIVE_SELECTOR));
  let index = 0;

  for (const el of nodes) {
    if (index > 40) break;
    if (isOuijaElement(el) || isHidden(el)) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    if (index === targetIndex) return el;
    index++;
  }
  return null;
}

// ── Core loop: request guidance from backend ──────────────────────────────────

async function requestGuidance() {
  if (!backendUrl || !currentApiKey) return;

  // Check if we're on the correct site for the current node
  const siteCheckResult = await checkCurrentSiteMatch();
  if (siteCheckResult === false) return; // WRONG_PAGE was sent to sidebar

  analysisAbortController?.abort();
  analysisAbortController = new AbortController();
  const signal = analysisAbortController.signal;

  postToSidebar({ type: 'ANALYSIS_STATUS', status: 'analyzing' });

  try {
    const elements = extractInteractiveElements();
    if (elements.length === 0) {
      postToSidebar({ type: 'ANALYSIS_STATUS', status: 'idle' });
      return;
    }

    const structure = extractPageStructure();

    const res = await fetch(`${backendUrl}/api/next-step`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        elements,
        graph: null,
        position: currentGraphPosition,
        step_instruction: currentStepInstruction,
        structure,
      }),
      signal,
    });

    if (!res.ok || signal.aborted) {
      if (!signal.aborted) postToSidebar({ type: 'ANALYSIS_STATUS', status: 'error' });
      return;
    }

    const result: NextStepResponse = await res.json();
    if (signal.aborted) return;

    if (result.done) {
      removeHighlight();
      postToSidebar({ type: 'STEP_DONE', result });
      return;
    }

    // Double-check hostname before highlighting (in case nav happened during fetch)
    const postFetchCheck = await checkCurrentSiteMatch();
    if (postFetchCheck === false) return;

    highlightElement(result.elementIndex, result.tooltip);
    postToSidebar({ type: 'GUIDANCE_RESULT', result });
    checkPositionConflict();
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      postToSidebar({ type: 'ANALYSIS_STATUS', status: 'error' });
    }
  }
}

async function checkCurrentSiteMatch(): Promise<boolean> {
  const stored = await new Promise<{ ouija_graph?: any; ouija_position?: string }>((resolve) => {
    try {
      chrome.storage.local.get(['ouija_graph', 'ouija_position'], (result) => resolve(result));
    } catch { resolve({}); }
  });

  const graph = stored.ouija_graph;
  // Prefer the position the sidebar just handed us (set synchronously on the
  // REQUEST_GUIDANCE / JOURNEY_UPDATE message) over chrome.storage, which can lag a
  // step behind right after an advance — otherwise we'd evaluate the PREVIOUS node's
  // site and miss a cross-site transition (e.g. nav_2's Shopify gate while on Meta).
  const position = currentGraphPosition || stored.ouija_position;
  if (!graph || !position) return true; // No graph loaded, allow

  const currentNode = graph.nodes?.find((n: any) => n.id === position);
  if (!currentNode || !currentNode.site) return true; // No site constraint

  const currentHostname = window.location.hostname;
  const expectedSite = currentNode.site;

  // Check hostname match (bidirectional includes for flexibility)
  if (!currentHostname.includes(expectedSite) && !expectedSite.includes(currentHostname)) {
    postToSidebar({
      type: 'WRONG_PAGE',
      expected_site: expectedSite,
      current_site: currentHostname,
    });
    return false;
  }

  // If expectedSite contains a path, also validate the path
  const slashIdx = expectedSite.indexOf('/');
  if (slashIdx !== -1) {
    const expectedPath = expectedSite.slice(slashIdx);
    if (!window.location.pathname.startsWith(expectedPath)) {
      postToSidebar({
        type: 'WRONG_PAGE',
        expected_site: expectedSite,
        current_site: currentHostname + window.location.pathname,
      });
      return false;
    }
  }

  return true;
}

async function requestVerify(verifyCondition: string) {
  if (!backendUrl) return;

  // Local verification for simple URL-based conditions (skip LLM call)
  const urlMatch = verifyCondition.match(/URL contains (.+)/i);
  if (urlMatch) {
    const expected = urlMatch[1].trim().toLowerCase();
    const current = window.location.href.toLowerCase();
    if (current.includes(expected)) {
      postToSidebar({ type: 'VERIFY_RESULT', result: { completed: true, evidence: `URL matches: ${expected}` } });
      return;
    } else {
      postToSidebar({ type: 'VERIFY_RESULT', result: { completed: false, evidence: `Expected URL containing "${expected}" but got "${window.location.hostname}"` } });
      return;
    }
  }

  // Local verification for clipboard-based conditions (skip LLM call)
  const clipMatch = verifyCondition.match(/clipboard contains (.+)/i);
  if (clipMatch) {
    // Ensure clipboard is loaded from storage before checking
    if (!clipboardLoaded) await loadClipboardFromStorage();
    const expected = clipMatch[1].trim().toLowerCase();
    const found = ouijaClipboardItems.some(item => item.label.toLowerCase().includes(expected) || item.value.toLowerCase().includes(expected));
    if (found) {
      postToSidebar({ type: 'VERIFY_RESULT', result: { completed: true, evidence: `Clipboard contains: ${expected}` } });
      return;
    } else {
      postToSidebar({ type: 'VERIFY_RESULT', result: { completed: false, evidence: `Clipboard does not contain "${expected}". Items: ${ouijaClipboardItems.map(i => i.label).join(', ') || 'empty'}` } });
      return;
    }
  }

  // For complex conditions, ask the LLM
  try {
    const elements = extractInteractiveElements();
    const structure = extractPageStructure();
    const res = await fetch(`${backendUrl}/api/verify`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        elements,
        expected_condition: verifyCondition,
        url: window.location.href,
        structure,
      }),
    });

    if (!res.ok) {
      postToSidebar({ type: 'VERIFY_RESULT', result: { completed: false, evidence: 'Verification request failed' } });
      return;
    }

    const result = await res.json();
    postToSidebar({ type: 'VERIFY_RESULT', result });
  } catch {
    postToSidebar({ type: 'VERIFY_RESULT', result: { completed: false, evidence: 'Network error' } });
  }
}

async function requestDiagnosis(errorSignal: string) {
  if (!backendUrl) {
    postToSidebar({ type: 'DIAGNOSIS_RESULT', result: { error: true } });
    return;
  }

  try {
    const elements = extractInteractiveElements();

    // Read graph and position from chrome.storage.local
    const stored = await new Promise<{ ouija_graph?: any; ouija_position?: string; ouija_session?: string; ouija_flow?: string }>((resolve) => {
      try {
        chrome.storage.local.get(['ouija_graph', 'ouija_position', 'ouija_session', 'ouija_flow'], (result) => resolve(result));
      } catch { resolve({}); }
    });

    const graph = stored.ouija_graph || null;
    const position = stored.ouija_position || currentGraphPosition;
    const currentNode = graph?.nodes?.find((n: any) => n.id === position);

    const res = await fetch(`${backendUrl}/api/diagnose`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        elements,
        graph,
        position,
        error_signal: errorSignal,
        url: window.location.href,
        site: currentNode?.site || '',
        // The flow slug (e.g. "meta-pixel-connect") keys bespoke client/breakpoint
        // docs. Must NOT be the session id — that never matches a docs row.
        task: stored.ouija_flow || '',
      }),
    });

    if (!res.ok) {
      postToSidebar({ type: 'DIAGNOSIS_RESULT', result: { error: true } });
      return;
    }

    const result = await res.json();
    postToSidebar({ type: 'DIAGNOSIS_RESULT', result });
  } catch {
    postToSidebar({ type: 'DIAGNOSIS_RESULT', result: { error: true } });
  }
}

// ── Chat with Ouija (streaming) ──────────────────────────────────────────────

let chatInFlight = false;
async function requestChat(message: string) {
  if (!backendUrl || !message) {
    postToSidebar({ type: 'CHAT_DONE' });
    return;
  }
  if (chatInFlight) return; // Prevent duplicate requests
  chatInFlight = true;

  try {
    const elements = extractInteractiveElements();

    const stored = await new Promise<{ ouija_graph?: any; ouija_position?: string }>((resolve) => {
      try {
        chrome.storage.local.get(['ouija_graph', 'ouija_position'], (result) => resolve(result));
      } catch { resolve({}); }
    });

    const graph = stored.ouija_graph || null;
    const position = stored.ouija_position || currentGraphPosition;

    const structure = extractPageStructure();
    const diff = extractDomDiff(elements);

    console.log('[Ouija Chat] Calling:', backendUrl + '/api/guide-chat', { message, url: window.location.href, position });

    const res = await fetch(`${backendUrl}/api/guide-chat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        message,
        elements: elements.slice(0, 20),
        url: window.location.href,
        position,
        step_instruction: currentStepInstruction,
        graph,
        structure,
        diff,
        clipboard: ouijaClipboardItems.length > 0 ? ouijaClipboardItems.map(i => ({ label: i.label, preview: i.value.slice(0, 12) + '...' })) : undefined,
      }),
    });

    console.log('[Ouija Chat] Response status:', res.status);

    if (!res.ok) {
      postToSidebar({ type: 'CHAT_DONE' });
      return;
    }

    const result = await res.json();
    console.log('[Ouija Chat] Result:', result);

    // If the model requested a screenshot and we don't have one, retry with screenshot
    if (result.screenshot_needed) {
      console.log('[Ouija Chat] Model needs screenshot, capturing...');
      const screenshot = await captureScreenshot();
      if (screenshot) {
        // Retry with screenshot
        const retryRes = await fetch(`${backendUrl}/api/guide-chat`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            message,
            elements: elements.slice(0, 20),
            url: window.location.href,
            position,
            step_instruction: currentStepInstruction,
            graph,
            structure,
            diff,
            pendingScreenshot: screenshot,
          }),
        });
        if (retryRes.ok) {
          const retryResult = await retryRes.json();
          if (retryResult.message) {
            postToSidebar({ type: 'CHAT_STREAM', text: retryResult.message });
          }
          if (retryResult.highlight) {
            highlightElement(retryResult.highlight.element_index, retryResult.highlight.tooltip);
          }
        }
      }
    } else if (result.message) {
      postToSidebar({ type: 'CHAT_STREAM', text: result.message });
    }

    // Handle highlight tool result
    if (result.highlight) {
      highlightElement(result.highlight.element_index, result.highlight.tooltip);
    }

    postToSidebar({ type: 'CHAT_DONE' });
  } catch (error) {
    console.error('[Ouija Chat] Error:', error);
    postToSidebar({ type: 'CHAT_DONE' });
  } finally {
    chatInFlight = false;
  }
}

// ── Screenshot capture (via background service worker) ───────────────────────

function captureScreenshot(): Promise<string | null> {
  return new Promise((resolve) => {
    const handler = (msg: any) => {
      if (msg.type === 'SCREENSHOT_RESULT') {
        try { chrome.runtime.onMessage.removeListener(handler); } catch {}
        resolve(msg.dataUrl || null);
      }
    };
    try {
      chrome.runtime.onMessage.addListener(handler);
      chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' });
    } catch {
      resolve(null);
      return;
    }
    // Timeout after 5s
    setTimeout(() => {
      try { chrome.runtime.onMessage.removeListener(handler); } catch {}
      resolve(null);
    }, 5000);
  });
}

// ── Visual chat (screenshot + elements for model) ────────────────────────────

let visualChatInFlight = false;
async function requestVisualChat(message: string) {
  if (!backendUrl || !message) {
    postToSidebar({ type: 'CHAT_DONE' });
    return;
  }
  if (visualChatInFlight || chatInFlight) return;
  visualChatInFlight = true;

  try {
    const screenshot = await captureScreenshot();
    const elements = extractInteractiveElements();
    const structure = extractPageStructure();

    console.log('[Ouija Visual] Capturing screenshot, calling guide-chat-visual');

    const res = await fetch(`${backendUrl}/api/guide-chat-visual`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        message,
        screenshot,
        elements: elements.slice(0, 20),
        structure,
        url: window.location.href,
        position: currentGraphPosition,
        step_instruction: currentStepInstruction,
      }),
    });

    if (!res.ok || !res.body) {
      postToSidebar({ type: 'CHAT_DONE' });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      postToSidebar({ type: 'CHAT_STREAM', text: accumulated });
    }

    postToSidebar({ type: 'CHAT_DONE' });
  } catch (error) {
    console.error('[Ouija Visual] Error:', error);
    postToSidebar({ type: 'CHAT_DONE' });
  } finally {
    visualChatInFlight = false;
  }
}

// ── Highlight overlay ─────────────────────────────────────────────────────────

function injectHighlightStyles() {
  if (document.getElementById('ouija-style')) return;
  const style = document.createElement('style');
  style.id = 'ouija-style';
  // Glow tinted to the matched host scheme (chameleon) so the spotlight feels native.
  style.textContent = `
    @keyframes ouija-glow {
      0%, 100% { box-shadow: 0 0 0 0 oklch(0.84 ${schemeChroma} ${schemeHue} / 0.4); }
      50%       { box-shadow: 0 0 12px 4px oklch(0.84 ${schemeChroma} ${schemeHue} / 0.15); }
    }
    #ouija-highlight { animation: ouija-glow 2.5s ease-in-out infinite; }
  `;
  (document.head || document.documentElement).appendChild(style);
}

// Re-tint the glow keyframes when the scheme changes (the spotlight may be live).
function reinjectHighlightStyles() {
  document.getElementById('ouija-style')?.remove();
  if (highlightEl) injectHighlightStyles();
}

function highlightElement(index: number, tooltip: string) {
  const el = findElementByIndex(index);
  if (!el) return;

  removeHighlight();
  injectHighlightStyles();

  const PAD = 4;
  const overlay = document.createElement('div');
  overlay.id = 'ouija-highlight';
  overlay.style.cssText = `
    position: fixed !important;
    pointer-events: none !important;
    z-index: 2147483644 !important;
    border: 2px solid oklch(0.74 calc(${schemeChroma}*0.82) ${schemeHue} / 0.70) !important;
    border-radius: 8px !important;
    background: oklch(0.74 calc(${schemeChroma}*0.82) ${schemeHue} / 0.04) !important;
    transition: top 150ms ease, left 150ms ease, width 150ms ease, height 150ms ease !important;
  `;

  if (tooltip) {
    const tip = document.createElement('div');
    tip.style.cssText = `
      position: absolute !important;
      bottom: calc(100% + 8px) !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: oklch(0.10 calc(${schemeChroma}*0.30) ${schemeHue} / 0.95) !important;
      color: #e2e8f0 !important;
      font-size: 12px !important;
      font-family: 'Manrope', system-ui, -apple-system, sans-serif !important;
      font-weight: 500 !important;
      padding: 6px 12px !important;
      border-radius: 8px !important;
      border: 1px solid oklch(0.74 calc(${schemeChroma}*0.82) ${schemeHue} / 0.30) !important;
      max-width: 240px !important;
      white-space: normal !important;
      text-align: center !important;
      pointer-events: none !important;
      backdrop-filter: blur(8px) !important;
    `;
    tip.textContent = tooltip;
    overlay.appendChild(tip);
  }

  document.documentElement.appendChild(overlay);
  highlightEl = overlay;
  trackedEl = el;

  function updatePos() {
    if (!highlightEl || !trackedEl) return;
    const r = trackedEl.getBoundingClientRect();
    highlightEl.style.top = `${r.top - PAD}px`;
    highlightEl.style.left = `${r.left - PAD}px`;
    highlightEl.style.width = `${r.width + PAD * 2}px`;
    highlightEl.style.height = `${r.height + PAD * 2}px`;
  }

  updatePos();
  scrollHandler = updatePos;
  resizeHandler = updatePos;
  window.addEventListener('scroll', scrollHandler, { passive: true, capture: true });
  window.addEventListener('resize', resizeHandler);

  // If the target is off-screen (e.g. the Role ARN field low on the CloudPulse page),
  // bring it into view so the user can see the overlay. The scroll handler above keeps the
  // box aligned during the smooth scroll. Guided nav aid only — never a consequential action.
  const r0 = el.getBoundingClientRect();
  if (r0.top < 0 || r0.bottom > window.innerHeight) {
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch { /* */ }
  }

  // Track element size changes (e.g. button morphing into larger box)
  const resizeObs = new ResizeObserver(updatePos);
  resizeObs.observe(el);
  // Also observe parent for layout shifts
  if (el.parentElement) resizeObs.observe(el.parentElement);
  (highlightEl as any).__resizeObserver = resizeObs;
}

function removeHighlight() {
  if (highlightEl && (highlightEl as any).__resizeObserver) {
    (highlightEl as any).__resizeObserver.disconnect();
  }
  highlightEl?.remove();
  highlightEl = null;
  trackedEl = null;
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler, { capture: true });
    scrollHandler = null;
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
}

// ── Smart sidebar positioning ─────────────────────────────────────────────────

function checkPositionConflict() {
  if (!trackedEl || !sidebarContainer) return;
  const rect = trackedEl.getBoundingClientRect();
  const vw = window.innerWidth;

  // Transient auto-avoid: nudge to the other side if the highlight would sit under the
  // sidebar. Does NOT persist — the user's dragged preference survives navigation.
  if (rect.right > vw - SIDEBAR_WIDTH - SIDEBAR_GAP && sidebarSide === 'right') {
    setSidebarSide('left', false);
  } else if (rect.right <= vw - SIDEBAR_WIDTH - SIDEBAR_GAP && sidebarSide === 'left') {
    setSidebarSide('right', false);
  }
}

// Dock the sidebar left or right. `persist` records it as the user's preference (manual drag);
// transient auto-avoid passes false. Dependent panels (graph + clipboard) always follow.
function setSidebarSide(side: 'right' | 'left', persist: boolean) {
  if (sidebarContainer && sidebarSide !== side) {
    if (side === 'left') {
      sidebarContainer.style.right = 'auto';
      sidebarContainer.style.left = '16px';
    } else {
      sidebarContainer.style.left = 'auto';
      sidebarContainer.style.right = '16px';
    }
  }
  sidebarSide = side;
  repositionDependentPanels();
  if (persist) safeChrome(() => chrome.storage.local.set({ ouija_sidebar_side: side }));
}

// Align the graph + clipboard panels to whichever side the sidebar is docked, so they sit
// beside it (toward page-center) instead of overlapping it or floating off the wrong edge.
function repositionDependentPanels() {
  const setSide = (el: HTMLElement | null) => {
    if (!el) return;
    el.style.transition = (el.style.transition || '') + ', left 350ms cubic-bezier(0.34,1.56,0.64,1), right 350ms cubic-bezier(0.34,1.56,0.64,1)';
    if (sidebarSide === 'left') { el.style.right = 'auto'; el.style.left = '352px'; }
    else { el.style.left = 'auto'; el.style.right = '352px'; }
  };
  setSide(graphPanelContainer);
  setSide(clipboardPanelContainer);
}

// Pointer-drag the sidebar to switch dock side. A slim grip on the page-facing edge; drag past
// the viewport midline and release to snap. (Guidance UI only — never moves host-page elements.)
function setupSidebarDrag(container: HTMLDivElement) {
  const grip = document.createElement('div');
  grip.id = 'ouija-drag-grip';
  grip.title = 'Drag to move Ouija to the other side';
  grip.style.cssText = `
    position: absolute !important;
    top: 50% !important;
    ${sidebarSide === 'left' ? 'right: 4px !important;' : 'left: 4px !important;'}
    transform: translateY(-50%) !important;
    width: 18px !important;
    height: 54px !important;
    border-radius: 9px !important;
    z-index: 3 !important;
    cursor: grab !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: oklch(0.70 calc(${schemeChroma}*0.5) ${schemeHue} / 0.55) !important;
    background: transparent !important;
    transition: background 160ms ease, color 160ms ease !important;
  `;
  grip.textContent = '⋮⋮';
  grip.addEventListener('mouseenter', () => {
    grip.style.background = schemeMode === 'light'
      ? `oklch(0.85 calc(${schemeChroma}*0.4) ${schemeHue} / 0.40)`
      : `oklch(0.30 calc(${schemeChroma}*0.4) ${schemeHue} / 0.30)`;
  });
  grip.addEventListener('mouseleave', () => { grip.style.background = 'transparent'; });

  let dragging = false;
  let startX = 0;
  grip.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    grip.setPointerCapture(e.pointerId);
    grip.style.cursor = 'grabbing';
    container.style.transition = 'none';
    e.preventDefault();
  });
  grip.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    container.style.transform = `translateX(${e.clientX - startX}px)`;
  });
  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    grip.style.cursor = 'grab';
    container.style.transition = 'transform 320ms cubic-bezier(0.34,1.56,0.64,1), left 320ms ease, right 320ms ease';
    container.style.transform = 'translateX(0)';
    const side = e.clientX < window.innerWidth / 2 ? 'left' : 'right';
    setSidebarSide(side, true);
    // Move the grip to the new page-facing edge.
    if (side === 'left') { grip.style.left = 'auto'; grip.style.right = '4px'; }
    else { grip.style.right = 'auto'; grip.style.left = '4px'; }
  };
  grip.addEventListener('pointerup', end);
  grip.addEventListener('pointercancel', end);
  container.appendChild(grip);
}

// ── SPA navigation intercept ──────────────────────────────────────────────────

function onNavChange() {
  // On SPA navigation, don't re-inject or change sidebar state — just update page context
  if (!sidebarContainer) return;
  const iframe = sidebarContainer.querySelector('iframe') as HTMLIFrameElement | null;
  if (!iframe?.contentWindow) return;
  const elements = extractInteractiveElements();
  iframe.contentWindow.postMessage(
    {
      type: 'PAGE_CONTEXT',
      url: window.location.href,
      domain: window.location.hostname,
      title: document.title,
      elements,
    },
    '*'
  );
}

const origPush = history.pushState.bind(history);
history.pushState = (...args) => {
  origPush(...args);
  onNavChange();
};
const origReplace = history.replaceState.bind(history);
history.replaceState = (...args) => {
  origReplace(...args);
  onNavChange();
};
window.addEventListener('popstate', onNavChange);

// ── MutationObserver lifecycle ────────────────────────────────────────────────

function startObserver() {
  if (mutationObserver) return;
  mutationObserver = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onNavChange, 2000);
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
  mutationObserver?.disconnect();
  mutationObserver = null;
}

// ── Idle fade ─────────────────────────────────────────────────────────────────

const IDLE_DELAY = 10_000;
let lastMouseX = -1;
let lastMouseY = -1;

document.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}, { passive: true });

function isMouseOverSidebar(): boolean {
  if (lastMouseX < 0 || lastMouseY < 0 || !sidebarContainer) return false;
  const rect = sidebarContainer.getBoundingClientRect();
  return (
    lastMouseX >= rect.left &&
    lastMouseX <= rect.right &&
    lastMouseY >= rect.top &&
    lastMouseY <= rect.bottom
  );
}

function setOuijaIdle(idle: boolean) {
  if (idle) {
    // Fade out with transition
    if (sidebarContainer) {
      sidebarContainer.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease';
      sidebarContainer.style.opacity = '0.4';
    }
    if (highlightEl) highlightEl.style.opacity = '0.4';
    const bubble = document.getElementById('ouija-bubble');
    if (bubble) bubble.style.opacity = '0.4';
  } else {
    // Fade in instant (no transition on opacity)
    if (sidebarContainer) {
      sidebarContainer.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';
      sidebarContainer.style.opacity = '1';
      // Restore full transition after instant snap-back
      requestAnimationFrame(() => {
        if (sidebarContainer) {
          sidebarContainer.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease';
        }
      });
    }
    if (highlightEl) highlightEl.style.opacity = '1';
    const bubble = document.getElementById('ouija-bubble');
    if (bubble) bubble.style.opacity = '1';
  }
}

function resetIdleTimer() {
  setOuijaIdle(false);
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    // If mouse is currently over the sidebar, don't dim — reset instead
    if (isMouseOverSidebar()) {
      resetIdleTimer();
      return;
    }
    setOuijaIdle(true);
  }, IDLE_DELAY);
}

document.addEventListener('keydown', resetIdleTimer, { passive: true, capture: true });
document.addEventListener('click', resetIdleTimer, { passive: true, capture: true });

// ── Sidebar communication helpers ─────────────────────────────────────────────

function postToSidebar(data: object) {
  const iframe = sidebarContainer?.querySelector('iframe') as HTMLIFrameElement | null;
  iframe?.contentWindow?.postMessage(data, '*');
}

// ── UI chameleon ───────────────────────────────────────────────────────────────

// The sidebar CONTAINER (here, in the host DOM) provides the frosted-glass background that
// shows through the transparent iframe. Light mode swaps it to a bright frosted panel — still
// distinctly bordered + shadowed so it never vanishes into a white host. The accent hue tints
// both modes. backdrop-filter (the actual "liquid glass" blur) is identical in both.
function applyContainerSurface(mode: 'light' | 'dark') {
  if (!sidebarContainer) return;
  schemeMode = mode;
  const h = schemeHue, c = schemeChroma;
  if (mode === 'light') {
    // High opacity on purpose: a translucent light panel over a dark host bleeds through and
    // kills contrast (the x.com bug). Keep the glass blur but make the surface read as light.
    sidebarContainer.style.background = `oklch(0.975 calc(${c}*0.10) ${h} / 0.93)`;
    sidebarContainer.style.border = `1px solid oklch(0.55 calc(${c}*0.45) ${h} / 0.32)`;
    sidebarContainer.style.boxShadow = `inset 0 1px 0 oklch(1 0 0 / 0.80), 0 0 0 0.5px oklch(0.55 calc(${c}*0.4) ${h} / 0.10), 0 24px 64px -16px oklch(0.40 calc(${c}*0.3) ${h} / 0.30)`;
  } else {
    sidebarContainer.style.background = `oklch(0.185 calc(${c}*0.07) ${h} / 0.60)`;
    sidebarContainer.style.border = `1px solid oklch(0.90 calc(${c}*0.28) ${h} / 0.30)`;
    sidebarContainer.style.boxShadow = `inset 0 1px 0 oklch(0.88 calc(${c}*0.90) ${h} / 0.15), inset 0 1.5px 0 oklch(0.68 calc(${c}*0.62) ${h} / 0.20), 0 0 0 0.5px oklch(0.40 calc(${c}*0.55) ${h} / 0.18), 0 24px 64px -16px oklch(0.04 0 0 / 0.88)`;
  }
}

// Close-× button colours (graph panel) — scheme + mode aware (was hardcoded amber, stayed dark).
function graphCloseColors() {
  const h = schemeHue, c = schemeChroma, light = schemeMode === 'light';
  return {
    border: `oklch(0.50 calc(${c}*0.55) ${h} / 0.24)`,
    bg: light ? `oklch(0.90 calc(${c}*0.15) ${h} / 0.70)` : `oklch(0.14 calc(${c}*0.25) ${h} / 0.80)`,
    color: `oklch(${light ? 0.45 : 0.60} calc(${c}*0.45) ${h})`,
    borderHover: `oklch(0.55 calc(${c}*0.65) ${h} / 0.40)`,
    colorHover: `oklch(${light ? 0.35 : 0.84} calc(${c}*0.80) ${h})`,
  };
}

// The grip (6-dot drag handle) — re-tint to the scheme + flip dark for light mode (was amber).
function themeDragGrip() {
  const grip = sidebarContainer?.querySelector('#ouija-drag-grip') as HTMLElement | null;
  if (!grip) return;
  grip.style.color = `oklch(${schemeMode === 'light' ? 0.45 : 0.70} calc(${schemeChroma}*0.5) ${schemeHue} / ${schemeMode === 'light' ? 0.7 : 0.55})`;
}

// The graph-panel CONTAINER (the floating box) + its close-×. The iframe content re-tints via the
// THEME message (sendThemeToPanel); this themes the frosted chrome around it to match the mode.
function applyGraphPanelSurface() {
  if (!graphPanelContainer) return;
  const h = schemeHue, c = schemeChroma;
  if (schemeMode === 'light') {
    graphPanelContainer.style.background = `oklch(0.975 calc(${c}*0.08) ${h} / 0.93)`;
    graphPanelContainer.style.border = `1px solid oklch(0.55 calc(${c}*0.45) ${h} / 0.32)`;
  } else {
    graphPanelContainer.style.background = `oklch(0.20 calc(${c}*0.07) ${h} / 0.55)`;
    graphPanelContainer.style.border = `1px solid oklch(0.62 calc(${c}*0.50) ${h} / 0.45)`;
  }
  const close = graphPanelContainer.querySelector('#ouija-graph-close') as HTMLElement | null;
  if (close) {
    const cc = graphCloseColors();
    close.style.borderColor = cc.border;
    close.style.background = cc.bg;
    close.style.color = cc.color;
  }
}

// Push the scheme (hue/chroma/mode) into the graph-panel iframe so its SVG re-tints to match.
function sendThemeToPanel() {
  if (!graphPanelContainer) return;
  const iframe = graphPanelContainer.querySelector('iframe') as HTMLIFrameElement | null;
  iframe?.contentWindow?.postMessage({ type: 'THEME', h: schemeHue, c: schemeChroma, mode: schemeMode }, '*');
}

// Single entry point: re-tint EVERY Ouija surface from the current schemeHue/Chroma/Mode globals.
function applyAllSurfaces() {
  applyContainerSurface(schemeMode);                    // sidebar glass
  injectSidebarStyles();                                // hover glow (re-injected with new hue)
  reinjectHighlightStyles();                            // host-page spotlight
  postToSidebar({ type: 'THEME_SCHEME', vars: { '--ouija-h': String(schemeHue), '--ouija-c': String(schemeChroma) }, mode: schemeMode });
  applyGraphPanelSurface();                             // graph container + close-×
  sendThemeToPanel();                                   // graph iframe SVG
  themeDragGrip();                                      // 6-dot drag handle
  if (clipboardPanelContainer) renderClipboardItems();  // clipboard panel
}

// Apply a cached scheme instantly (no flash) if we've themed this host before. Bails if a real
// scan has already run — otherwise the async cache read could re-apply a stale (wrong) mode.
function applyCachedScheme() {
  if (chameleonScanned) return;
  safeChrome(() => {
    chrome.storage.local.get([`ouija_scheme_${location.hostname}`], (r) => {
      if (chameleonScanned) return; // a fresh scan landed while we were reading — don't clobber it
      const cached = r[`ouija_scheme_${location.hostname}`];
      if (cached && typeof cached.h === 'number') {
        schemeHue = cached.h;
        schemeChroma = cached.c ?? schemeChroma;
        schemeMode = cached.mode === 'light' ? 'light' : 'dark';
        applyAllSurfaces();
      }
    });
  });
}

// Scan the host page, snap to the nearest pre-set scheme + light/dark mode, apply it to ALL
// surfaces, and cache it for this hostname. Cheap (reads computed styles of ≤120 els).
function applyChameleon() {
  try {
    chameleonScanned = true; // mark FIRST so any racing cached-apply bails out
    const { scheme, mode } = detectScheme();
    schemeHue = scheme.oklchH;
    schemeChroma = scheme.oklchC;
    schemeMode = mode;
    applyAllSurfaces();
    safeChrome(() => chrome.storage.local.set({
      [`ouija_scheme_${location.hostname}`]: { h: scheme.oklchH, c: scheme.oklchC, id: scheme.id, mode },
    }));
  } catch { /* scanning is best-effort; default amber stands */ }
}

// ── Graph panel injection ─────────────────────────────────────────────────────

function injectGraphPanel() {
  if (graphPanelContainer) return;
  try { chrome.runtime.getURL(''); } catch { return; } // Extension context check
  // Remove orphaned panel from previous script instance
  const orphan = document.getElementById('ouija-graph-panel');
  if (orphan) orphan.remove();

  const container = document.createElement('div');
  container.id = 'ouija-graph-panel';
  container.style.cssText = `
    position: fixed !important;
    top: 16px !important;
    ${sidebarSide === 'left' ? 'left: 352px' : 'right: 352px'} !important;
    width: min(calc(66vw - 360px), 600px) !important;
    height: 180px !important;
    will-change: transform, opacity !important;
    z-index: 2147483645 !important;
    border: 1px solid oklch(0.62 0.12 56 / 0.45) !important;
    margin: 0 !important;
    padding: 0 !important;
    pointer-events: auto !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    box-shadow: inset 0 1px 0 oklch(0.85 0.13 60 / 0.16), 0 0 0 0.5px oklch(0.04 0 0 / 0.40), 0 24px 64px -16px oklch(0.04 0 0 / 0.85) !important;
    background: oklch(0.20 0.013 54 / 0.55) !important;
    backdrop-filter: blur(34px) saturate(150%) !important;
    opacity: 0 !important;
    transform: translateY(-20px) scale(0.97) !important;
    transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease !important;
  `;
  // Trigger entrance animation after append
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.id = 'ouija-graph-close';
  const cc0 = graphCloseColors();
  closeBtn.style.cssText = `
    position: absolute !important;
    top: 10px !important;
    right: 10px !important;
    width: 22px !important;
    height: 22px !important;
    border-radius: 50% !important;
    border: 1px solid ${cc0.border} !important;
    background: ${cc0.bg} !important;
    color: ${cc0.color} !important;
    font-size: 12px !important;
    line-height: 1 !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 10 !important;
    transition: all 160ms ease !important;
  `;
  closeBtn.textContent = '×';
  closeBtn.addEventListener('mouseenter', () => {
    const cc = graphCloseColors();
    closeBtn.style.borderColor = cc.borderHover;
    closeBtn.style.color = cc.colorHover;
  });
  closeBtn.addEventListener('mouseleave', () => {
    const cc = graphCloseColors();
    closeBtn.style.borderColor = cc.border;
    closeBtn.style.color = cc.color;
  });
  closeBtn.addEventListener('click', () => {
    closeGraphPanelOnly();
  });

  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('graph-panel.html');
  iframe.style.cssText = `
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    display: block !important;
    border-radius: 20px !important;
    background: transparent !important;
  `;
  iframe.setAttribute('allowtransparency', 'true');

  iframe.addEventListener('load', () => {
    sendGraphDataToPanel();
    sendThemeToPanel();   // re-tint the SVG to the current scheme/mode on open
  });

  container.appendChild(closeBtn);
  container.appendChild(iframe);
  document.documentElement.appendChild(container);
  graphPanelContainer = container;
  graphPanelOpen = true;
  graphPanelHidden = false;
  applyGraphPanelSurface();  // open in the current mode (was hardcoded dark glass)
  repositionClipboardPanel();
}


function closeGraphPanelOnly() {
  if (graphPanelContainer) {
    graphPanelContainer.style.transition = 'transform 350ms cubic-bezier(0.55, 0, 0.15, 1), opacity 250ms ease';
    graphPanelContainer.style.transform = 'translateY(-20px) scale(0.97)';
    graphPanelContainer.style.opacity = '0';
    setTimeout(() => {
      graphPanelContainer?.remove();
      graphPanelContainer = null;
      repositionClipboardPanel();
    }, 370);
  }
  graphPanelOpen = false;
  graphPanelHidden = false;
  postToSidebar({ type: 'GRAPH_PANEL_CLOSED' });
}

function removeGraphPanel() {
  graphPanelContainer?.remove();
  graphPanelContainer = null;
  graphPanelOpen = false;
  graphPanelHidden = false;
}

function toggleGraphPanel() {
  if (graphPanelContainer) {
    closeGraphPanelOnly();
  } else {
    injectGraphPanel();
  }
}

// ── Clipboard Panel (external, floating left of sidebar) ─────────────────────

let clipboardPanelContainer: HTMLDivElement | null = null;

function toggleClipboardPanel() {
  // DOM-authoritative: the module variable can desync from the actual panel (e.g. after
  // a re-render or a missed close), which made an open panel re-open instead of close.
  const open = clipboardPanelContainer || document.getElementById('ouija-clipboard-panel');
  if (open) {
    closeClipboardPanel();
  } else {
    openClipboardPanel();
  }
}

// Clipboard panel palette — derived from the matched scheme hue/chroma + light/dark mode, so the
// panel follows the same UI rules as the sidebar (was hardcoded amber + dark).
function cbColors() {
  const h = schemeHue, c = schemeChroma, light = schemeMode === 'light';
  return {
    panelBg: light ? `oklch(0.975 calc(${c}*0.08) ${h} / 0.93)` : `oklch(0.195 calc(${c}*0.07) ${h} / 0.55)`,
    panelBorder: `oklch(0.55 calc(${c}*0.55) ${h} / ${light ? 0.32 : 0.35})`,
    panelShadow: light
      ? `inset 0 1px 0 oklch(1 0 0 / 0.7), 0 16px 48px -12px oklch(0.40 0.02 0 / 0.25)`
      : `inset 0 1px 0 oklch(0.88 calc(${c}*0.90) ${h} / 0.12), 0 16px 48px -12px oklch(0.04 0 0 / 0.80)`,
    heading: `oklch(${light ? 0.45 : 0.84} calc(${c}*0.40) ${h})`,
    closeBorder: `oklch(0.50 calc(${c}*0.45) ${h} / 0.24)`,
    closeBg: light ? `oklch(0.90 calc(${c}*0.20) ${h} / 0.6)` : `oklch(0.14 calc(${c}*0.25) ${h} / 0.80)`,
    closeColor: `oklch(${light ? 0.45 : 0.60} calc(${c}*0.45) ${h})`,
    empty: `oklch(${light ? 0.50 : 0.80} calc(${c}*0.24) ${h})`,
    itemBg: light ? `oklch(0.92 calc(${c}*0.12) ${h} / 0.6)` : `oklch(0.16 calc(${c}*0.20) ${h} / 0.50)`,
    itemBorder: `oklch(0.50 calc(${c}*0.55) ${h} / ${light ? 0.18 : 0.12})`,
    label: `oklch(${light ? 0.42 : 0.84} calc(${c}*0.70) ${h})`,
    value: `oklch(${light ? 0.45 : 0.60} calc(${c}*0.40) ${h})`,
    copyBorder: `oklch(${light ? 0.55 : 0.84} calc(${c}*0.82) ${h} / 0.30)`,
    copyBg: `oklch(${light ? 0.70 : 0.84} calc(${c}*0.92) ${h} / ${light ? 0.12 : 0.08})`,
    copyColor: `oklch(${light ? 0.40 : 0.84} calc(${c}*0.85) ${h})`,
    footer: `oklch(${light ? 0.50 : 0.62} calc(${c}*0.22) ${h})`,
  };
}

async function openClipboardPanel() {
  if (!clipboardLoaded) await loadClipboardFromStorage();
  if (clipboardPanelContainer) { renderClipboardItems(); return; }
  const orphan = document.getElementById('ouija-clipboard-panel');
  if (orphan) orphan.remove();

  const k = cbColors();
  const container = document.createElement('div');
  container.id = 'ouija-clipboard-panel';
  const topPos = graphPanelContainer ? '212px' : '16px';
  container.style.cssText = `
    position: fixed !important;
    top: ${topPos} !important;
    ${sidebarSide === 'left' ? 'left: 352px' : 'right: 352px'} !important;
    width: 260px !important;
    z-index: 2147483644 !important;
    border: 1px solid ${k.panelBorder} !important;
    margin: 0 !important;
    padding: 14px 16px !important;
    pointer-events: auto !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    box-shadow: ${k.panelShadow} !important;
    background: ${k.panelBg} !important;
    backdrop-filter: blur(34px) saturate(150%) !important;
    font-family: 'Manrope', system-ui, sans-serif !important;
    opacity: 0 !important;
    transform: translateX(10px) scale(0.97) !important;
    transition: transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 250ms ease !important;
  `;
  requestAnimationFrame(() => { requestAnimationFrame(() => {
    container.style.opacity = '1';
    container.style.transform = 'translateX(0) scale(1)';
  }); });

  document.documentElement.appendChild(container);
  clipboardPanelContainer = container;
  renderClipboardItems();
  postToSidebar({ type: 'CLIPBOARD_PANEL_OPENED' });
}

function renderClipboardItems() {
  if (!clipboardPanelContainer) return;
  const items = ouijaClipboardItems;
  const k = cbColors();
  // Re-theme the container surface too (so a scheme/mode change while the panel is open updates it).
  clipboardPanelContainer.style.background = `${k.panelBg}`;
  clipboardPanelContainer.style.border = `1px solid ${k.panelBorder}`;
  clipboardPanelContainer.style.boxShadow = `${k.panelShadow}`;
  clipboardPanelContainer.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
      <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${k.heading};">Clipboard</span>
      <button id="ouija-cb-close" style="width:20px;height:20px;border-radius:50%;border:1px solid ${k.closeBorder};background:${k.closeBg};color:${k.closeColor};font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button>
    </div>
    ${items.length === 0 ? `<div style="font-size:11px;color:${k.empty};text-align:center;padding:8px 0;">Credentials you copy will appear here.</div>` : ''}
    ${items.map((item, i) => `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${k.itemBg};border:1px solid ${k.itemBorder};margin-bottom:6px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:9px;font-weight:700;color:${k.label};margin-bottom:2px;">${escHtml(item.label)}</div>
          <div style="font-size:10px;font-family:monospace;color:${k.value};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(item.value.slice(0, 24))}${item.value.length > 24 ? '...' : ''}</div>
        </div>
        <button data-cb-idx="${i}" style="font-size:9px;font-weight:700;padding:4px 10px;border-radius:6px;border:1px solid ${k.copyBorder};background:${k.copyBg};color:${k.copyColor};cursor:pointer;white-space:nowrap;">Copy</button>
      </div>
    `).join('')}
    <div style="font-size:9px;color:${k.footer};text-align:center;margin-top:8px;line-height:1.4;">Stays on your device · cleared when your session ends</div>
  `;
  clipboardPanelContainer.querySelector('#ouija-cb-close')?.addEventListener('click', closeClipboardPanel);
  clipboardPanelContainer.querySelectorAll('[data-cb-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt((btn as HTMLElement).dataset.cbIdx || '0');
      if (ouijaClipboardItems[idx]) {
        navigator.clipboard.writeText(ouijaClipboardItems[idx].value);
        (btn as HTMLElement).textContent = '✓';
        setTimeout(() => { (btn as HTMLElement).textContent = 'Copy'; }, 1500);
      }
    });
  });
}

function repositionClipboardPanel() {
  if (!clipboardPanelContainer) return;
  const topPos = graphPanelContainer ? '212px' : '16px';
  clipboardPanelContainer.style.transition = 'top 350ms cubic-bezier(0.34, 1.56, 0.64, 1)';
  clipboardPanelContainer.style.top = topPos;
}

function closeClipboardPanel() {
  // Close whatever panel exists — tracked container OR an orphan DOM node — so a
  // desynced variable can't leave a visible panel that won't toggle shut.
  const panel = clipboardPanelContainer || (document.getElementById('ouija-clipboard-panel') as HTMLDivElement | null);
  clipboardPanelContainer = null;
  if (panel) {
    panel.style.transition = 'transform 300ms cubic-bezier(0.55, 0, 0.15, 1), opacity 200ms ease';
    panel.style.transform = 'translateX(10px) scale(0.97)';
    panel.style.opacity = '0';
    setTimeout(() => { panel.remove(); }, 320);
  }
  postToSidebar({ type: 'CLIPBOARD_PANEL_CLOSED' });
}

function sendGraphDataToPanel() {
  if (!graphPanelContainer) return;
  const iframe = graphPanelContainer.querySelector('iframe') as HTMLIFrameElement | null;
  if (!iframe?.contentWindow) return;

  safeChrome(() => {
    chrome.storage.local.get(['ouija_graph', 'ouija_position'], (result) => {
      const graph = result.ouija_graph || null;
      const position = result.ouija_position || currentGraphPosition;
      // Forks are stored in sidebar state — we read from storage or use empty
      safeChrome(() => {
        chrome.storage.local.get(['ouija_forks'], (forkResult) => {
          iframe.contentWindow?.postMessage(
            {
              type: 'GRAPH_DATA',
              graph,
              position,
              forks: forkResult.ouija_forks || [],
            },
            '*'
          );
        });
      });
    });
  });
}

// ── Sidebar injection ─────────────────────────────────────────────────────────

function injectSidebarStyles() {
  // Re-inject every time so the hover glow tracks the matched scheme hue/chroma (was hardcoded
  // amber, so the hover edge stayed amber on a blue/green host).
  document.getElementById('ouija-sidebar-style')?.remove();
  const h = schemeHue, c = schemeChroma;
  const ambient = schemeMode === 'light' ? 'oklch(0.40 0.02 0 / 0.22)' : 'oklch(0.04 0 0 / 0.88)';
  const style = document.createElement('style');
  style.id = 'ouija-sidebar-style';
  style.textContent = `
    #ouija-sidebar-root.ouija-hovered {
      border-color: oklch(0.55 calc(${c}*0.65) ${h} / 0.35) !important;
      box-shadow: inset 0 1.5px 0 oklch(0.74 calc(${c}*0.72) ${h} / 0.30),
        0 0 0 0.5px oklch(0.55 calc(${c}*0.65) ${h} / 0.28),
        0 24px 64px -16px ${ambient},
        0 0 32px -8px oklch(0.74 calc(${c}*0.82) ${h} / 0.15) !important;
      transition: border-color 0.2s, box-shadow 0.3s !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function injectSidebar() {
  if (sidebarContainer) return;
  try { chrome.runtime.getURL(''); } catch { return; } // Extension context check
  // Remove orphaned sidebar from previous script instance (extension reload)
  const orphan = document.getElementById('ouija-sidebar-root');
  if (orphan) orphan.remove();

  injectSidebarStyles();

  const container = document.createElement('div');
  container.id = 'ouija-sidebar-root';
  container.style.cssText = `
    position: fixed !important;
    top: 16px !important;
    right: 16px !important;
    bottom: 16px !important;
    width: ${SIDEBAR_WIDTH}px !important;
    height: calc(100vh - 32px) !important;
    z-index: 2147483646 !important;
    border: 1px solid oklch(0.90 0.05 72 / 0.30) !important;
    margin: 0 !important;
    padding: 0 !important;
    pointer-events: auto !important;
    transform: translateX(0) !important;
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease !important;
    will-change: transform, opacity !important;
    border-radius: 24px !important;
    overflow: hidden !important;
    box-shadow: inset 0 1px 0 oklch(0.88 calc(0.18*0.90) 35 / 0.15), inset 0 1.5px 0 oklch(0.68 calc(0.18*0.62) 35 / 0.20), 0 0 0 0.5px oklch(0.40 calc(0.18*0.55) 35 / 0.18), 0 24px 64px -16px oklch(0.04 0 0 / 0.88) !important;
    background: oklch(0.185 0.013 52 / 0.60) !important;
    backdrop-filter: blur(34px) saturate(150%) !important;
    opacity: 1 !important;
  `;

  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('sidebar.html');
  iframe.style.cssText = `
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    display: block !important;
    border-radius: 24px !important;
    background: transparent !important;
  `;
  iframe.allow = 'clipboard-write';
  iframe.setAttribute('allowtransparency', 'true');

  iframe.addEventListener('load', () => {
    onNavChange();
    startObserver();
    applyCachedScheme();                 // instant: no flash on a previously-themed host
    setTimeout(applyChameleon, 600);     // re-scan once the host page has settled its colours
  });

  container.addEventListener('mouseenter', () => {
    resetIdleTimer();
    container.classList.add('ouija-hovered');
  });
  container.addEventListener('mouseleave', () => {
    container.classList.remove('ouija-hovered');
  });
  container.appendChild(iframe);

  // Apply the persisted dock side (default right) before showing, then attach the drag grip.
  if (sidebarSide === 'left') {
    container.style.right = 'auto';
    container.style.left = '16px';
  }
  setupSidebarDrag(container);

  document.documentElement.appendChild(container);
  sidebarContainer = container;
}

function removeSidebar() {
  stopObserver();
  removeHighlight();
  sidebarContainer?.remove();
  sidebarContainer = null;
}

function toggleSidebar() {
  if (!sidebarContainer) return;
  expanded = !expanded;

  if (!expanded) {
    // Track if graph panel was open so we can restore it
    graphPanelWasOpen = graphPanelOpen;
    sidebarHidden = true;

    // Step 1+2: squeeze
    sidebarContainer.style.transition = 'transform 100ms ease';
    sidebarContainer.style.transform = 'scaleX(0.96) scaleY(0.98)';

    // GRAPH PANEL: squeeze then slide right (same direction)
    if (graphPanelContainer && !graphPanelHidden) {
      graphPanelContainer.style.transition = 'transform 100ms ease';
      graphPanelContainer.style.transform = 'scaleX(0.96) scaleY(0.98)';
      graphPanelHidden = true;
    }

    // Step 3+4: after squeeze, slide OFF the docked edge (left dock slides left, right slides right)
    setTimeout(() => {
      if (!sidebarContainer) return;
      const off = sidebarSide === 'left' ? -1 : 1;
      sidebarContainer.style.transition = 'transform 400ms cubic-bezier(0.55, 0, 0.15, 1)';
      sidebarContainer.style.transform = `translateX(${off * 360}px) scaleX(0.96)`;

      if (graphPanelContainer) {
        graphPanelContainer.style.transition = 'transform 400ms cubic-bezier(0.55, 0, 0.15, 1), opacity 300ms ease';
        graphPanelContainer.style.transform = `translateX(${off * 60}px)`;
        graphPanelContainer.style.opacity = '0';
      }

      // Clipboard panel rides out with the sidebar (backtick / toggle).
      if (clipboardPanelContainer) {
        clipboardPanelContainer.style.transition = 'transform 400ms cubic-bezier(0.55, 0, 0.15, 1), opacity 300ms ease';
        clipboardPanelContainer.style.transform = `translateX(${off * 60}px)`;
        clipboardPanelContainer.style.opacity = '0';
      }
    }, 100);
  } else {
    // SHOWING
    sidebarHidden = false;

    // Sidebar: pop in from right with overshoot bounce
    sidebarContainer.style.transition = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    sidebarContainer.style.transform = 'translateX(0)';

    // Graph panel: restore if it was open before hiding
    if (graphPanelContainer && graphPanelWasOpen) {
      graphPanelHidden = false;
      graphPanelContainer.style.transition = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease';
      graphPanelContainer.style.transform = 'translateX(0)';
      graphPanelContainer.style.opacity = '1';
    }

    // Clipboard panel: restore alongside the sidebar.
    if (clipboardPanelContainer) {
      clipboardPanelContainer.style.transition = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease';
      clipboardPanelContainer.style.transform = 'translateX(0)';
      clipboardPanelContainer.style.opacity = '1';
    }
  }

  safeChrome(() => chrome.storage.local.set({ ouija_expanded: expanded }));
}

// ── Message listener ──────────────────────────────────────────────────────────

try {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
    try {
      switch (message.type) {
        case 'AUTH_SUCCESS':
          safeChrome(() => chrome.storage.local.get(['ouija_token'], (r) => { ouijaToken = r.ouija_token || ''; }));
          if (message.apiKey) {
            currentApiKey = message.apiKey;
            backendUrl = message.backendUrl || BACKEND_URL;
            injectSidebar();
          } else {
            safeChrome(() => {
              chrome.storage.local.get(['apiKey', 'ouija_backend_url', 'ouija_token', 'ouija_sidebar_side'], (result) => {
                if (!result.apiKey) return;
                currentApiKey = result.apiKey;
                backendUrl = result.ouija_backend_url || BACKEND_URL;
                ouijaToken = result.ouija_token || '';
                sidebarSide = result.ouija_sidebar_side === 'left' ? 'left' : 'right';
                injectSidebar();
              });
            });
          }
          break;
        case 'AUTH_CLEARED':
          currentApiKey = '';
          ouijaToken = '';
          clearClipboard();
          closeClipboardPanel();
          removeSidebar();
          break;
        case 'TOGGLE_SIDEBAR':
          toggleSidebar();
          break;
        case 'JOURNEY_UPDATE':
          currentStepInstruction = (message.step_instruction as string) || '';
          currentGraphPosition = (message.position as string) || '';
          requestGuidance();
          break;
        case 'VERIFY_REQUEST':
          requestVerify((message.verify_condition as string) || '');
          break;
      }
    } catch (e) {
      if (!(e instanceof Error && e.message.includes('Extension context invalidated'))) {
        console.warn('[Ouija] message handler error:', e);
      }
    }
  });
} catch (e) {
  // Extension context invalidated — old content script instance, silently ignore
}

// ── Listen for messages from sidebar iframe ───────────────────────────────────

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data?.type) return;

  switch (data.type) {
    case 'OUIJA_CLIPBOARD': {
      // Only accept clipboard items posted by the top page itself — block cross-frame
      // (malicious iframe) injection into the trust surface.
      if (event.source !== window) break;
      if (typeof data.label !== 'string' || typeof data.value !== 'string') break;
      const isDup = ouijaClipboardItems.some((i) => i.value === data.value);
      if (!isDup) {
        ouijaClipboardItems.push({ label: data.label, value: data.value });
        persistClipboard();
      }
      postToSidebar({ type: 'CLIPBOARD_SAVE', label: data.label, value: data.value });
      if (clipboardPanelContainer) renderClipboardItems();
      else openClipboardPanel();
      break;
    }
    case 'TOGGLE_CLIPBOARD_PANEL':
      toggleClipboardPanel();
      break;
    case 'CLEAR_CLIPBOARD':
      // Flow completed (or sidebar asked) — purge ephemeral credentials immediately.
      clearClipboard();
      break;
    case 'REQUEST_THEME':
      // Sidebar mounted and wants its scheme — run the authoritative scan (the cache was already
      // applied on iframe load; re-applying it here is what caused the stale-mode race).
      applyChameleon();
      break;
    case 'NAVIGATE_TO':
      if (data.url) window.location.href = data.url;
      break;
    case 'REQUEST_GUIDANCE':
      currentStepInstruction = data.step_instruction || currentStepInstruction;
      currentGraphPosition = data.position || currentGraphPosition;
      requestGuidance();
      break;
    case 'REQUEST_VERIFY':
      requestVerify(data.verify_condition || '');
      break;
    case 'REQUEST_DIAGNOSIS':
      requestDiagnosis(data.error_signal || '');
      break;
    case 'REQUEST_CHAT':
      requestChat(data.message || '');
      break;
    case 'REQUEST_SCREENSHOT_CHAT':
      requestVisualChat(data.message || 'Look at my screen and tell me what you see.');
      break;
    case 'CONFIRM_STEP':
      removeHighlight();
      safeChrome(() => chrome.runtime.sendMessage({ type: 'STEP_UPDATE', currentStep: data.nextStep }));
      // Update graph panel with new position
      sendGraphDataToPanel();
      break;
    case 'TOGGLE_GRAPH_PANEL':
      toggleGraphPanel();
      break;
    case 'CLOSE_GRAPH_PANEL_ONLY':
      closeGraphPanelOnly();
      break;
    case 'GRAPH_FORKS_UPDATE':
      // Sidebar pushes fork updates so graph panel stays in sync
      safeChrome(() => chrome.storage.local.set({ ouija_forks: data.forks || [] }));
      sendGraphDataToPanel();
      break;
    case 'DISMISS_WELCOME':
      dismissWelcomeOverlay();
      break;
    case 'TOGGLE_SIDEBAR_FROM_IFRAME':
      toggleSidebar();
      break;
  }
});

// ── Backtick toggle keybind ───────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
    e.preventDefault();
    toggleSidebar();
  }
}, { capture: true });

// ── Welcome overlay (Ouija landing page only) ────────────────────────────────

function isOuijaLandingPage(): boolean {
  const host = window.location.hostname;
  return host.includes('ouijaboard.vercel.app') || host.includes('ouija.vercel.app') || host.includes('localhost');
}

function showWelcomeOverlay() {
  if (!isOuijaLandingPage()) return;
  if (document.getElementById('ouija-welcome-overlay')) return;
  if (window.location.pathname !== '/' && window.location.pathname !== '') return;
  // Fire once — reset when user disconnects
  safeChrome(() => {
    chrome.storage.local.get(['ouija_welcomed'], (result) => {
      if (result.ouija_welcomed) return;
      safeChrome(() => chrome.storage.local.set({ ouija_welcomed: true }));
      // Delay slightly to ensure page is fully rendered
      setTimeout(doShowWelcomeOverlay, 800);
    });
  });
}

function doShowWelcomeOverlay() {

  const style = document.createElement('style');
  style.id = 'ouija-welcome-style';
  style.textContent = `
    @property --ouija-welcome-angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    @keyframes ouija-welcome-spin {
      from { --ouija-welcome-angle: 0deg; }
      to { --ouija-welcome-angle: 360deg; }
    }
    @keyframes ouija-wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(20deg); }
      75% { transform: rotate(-15deg); }
    }
    #ouija-welcome-overlay {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      z-index: 2147483640 !important;
      pointer-events: none !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 12px !important;
      animation: ouija-welcome-fade 0.4s ease-out !important;
    }
    @keyframes ouija-welcome-fade {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    .ouija-wave-hand {
      font-size: 48px !important;
      animation: ouija-wave 1s ease-in-out infinite !important;
      transform-origin: 70% 70% !important;
    }
    .ouija-lava-border {
      position: relative !important;
      box-shadow: 0 0 18px 2px oklch(0.78 0.18 35 / 0.25) !important;
    }
    .ouija-lava-border::after {
      content: '' !important;
      position: absolute !important;
      inset: 0 !important;
      border-radius: inherit !important;
      padding: 2px !important;
      background: conic-gradient(
        from var(--ouija-welcome-angle),
        transparent 0deg,
        oklch(0.84 0.22 35 / 0) 30deg,
        oklch(0.88 0.22 35 / 0.8) 60deg,
        oklch(0.82 0.20 45 / 1.0) 90deg,
        oklch(0.75 0.18 25 / 0.8) 120deg,
        oklch(0.84 0.22 35 / 0) 150deg,
        transparent 180deg,
        transparent 360deg
      ) !important;
      mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
      mask-composite: exclude !important;
      -webkit-mask-composite: xor !important;
      animation: ouija-welcome-spin 2.5s linear infinite !important;
      animation-delay: calc(var(--i, 0) * 0.3s) !important;
      pointer-events: none !important;
      z-index: 1 !important;
    }
  `;
  document.head.appendChild(style);

  // Waving hand overlay
  const overlay = document.createElement('div');
  overlay.id = 'ouija-welcome-overlay';
  overlay.innerHTML = '<span class="ouija-wave-hand">\u{1F44B}</span>';
  document.documentElement.appendChild(overlay);

  // Lava gradient sweep on cards
  const cards = document.querySelectorAll('.step-card, .setup-section .glass, .marquee-card');
  cards.forEach((card, i) => {
    (card as HTMLElement).style.setProperty('--i', String(i));
    card.classList.add('ouija-lava-border');
  });

  // Welcome stays looping until dismissed via DISMISS_WELCOME message
}

// ── Dismiss welcome overlay ──────────────────────────────────────────────────

function dismissWelcomeOverlay() {
  const overlay = document.getElementById('ouija-welcome-overlay');
  const style = document.getElementById('ouija-welcome-style');

  if (overlay) {
    overlay.style.transition = 'opacity 0.5s';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 500);
  }

  // Always remove the style element (even if overlay already gone)
  style?.remove();

  // Remove .ouija-lava-border class and inline styles from all cards
  const cards = document.querySelectorAll('.ouija-lava-border');
  cards.forEach((card) => {
    card.classList.remove('ouija-lava-border');
    (card as HTMLElement).style.removeProperty('--i');
    (card as HTMLElement).style.removeProperty('border');
    (card as HTMLElement).style.removeProperty('animation');
    (card as HTMLElement).style.removeProperty('box-shadow');
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

function init() {
  safeChrome(() => {
    chrome.storage.local.get(['apiKey', 'ouija_expanded', 'ouija_backend_url', 'ouija_token', 'ouija_sidebar_side'], (result) => {
      if (!result.apiKey) return;
      currentApiKey = result.apiKey;
      backendUrl = result.ouija_backend_url || BACKEND_URL;
      ouijaToken = result.ouija_token || '';
      sidebarSide = result.ouija_sidebar_side === 'left' ? 'left' : 'right';
      expanded = result.ouija_expanded ?? true;

      // If user explicitly toggled sidebar off, don't inject it
      if (result.ouija_expanded === false) {
        expanded = false;
        // Still inject but immediately hide (so toggle can bring it back)
        injectSidebar();
        if (sidebarContainer) {
          sidebarContainer.style.transition = 'none';
          sidebarContainer.style.transform = `translateX(${sidebarSide === 'left' ? -340 : 340}px) scaleX(0.96)`;
          sidebarHidden = true;
        }
      } else {
        injectSidebar();
      }
      resetIdleTimer();
      showWelcomeOverlay();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
