# Handshake Protocol — design spec (Phase C: DESIGN + SCAFFOLD ONLY)

> ⚠️ This is a **design document with a skeleton scaffold**, not an implemented feature. The
> load-bearing architectural choices are **flagged for Luc** and must be decided before any of
> this is built. The scaffold (`/api/handoff` route stub + `web/src/lib/api/contracts.ts`)
> returns 501 and is inert. This is genuinely novel — review the design before building on it.

## What it is

The mechanism by which Ouija integrates with a B2B client's **existing native chatbot**. When
the client's in-app assistant detects a user struggling with a task that requires leaving the
client's domain (configure DNS, grab a key from another dashboard, set up a pixel), it
**summons Ouija**, hands off context, and Ouija continues the guidance **across the domain
boundary the client's chatbot cannot cross**. This is the wedge behind the product (see `ARCHITECTURE.md`) made
concrete: "the light that follows them out," triggered from inside the vendor's own product.

```
Client's native chatbot (in vendor.com)
   │  detects cross-site struggle
   ▼
POST /api/handoff  ──mint──►  handoff_code + resume_url
   │
   ▼
User's Ouija extension redeems the code ──►  live session (graph + position + session_token)
   │
   ▼
Ouija guides across the third-party sites, failure-squad pre-seeded at the failure point
   │
   ▼  (optional) callback_url  ◄──  completion / abandonment reported back to the client funnel
```

## (a) Handoff payload schema

Defined in code as `HandoffPayloadSchema` (`web/src/lib/api/contracts.ts`). Shape:

| Field | Purpose |
|---|---|
| `client_id` | Which vendor is summoning Ouija (auth — see flag F1). |
| `user.anonymous_id` | Opaque pseudonymous id from the client (NOT PII); ties to Ouija's device journey. |
| `goal.intent` | Natural-language goal ("connect Stripe to my store"). |
| `goal.target_flow?` | A known bespoke flow slug (warm path) if the client maps the intent. |
| `goal.sites_involved?` | Sites the journey spans. |
| `conversation?` | Context history (see flag F4 — full transcript vs summary). |
| `state?` | Where the user is now (current_site/url/last_action). |
| `failure_point?` | The detected failure — seeds the diagnose agent at the right node. |
| `return.callback_url?` | Where Ouija reports completion/abandonment (funnel attribution). |

## (b) Trigger mechanism — two options, assessment + recommendation

**Option 1 — Chatbot-initiated tool (context-rich, high-intent).** The client's native chatbot
is given an Ouija tool (`summon_ouija`) it calls when it detects struggle. Fires exactly at the
moment of friction, carries full conversation context.
- ✅ Highest intent, richest context, invisible until needed (matches "summoned, not imposed").
- ⚠️ Requires the client to wire a tool into their assistant; depends on their struggle-detection.

**Option 2 — Permanent cross-site-guidance element (always-available, user-initiated).** A
persistent "Get guided help" affordance in the client's dashboard the user clicks.
- ✅ No dependency on the client's struggle-detection; discoverable; zero per-event integration.
- ⚠️ Lower intent, less context (no failure_point), more like a generic help button.

**Recommendation: both coexist, lead with Option 1.** The tool is the wedge — context-rich,
fires at friction, demos the "follows you out" magic. The permanent element is the
always-available fallback for clients who can't (or won't) wire struggle-detection. They share
the same `/api/handoff` endpoint; Option 2 simply sends a sparser payload (no `failure_point`,
maybe no `conversation`). **→ FLAG F2 (Luc): confirm both, and whether Option 2 ships at all in v1.**

## (c) Context → journey graph mapping

The `ContextToGraph` interface (`contracts.ts`) resolves a handoff to `{graph, position, source}`:

1. `goal.target_flow` matches a bespoke graph → **warm**: load it; set `position` at the
   `failure_point.node_hint` node if given, else the first node.
2. No match → **cold**: the planner builds from `goal.intent` (NOTE: cold-start is deprioritized
   per Phase B3, so this path is best-effort until cold-start is revived).
3. `failure_point` present → pre-seed the diagnose/failure-squad at that node (a fork is
   anticipated, not discovered at runtime — reuses the existing `/api/diagnose` splice path).

This deliberately reuses the existing graph + diagnose machinery — the handoff is a new *entry
point*, not a new runtime.

## (d) Continuity — the extension picks up the session

The hard, novel part: **a website cannot directly invoke a user's browser extension** (by
design — that would be a security hole). So the handoff is a two-step exchange:

1. `/api/handoff` mints a short-lived, single-use `handoff_code` + a `resume_url`.
2. The user's Ouija extension redeems the code → receives the live session (graph + position +
   a normal `session_token` from the existing HMAC auth). From there it's the ordinary guide loop.

**✅ DECISION F3 (Luc, decided): install-prompt as the universal path + `externally_connectable`
as the bespoke seamless upgrade.**

**Baseline — the install prompt (confirmed).** When the client's native chatbot detects the
cross-site breakpoint, it tangibly tells the user: *"This next part happens on another site — get
Ouija to walk you through it,"* with the install link + the client's code. First-time users
install, land on a hosted `resume?code=…` page (the extension's content script detects the code
and starts the session), and they're guided. Zero client-page coupling; works for everyone.

**Upgrade — `externally_connectable` for bespoke clients (accepted).** Here's how it works and
why your instinct is right:

- It's a manifest field: `"externally_connectable": { "matches": ["https://app.acmeclient.com/*"] }`.
  A web page on a listed origin can call `chrome.runtime.sendMessage("<ouija-extension-id>", payload)`
  to talk **directly** to Ouija's background service worker — *if the extension is installed*.
- For a returning user who already has Ouija, this is **seamless**: the client's chatbot fires the
  handoff and the sidebar lights up in place — no extra tab, no redirect. The richest version of
  the magic.
- **Your point stands:** allowlisting each client domain in the manifest is a non-issue *because
  we're bespoke/forward-deployed anyway*. With a handful of high-touch design partners, adding
  `app.partner.com` to the matches list is exactly the kind of per-client tailoring we already do.
- **The one real caveat to know (not a blocker):** `externally_connectable` matches live in the
  *shipped manifest*, so onboarding a new client's domain means **publishing an extension update**
  — which carries Chrome Web Store review lag (hours–days). For bespoke that's fine (you're not
  adding clients hourly), but it means "new client domain" = "ship a new extension version," not a
  config toggle. Two mitigations if that ever chafes: (a) batch client domains per release, or
  (b) keep the install-prompt/`resume?code` path as the always-instant fallback so a brand-new
  client works *today* while their `externally_connectable` entry ships in the next version.
- **Also note:** `externally_connectable` only *messages* an already-installed extension — it does
  **not** install it. So the install prompt is still the first-touch path for every new user; the
  two compose exactly as intended (try direct-message → if not installed, fall back to the prompt).
  The chatbot detects "installed?" by attempting the message and catching the failure.

Net: **install-prompt is the floor, `externally_connectable` is the seamless ceiling for bespoke
partners.** This is decided; the only thing left is the build.

**→ FLAG F4 (Luc): privacy of the handoff.** `conversation` may contain user data. Decide:
full transcript vs a model-generated summary; retention window; and the consent/disclosure the
client must show the user before summoning Ouija (ties to the ToS/DPA paper kit, BZ7).

**→ FLAG F5 (Luc): no-extension fallback.** Require pre-install, or offer a degraded hosted-guide
experience (a hosted page that walks the steps without the on-page overlay)? Affects reachability.

## Scaffold delivered (inert)

- `web/src/app/api/handoff/route.ts` — POST stub: validates `HandoffPayloadSchema`, then returns
  **501 Not Implemented** (no session minted, no code issued). Marked clearly as scaffold.
- `web/src/lib/api/contracts.ts` — `HandoffPayloadSchema`, `HandoffResult`, `ContextToGraph`.

## Decisions status
- **F1** — client auth scheme (API key vs signed payload vs OAuth client-credentials) — shared with API_DESIGN.md. *Open.*
- **F2** — confirm both triggers; does the permanent element (Option 2) ship in v1? *Open.*
- **F3** — ✅ **DECIDED:** install-prompt as the universal floor + `externally_connectable` as the seamless bespoke ceiling. Caveat noted: new client domain = new extension release (fine for bespoke). Only the build remains.
- **F4** — handoff privacy: transcript vs summary, retention, consent/disclosure. *Open* (closely tied to F5 + the ToS/DPA kit).
- **F5** — no-extension fallback strategy. *Leaning pre-install via the prompt; a hosted degraded guide is a maybe.* Confirm.
