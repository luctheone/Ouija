# Ouija

**The light that follows your users out.**

SaaS companies spend millions perfecting in-app onboarding — then go blind the moment a user leaves to configure something on a site they don't control (a domain registrar, an ad platform, a payment dashboard, an identity provider). That blind zone is exactly where non-technical users quit. Ouija is a user-side browser extension that guides them through complex setup **across any website**, with visual on-page overlays. It guides the human; it never auto-executes.

## Why it's different
Every onboarding tool today (WalkMe, Pendo, Whatfix, Frigade) is installed by the vendor and lives inside a single domain — blind the instant the user leaves. Computer-use agents (Operator, Claude CU, Nova Act) are built to *do*, not *teach*, and can't be trusted in a user's real sensitive accounts. Ouija is the empty slot: user-installed, cross-site, and **guidance-only** — which makes it safe in accounts where autonomous action is unacceptable, and structurally hard to weaponize via prompt-injection (it never acts, it only points).

## What it does
- **Perceives** the live page (DOM serialization, accessibility-aware).
- **Reasons** over a stateful **journey graph** — the expected cross-site flow, with live forking when a user hits a breakpoint.
- **Guides** with on-page overlays: a glowing spotlight, a pointer, a coachmark with copy-to-clipboard.
- **Verifies** each step by re-reading the page (preferring cheap local URL/clipboard checks), then confirms with the user.
- **Recovers** from errors by forking the graph, diagnosing, and re-routing.
- **Follows** the user across tabs and domains — the cross-site journey is the whole point.

## Repository layout
- `web/` — Next.js 16 app: landing, demo flows, vendor admin panel, and all backend API routes (the engine, retrieval, session/auth).
- `extension/` — MV3 Chrome extension: content script (serialize + overlay), service worker (cross-tab state), React Shadow-DOM sidebar.
- `web/supabase/seeds/*.json` — version-controlled journey-graph snapshots (the product's core data).
- `ARCHITECTURE.md`, `INTEGRATIONS.md`, `API_DESIGN.md`, `HANDSHAKE_PROTOCOL.md` — design docs.

## Local development

### Prerequisites
- Node 20+ and npm.
- A Supabase project (URL + anon key) with the tables from `INTEGRATIONS.md` applied (the SQL is in `web/supabase/`). Seed the demo graphs from `web/supabase/seeds/`.
- An Anthropic API key.
- (Optional) an Exa API key — only the cold-start / plug-and-play path needs it; everything else degrades gracefully without it.
- Google Chrome (or any Chromium) to load the extension.

### Environment variables
Create `web/.env.local` (gitignored) and fill in the names below.

| Name | Required? | What it's for |
|------|-----------|---------------|
| `ANTHROPIC_API_KEY` | **Yes** | The engine. Claude via `@anthropic-ai/sdk` (`web/src/lib/engine.ts`) — Sonnet for reasoning, Haiku for cheap per-step calls. |
| `SUPABASE_URL` | **Yes** | Supabase project URL (store: sessions, journey graphs, docs, events). |
| `SUPABASE_ANON_KEY` | **Yes** | Supabase anon key used by the server client. |
| `SESSION_SECRET` | **Yes (before deploying)** | HMAC secret used to sign/verify extension session tokens (`X-Ouija-Token`). |
| `ADMIN_PASSWORD` | **Yes (before deploying)** | Password for the `/admin` panel and `/api/admin/**`. Admin stays locked until you set it. |
| `EXA_API_KEY` | Optional | Cold retrieval for the plug-and-play path. Without it, cold-start degrades; warm/bespoke flows are unaffected. |
| `STRIPE_SECRET_KEY_TEST` | Optional | Stripe **test mode** only (billing is not yet a live integration). |
| `STRIPE_PUBLISHABLE_KEY_TEST` | Optional | Stripe test publishable key. |

Operator warning: set both `SESSION_SECRET` and `ADMIN_PASSWORD` before deploying anywhere reachable.

### Run the web app
```bash
cd web
npm install
npm run dev          # http://localhost:3000
```
Other scripts: `npm run build` (production build), `npm run start` (serve the build), `npm run lint`.

### Build and load the extension
```bash
cd extension
npm install
npm run build        # bundles to extension/dist via tsup (npm run dev to watch)
```
Then either:
- **Load unpacked:** open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the `extension/` directory (it loads `manifest.json` + the built `dist/`); or
- **Packaged zip:** run `npm run package` to produce `ouija-extension.zip`, then load/distribute that.

The extension talks to the web app's API. For local dev, point it at `http://localhost:3000` (or your deployed URL). Sessions start at `/api/sessions/start`, which issues the `session_token` the extension then sends back as the `X-Ouija-Token` header on every call.

### Run tests
```bash
cd web && npm test          # vitest run (npm run test:watch to watch)
```
Tests live in `web/src/lib/__tests__/` (currently `auth`, `validate`, `verify-match`). Tests are required for changes to the core loop (serializer, verify-condition DSL, next-step/verify/diagnose contracts, graph state machine) — add to this suite, don't skip.

## Architecture orientation
The extension serializes the live DOM (role-based, accessibility-aware) and renders Shadow-DOM overlays; the Next.js backend holds the agent loop — it picks the next element, verifies progress (cheaply, locally where possible), and only escalates to an Exa-backed planner/diagnosis agent when the user genuinely deviates from the journey graph. The journey graph is live reasoning *state*, mutated and persisted per session, not a static lookup. Engine calls go through `web/src/lib/engine.ts` (the Anthropic SDK); retrieval is Supabase metadata key-lookup (warm) plus Exa (cold). For the full picture, read `ARCHITECTURE.md` (how) and `INTEGRATIONS.md` (external APIs and schemas). `API_DESIGN.md` and `HANDSHAKE_PROTOCOL.md` cover the vendor-facing API, which is designed but not yet built.

## Status
The demo flows run on self-hosted mock pages under `/demo/` (not real third-party sites). The vendor-facing API (`/api/handoff`, `/api/v1/*`) is scaffolded but returns 501 — it is a design spec, not shipped functionality.
