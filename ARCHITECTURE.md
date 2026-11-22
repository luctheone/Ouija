# Ouija — Architecture

> How the pieces fit. Read alongside README.md. Stack choices favor speed-to-working-demo over production-grade.

## System shape (three deployables + one extension)

```
┌─────────────────────────────────────────────────────────────┐
│  WEB APP (Next.js on Vercel)                                  │
│  • Landing page (hero, video, "Demo it" dropdown, counter)    │
│  • Demo flow pages (Shopify / Stripe judge walkthroughs)      │
│  • Admin panel (journeys, visual journey graph, rates, chatbot)│
│  • Extension setup page                                        │
│  • Features page                                              │
└───────────────┬───────────────────────────────────────────────┘
                │  (shared backend / API routes)
┌───────────────▼───────────────────────────────────────────────┐
│  BACKEND (Next.js API routes + serverless / AWS)              │
│  • /plan      → build journey graph from docs (cold) or load   │
│  • /next-step → DOM snapshot + graph + position → element pick │
│  • /verify    → DOM snapshot → did the step complete?          │
│  • /diagnose  → on breakpoint: fork graph, hypothesize, reroute│
│  • /ingest    → metadata-tag a client's onboarding docs        │
│  • /sessions  → log journey events (feeds admin panel + graph) │
│  Engine: Anthropic SDK (Haiku perception / Sonnet reasoning)   │
│  Retrieval: metadata lookup (warm) + Exa (cold)                │
│  Store: Supabase (sessions, graphs, docs, events)             │
└───────────────┬───────────────────────────────────────────────┘
                │  (messaging)
┌───────────────▼───────────────────────────────────────────────┐
│  EXTENSION (MV3 Chrome)                                        │
│  • service worker (background): cross-tab state, message route │
│  • content script (per page): DOM serialize, overlay render    │
│  • sidebar UI (React, Shadow-DOM isolated)                    │
│  • clipboard manager (ephemeral)                              │
└───────────────────────────────────────────────────────────────┘
```

## The core loop (per guided step)
1. **Content script** serializes the page: `querySelectorAll` on `[role=button], a, button, input, select, textarea, [role=link/tab/...]`, filter to visible, emit `{index, tag, type, text, ariaLabel, placeholder, nearbyLabel, visibleInViewport}`. (Validated on Meta — `nearbyLabel` is load-bearing; query on role not tag; ~10% icon-only elements need title/SVG/image fallback.)
2. **Backend /next-step** receives the serialized list + the journey graph + current position → engine returns `{elementIndex, tooltip, pointDirection, done, confidence}`.
3. **Content script** re-locates element by index (identical filter), renders Shadow-DOM overlay: spotlight (gentle glow default; getBoundingClientRect geometry, ~4px loose is fine), pointer, coachmark with copy button. Tracks on scroll/resize (waits for scroll-settle).
4. User acts (the human does the consequential thing). **/verify** re-reads DOM → detects completion (toast/field/url change) → sidebar surfaces "Looks done ✓ — continue?" → Confirm advances, deny forks.
5. State updates on the **journey graph** (in-memory + persisted to session for the admin panel).

## The journey graph (the centerpiece)
- A graph object: nodes = expected steps, edges = transitions, plus a `position` pointer and `forks[]`.
- Held as STATE (in worker memory during session + persisted to Supabase per session for the admin panel). NOT embedded/vector-searched.
- **Cold start:** no doc → Planner agent builds the node sequence from Exa-retrieved docs.
- **Warm/known:** load the pre-built graph for that flow (Shopify pixel-connect, Stripe KYB) keyed by (site, task).
- **On breakpoint:** Diagnosis agent forks at the current node, adds hypothesis branches, marks dead-ends, re-routes position.
- **Visualization:** the admin panel and the extension "advanced" view render this graph (nodes, current position lit, forks branching, dead-ends greyed). Use a simple force/tree layout — d3 or a lightweight graph lib; keep it beautiful but not over-engineered.

## Agent orchestration (conditional, implemented)

### Core principle: intelligence lives in the graph, not the runtime

The graph is not just state — it's the intelligence. Each node carries its own verification logic, expected failures, and recovery paths. Per-step runtime calls are CHEAP (verify URL, check element presence). Expensive reasoning happens ONCE during graph construction, not N times during execution.

### Bespoke mode (live demo path — per-step calls are cheap)

The graph is fully pre-configured by the client via the admin panel:
- Nodes specify `verify_condition` (some = simple URL parse, some = screenshot → Sonnet verify)
- Nodes carry attached breakpoints with `{ common_failure, symptoms, suggested_fix, severity }`
- Per-node documentation provides context for the diagnosis agent IF escalation is needed

**Runtime:** The agent follows the graph node-by-node. At each step:
1. Serialize DOM + compare to `verify_condition`
2. If simple (URL match, element present): verify locally, no LLM call
3. If complex (visual confirmation needed): one cheap screenshot → Sonnet verify call
4. If verified: advance. If user deviates: escalate (see below)

**Escalation (only on genuine deviation):**

| Deviation type | Response | Cost |
|----------------|----------|------|
| Wrong URL | Chat message with correct link | Zero LLM calls |
| Expected failure (matches node breakpoint) | Serve pre-configured `suggested_fix` | Zero LLM calls |
| Simple confusion (element not visible) | Nudge message | Zero LLM calls |
| Complex deviation (nothing matches) | Launch investigator → metadata RAG → Exa → diagnose → fork graph | 2-3 LLM calls |

### Plug-and-play mode (video demo — front-loaded intelligence)

No pre-configuration. Ouija deploys **forward-deployed agents** (Palantir model) to auto-generate the equivalent of a bespoke graph:

1. **Research team (Exa)** — parallel web searches to map the onboarding flow
2. **Graph builder (Planner agent)** — assembles nodes with verify_conditions and confidence scores
3. **Failure anticipator** — identifies likely breakpoints per node, pre-computes recovery paths
4. **Output** — a fully configured graph indistinguishable from bespoke (same schema, same per-node metadata)

The language is precise: intelligence is **front-loaded** into graph construction. The runtime execution path is identical regardless of whether a human or an agent built the graph.

### The failure squad (complex deviation only)

**Trigger**: user genuinely deviates from all known paths AND no pre-configured breakpoint matches.

1. **Docs Agent (metadata retrieval)** — searches client's ingested docs in Supabase. Metadata-tagged by `(site, task, node_id)`.
2. **Research Agent (Exa)** — searches the open web for failure context, updated docs, known issues.
3. **Diagnosis Agent (Anthropic SDK tool_use)** — receives research + docs + DOM state. Tools: `inspect_elements`, `check_url_state`, `submit_diagnosis`. Outputs: hypothesis, graph fork, recovery instruction.

This is the expensive path. It should fire rarely in bespoke mode (breakpoints cover most failures) and more often in plug-and-play (lower-confidence graph).

## Journey graph (the stateful centerpiece, visualized)

### Data structure
Nodes = user actions. Edges = transitions. Forks = error branches. Position pointer = where the user is now.

### Node states
- `done` — user completed this step (filled, warm)
- `current` — user is here now (glowing, amber)
- `future` — not yet reached (dim outline)
- `error` — a fork point where failure was detected (red-tinted)

### Visualization
- **End user (sidebar)**: default = compact progress dots. "Advanced" button toggles a vertical tree view — trunk line with branching error forks.
- **Admin dashboard**: full-width tree with labels, hover details, aggregate heat map on stall nodes.
- **Agents**: read the graph as JSON to understand context; Diagnosis writes forks back to it.

### Fork anatomy
```json
{
  "at": "node_id_where_error_occurred",
  "branch": [/* alternative recovery steps */],
  "deadEnd": false,
  "hypothesis": "why this happened",
  "recovery_instruction": "human-friendly next action"
}
```

## Retrieval (dual-source, metadata not vectors)

- **Client docs (warm/bespoke):** metadata-tagged by `(site, task, node_id?)` in Supabase → direct key lookup. Fast, deterministic. The Docs Agent queries this.
- **Web docs (cold/plug-and-play):** Exa search on the SaaS + task → clean structured content → straight into Research Agent or Planner context.
- **No vector DB.** Metadata key lookup for warm, Exa for cold. This minimizes pre-stream latency.

## Extension ↔ backend
- Content script ↔ service worker via `chrome.runtime` messaging.
- Service worker ↔ backend via fetch to the Next.js API routes.
- Cross-tab state: service worker holds the journey/session in `chrome.storage` (survives tab jumps + worker sleep). The "follows you across sites" mechanism. (v1 proves the shell, storage-auth-across-tabs, cross-domain injection — the only new bit is accumulating the journey trail, low risk.)

## The judge-demo special flow
- A demo API key (per company: Shopify/Stripe) unlocks a judge path: the extension guides the sandbox flow AND links the judge to the admin panel showing their own session. Real users never see the client admin panel — gate the "show me my session in the admin" on the demo-key flag.

## Meta Events Manager mockup page (Flow 1 — technical spec)

The cross-site moment in the Shopify demo requires the user to visit "Meta Events Manager" — but we don't want judges using real Meta credentials. Solution: a self-hosted mockup page at `/demo/meta-events-manager` on our Vercel deployment.

### Requirements
- **Visual fidelity:** Mimics Events Manager layout — dense left nav (Business Suite items), breadcrumb (Events Manager > Data Sources > Pixel Name > Settings), Pixel ID display field, Conversions API section with "Generate access token" button.
- **Real interactive DOM:** All elements must be standard interactive HTML (`button`, `input`, `[role=button]`, etc.) that Ouija's content script serializes and guides on exactly as it would on real Meta. The extension doesn't know or care that this is a mockup — it perceives the DOM identically.
- **Honesty banner:** Fixed top banner (outside the mockup chrome): *"This is a mockup of the Meta Events Manager — we don't want you finding or using real credentials. Ouija guides this page using the same DOM perception it uses on real sites."*
- **Generates demo credentials:** Clicking "Generate access token" produces a realistic-looking fake token (e.g., `EAABsbCS1iHgBO0ZC8...`). The Pixel ID is pre-populated (e.g., `548392017263841`). Both are copyable.
- **No auth required:** The page loads without login. It's a static mockup with interactive elements.

### What this proves
The extension's DOM serialization, element identification, highlight overlay, clipboard tool, and cross-site graph continuity all work identically on this page as they would on real Meta — because Ouija operates on DOM structure, not on any Meta-specific integration. The mockup is the honest way to demonstrate a real capability without requiring real credentials.

## Stripe demo storefront mockup page (Flow 2 — technical spec)

The Stripe Payment Link + Webhook flow requires the user to carry data between Stripe Dashboard and "their site." We host a mockup storefront at `/demo/stripe-storefront`.

### Requirements
- **Two sections:** (1) "Payment button" placeholder area with an embed code paste field, (2) "Webhook configuration" section with a signing secret input field.
- **Interactive DOM:** All fields are standard inputs/textareas. Ouija perceives and guides them.
- **Honesty banner:** Same pattern — explains this is a demo storefront.
- **Visual style:** Simple, clean. Could look like a generic website builder's settings page.
- **No Stripe API calls:** This page is static/mockup. It doesn't actually process the embed code or verify the secret — it just accepts the paste and shows a "Configured!" success state.

## AWS monitoring connect mockup page (Flow 3 — technical spec)

The AWS IAM flow requires a "third-party monitoring tool" that provides credentials to carry to AWS. Hosted at `/demo/aws-monitoring-connect`.

### Requirements
- **Displays two values:** "Our AWS Account ID: 000000000000" and "Your External ID: ouija-demo-xk9f2m" — both in copyable fields.
- **Instructions panel:** Step-by-step text (go to IAM, create role, etc.) — what the user would see on any monitoring tool's "Connect AWS" page.
- **Role ARN paste field:** At the bottom, a "Paste your Role ARN here" input. On paste, shows a "Connected!" success state.
- **Honesty banner:** *"This is a mockup of a monitoring tool's AWS connect page — Ouija guides you through the real AWS IAM Console."*
- **No vendor branding:** Generic "CloudWatch Connect" or similar neutral name. Not Datadog/New Relic specific.
- **The AWS Console side is REAL** — no mockup needed there. IAM is free.

### AWS Console constraints
- Requires the user to be logged into an AWS account.
- For live judge demos: judges would need AWS Console access (possible via hackathon shared account, but adds friction).
- **Recommended:** Record this demo as a video (Luc drives on the hackathon account). The recorded video shows REAL AWS Console + REAL Ouija guidance overlays. The mockup monitoring page is separately explorable by judges.

## Deep-linking / pre-configuration (technical notes)

All three demo flows use deep-links to skip navigation tedium and start the judge at the interesting moment.

### Implementation
- The demo API key encodes which flow to run (`shopify-meta-pixel`, `stripe-payment-link`, or `aws-iam-role`).
- On extension activation with a demo key, load the corresponding journey graph from Supabase.
- The graph has pre-completed steps marked `done` with the `position` pointer set to the first uncompleted node (the one just before the cross-site jump).
- The extension renders pre-completed nodes as filled/warm in the graph panel — the full journey is visible, but the user starts mid-flow.
- A brief sidebar message contextualizes: *"We've skipped the setup steps and started you right before the cross-site moment — the part where users get stuck."*

### What deep-linking does NOT mean
- Does NOT shorten the journey graph (all nodes present, some pre-marked done).
- Does NOT hide the full flow from the "Advanced" view (judges can see the complete graph).
- Does NOT skip the cross-site transition itself (that's the hero moment — always live).

### Sandbox/mockup strategy per flow

| Flow | Mockup pages (our Vercel) | Real third-party site | Sandbox mode |
|------|---------------------------|----------------------|--------------|
| Shopify→Meta | Meta Events Manager (`/demo/meta-events-manager`) | Shopify dev store (Partners, free) | Shopify = real admin; Meta = our mockup |
| Stripe | Demo storefront (`/demo/stripe-storefront`) | Stripe Dashboard (test mode) | Stripe = real dashboard; storefront = our mockup |
| AWS | Monitoring connect page (`/demo/aws-monitoring-connect`) | AWS IAM Console (hackathon account) | AWS = real console; monitoring tool = our mockup |

Pattern: we mock the SIMPLE side (the tool that provides/receives credentials) and use the REAL complex side (where the friction actually lives). This is honest — we're faking the environment to avoid real credentials, not faking the capability.

## Streaming
- Stream the sidebar guidance text (the Distiller's output) token-by-token for responsiveness.
- Keep work before first-token minimal: metadata lookup (warm) or pre-cached graph for the demo flow → the plan call is effectively instant on the demo path (pre-cache it).

## Stack
- **Frontend/web:** Next.js 16 (App Router), deployed Vercel. v0 for fast UI scaffolding of the admin panel + landing.
- **Extension:** MV3, React + Shadow DOM for the sidebar, vanilla content-script for serialize/overlay (keep the injected layer light).
- **Backend:** Next.js API routes (Vercel serverless). The engine is the hosted Anthropic API via the SDK — no self-hosted/AWS compute for inference.
- **Engine:** Anthropic SDK (`@anthropic-ai/sdk`) in `web/src/lib/engine.ts` — NOT AWS Bedrock (we migrated off during the hackathon; `lib/bedrock.ts` is now a deprecated re-export shim). Model split: Haiku (`MODEL_HAIKU`) for cheap per-step perception, Sonnet (`MODEL_SONNET`) for reasoning (chat, verify, diagnose, plan). Reads `ANTHROPIC_API_KEY` from the environment.
- **Retrieval:** Supabase metadata (warm) + Exa (cold).
- **Store:** Supabase (Postgres) — sessions, journey graphs (JSONB), docs, events. See `INTEGRATIONS.md` for schemas.
- **Design:** Ouija Design System (Reliquary dark theme default), liquid glass, Manrope + italic-serif wordmark.

**AWS sponsor requirement (hackathon-era):** the original "≥1 component on AWS" bar was satisfied by Bedrock. Since the engine migrated to the direct Anthropic SDK, the remaining AWS surface is the product side — the AWS IAM Console demo flow Ouija guides users through. (Historical hackathon constraint; not a current architecture requirement.)

## V1 carry-forward patterns (from tessra-extension — approach not code, re-derive fresh)

These are proven mechanisms from the v1 harness. Understand and re-implement clean; do not copy-paste.

### Element extraction (content.ts — extractInteractiveElements + findElementByIndex)
The v1 implementation is solid and validated. Key patterns to carry:
- **INTERACTIVE_SELECTOR** covering `button, a[href], input:not([type='hidden']), textarea, select, [role='button'], [role='link'], [role='tab'], [role='menuitem']` — role-based, not tag-based.
- **isOuijaElement guard** — filter out your own extension's UI from the serialized list using known IDs (`ouija-sidebar-root`, `ouija-step-overlay`, `ouija-highlight` etc). Critical: the agent must not try to click its own overlays.
- **extractInteractiveElements** returns `{index, type, text, id, ariaLabel, placeholder, nearbyLabel, visibleInViewport}` capped at 40 elements. The `nearbyLabel` implementation (label[for], closest label, previousElementSibling label) is load-bearing — carry it exactly.
- **findElementByIndex** re-locates the element using *identical filtering logic* to the snapshot — this is the contract that makes index-based picking reliable. If the filter drifts between snapshot and locate, the wrong element gets highlighted. Keep them in sync.
- **isHidden check** on `display/visibility/opacity` + zero-rect filter prevents invisible elements entering the list.

### Message routing (background.ts)
Clean, minimal service worker that routes messages by type between popup/sidebar/content. The pattern:
- `AUTH_SUCCESS` → broadcast to all tabs (they read storage on next load if content script not yet injected — the `.catch(() => {})` is deliberate).
- `STEP_UPDATE`, `RESHOW_OVERLAY`, `SHOW_BADGE`, `THEME_OVERRIDE` → forward to `_sender.tab?.id` only (the specific tab that sent it).
- `TOGGLE_SIDEBAR` → same, to sender's tab.
For the new build: add `JOURNEY_UPDATE` (graph position changed), `FORK_EVENT` (breakpoint hit), `VERIFY_REQUEST` (self-verification trigger), `CLIPBOARD_SAVE` and `CLIPBOARD_RETRIEVE` to this routing table.

### Cross-tab state + storage (storage.ts)
- `chrome.storage.local` for all persistent state — survives tab jumps, worker sleep, and cross-domain transitions. This is the "follows you across sites" mechanism.
- Pattern: `get([keys], callback)` / `set({key: value}, callback)` — straightforward, reliable.
- `deviceId` (UUID, generated once, persisted forever) is the right primitive for tracking a user's journey across tabs without requiring auth. Carry this — it's clean and PDPA-appropriate.
- For the new build: store the journey graph (`ouija_journey_${sessionId}`), the current graph position (`ouija_position_${sessionId}`), clipboard contents (`ouija_clipboard` — ephemeral, cleared on session end), and the demo API key type (`ouija_demo_key_type: 'shopify' | 'stripe'`).

### SPA navigation interception (content.ts)
The `history.pushState` / `history.replaceState` / `popstate` intercept pattern is essential for React/Next.js SPAs (like Shopify admin and Stripe dashboard) that don't do full page reloads. v1 calls `postPageContext()` + `checkOverlay()` + `postThemeToSidebar()` on each navigation. For the new build: add `checkJourneyPosition()` to this set — re-evaluate graph position on every SPA route change.

### Abort controller pattern for analysis (content.ts — analyzeAndHighlight)
The `AbortController` pattern (cancel in-flight request when a new one fires) prevents race conditions when DOM mutations trigger multiple rapid analysis calls. The debounce (2000ms via MutationObserver) + abort is the right combination: debounce prevents thrashing, abort ensures the latest call wins. Carry both.

### MutationObserver lifecycle (content.ts — startObserver/stopObserver)
Start the observer when a guided step is active on the current domain; stop it when the step completes or the overlay is dismissed. Tying the observer lifecycle to the step state prevents unnecessary background work. The 2000ms debounce on mutations is appropriate — DOM mutations on SPAs are frequent and noisy.

### Sidebar injection + iframe architecture (content.ts — injectSidebar)
- The sidebar is an `<iframe>` inside a fixed-position container div, not a direct DOM injection. This gives it full isolation from the host page's CSS and JS.
- The container uses `z-index: 2147483646` (one below the highlight overlay at `2147483644`-`2147483647`).
- `iframe.allow = "clipboard-write"` is required for the clipboard tool.
- `postMessage` between content script and iframe (via `iframe.contentWindow.postMessage`) is the right cross-origin communication mechanism.
- **The `!important` on every inline style** — this is mandatory for injected elements on arbitrary third-party pages. Host stylesheets will override without it.

### Smart sidebar repositioning (content.ts — repositionSidebar + checkPositionConflict)
When the highlighted element is near the right edge and the sidebar would cover it, automatically reposition to the left and show a toast. This is a real UX detail worth carrying: it prevents the sidebar from obscuring the element the agent just pointed at. The check: `rect.right > vw - SIDEBAR_WIDTH - SIDEBAR_GAP`.

### Idle fade (content.ts)
After 10s of no interaction, fade all Ouija elements to 40% opacity. Reset on keydown, click, or hover over Ouija elements. This is the "melts into the background when you're not using it" behaviour — directly expresses the "summoned not imposed" philosophy. Carry it.

### Theme detection (content.ts — detectPageTheme)
WCAG relative-luminance calculation on `document.body` / `documentElement` background-color to auto-select dark or light sidebar. Falls back to dark. Per-domain override persisted in storage (`ouija_theme_${domain}`). For the new build: this is the seed of the adaptive theming system — the detector logic is already here, just extend it toward the scheme-library pattern later.

### Toast notification (content.ts — showToast)
Lightweight inline toast (fixed, centered, auto-fade) for user-facing messages ("moved sidebar to avoid blocking that button"). Carry as-is — it's clean and dependency-free.

### Overlay drag (content.ts — setupOverlayDrag)
PointerEvent-based drag with `setPointerCapture` — the right approach for reliable drag on arbitrary pages. The top/bottom switching (from bottom-anchored to top-anchored on first drag) is a good UX detail. Carry the pattern; the new build's overlay will be positioned differently (coachmark near the element, not a floating panel) so adapt rather than copy.

### What v1 does NOT have (the new additions for the hackathon build)
- The journey graph (state object, forking, position tracking) — entirely new.
- Self-verification (agent re-reads DOM to detect step completion) — new.
- Conditional agent escalation — new.
- Exa doc-retrieval — new.
- Clipboard manager (user pastes keys → LLM saves → Option-C popup) — new.
- The "advanced" journey graph visualisation button — new.
- The web app (landing, demo flow, admin panel) — entirely new.
- Cross-site journey continuity (v1 tracks steps per-domain; new build tracks a continuous session *across* domains as a unified journey) — the key architectural upgrade.
- Browser-only (no desktop apps, PDFs, native authenticators — the honest breakpoint).
- No mobile (MV3 extensions don't run on mobile browsers).
- ~10% icon-only elements need fallback identification (title/SVG/image) — demo path doesn't depend on them.
- Dynamic re-serialization after DOM mutation needs a MutationObserver — handle for the demo flow's known mutations; don't generalize.
