# Ouija API — design spec (Phase C: DESIGN + SCAFFOLD ONLY)

> ⚠️ Design document with skeleton scaffold, **not** an implemented API. Load-bearing decisions
> are **flagged for Luc**. The route stubs return 501 and are inert. Reviews the design before
> building. Builds on the handshake protocol (`HANDSHAKE_PROTOCOL.md`) as one entry point.

## The thesis

Ouija is a **three-layer infrastructure** play:

```
┌── PERCEPTION ──────────────────────────────────────────────┐
│  The extension. Sees the DOM across domains, draws overlays. │
│  (Built.)                                                    │
├── CONTROL ─────────────────────────────────────────────────┤
│  The Ouija API. The surface OTHER products call to summon    │
│  guidance, query their funnel, and read the billable ledger. │
│  (This doc — designed, scaffolded, not built.)               │
├── DATA ────────────────────────────────────────────────────┤
│  The journey-graph ledger + cross-site onboarding-intelligence│
│  aggregation. Uniquely uncollectable by single-domain        │
│  incumbents. (Ledger now populated post-Phase A; aggregation  │
│  layer is future.)                                            │
└────────────────────────────────────────────────────────────┘
```

The API is the **control plane** that turns Ouija from a product into infrastructure: vendors
call it to summon guidance (the handoff), to measure where their users fall off across the
domain boundary (the number nobody has — the absence of that number is itself
proof of the thesis), and to verify/bill the onboarding ledger.

## Surface area (proposed)

| Endpoint | Who calls it | What it does | Scope |
|---|---|---|---|
| `POST /api/handoff` | client's native chatbot | summon Ouija with context (HANDSHAKE_PROTOCOL.md) | `handoff:create` |
| `GET /api/v1/analytics` | client's backend/dashboard | cross-site drop-off in the **client's own** funnel (per-flow, per-node, per-day) | `analytics:read` |
| `GET /api/v1/ledger` | client's backend / billing | the auditable, billable onboarding completions (the verifiable invoice basis) | `ledger:read` |
| `… /api/v1/graphs` (future) | client's backend | programmatic CRUD of the client's own flows (parity with the admin UI) | `graphs:write` |

All read endpoints are **strictly scoped to the calling client's own `org_id`** — the API never
exposes one tenant's data to another. (See FLAG A3 on aggregate/cross-client analytics.)

## Auth model

Two distinct token types — keep them separate:

- **Session token** (exists today): the HMAC token the *extension* carries (`X-Ouija-Token`),
  issued per user session. User-facing, short-lived-ish (7d).
- **Client API token** (new): a *server-to-server* credential identifying a vendor. Carries
  `ClientTokenClaims { client_id, org_id, scopes[] }` (`contracts.ts`). This is the API key a
  client puts in their backend to call the Ouija API.

This **directly depends on the tenancy work scaffolded in migration `003_security_tenancy.sql`**
(`org_id` on every row + RLS). The API cannot safely ship until `org_id` scoping is enforced —
otherwise scoped reads (`analytics`/`ledger`) would leak across tenants.

**→ FLAG A1 (Luc): client auth scheme.** Per-client API keys (simplest; rotateable; what the
admin `companies.api_key` already hints at) vs OAuth2 client-credentials (standard, heavier) vs
signed-payload HMAC (like the session token). Recommendation to evaluate: **per-client API keys
+ HMAC request signing** for the handoff (cheap, no OAuth server), revisit OAuth if enterprise
buyers demand it. Shared with HANDSHAKE_PROTOCOL F1.

## Relationship between the layers

- **Extension ↔ API:** the extension consumes a session minted *by* the API (via handoff) but
  otherwise talks to the existing per-session routes. The API is for the *client's servers*, not
  the extension.
- **API ↔ data layer:** `analytics` and `ledger` are read views over the `events`/`sessions`
  ledger that Phase A made real (server-stamped completions, populated payloads, abandoned
  lifecycle). The API is the productized, tenant-scoped, authenticated way to read that ledger —
  the "open-citation" verifiability the product promises ("clients see the citation, don't take
  our word").

## Flagged decisions (do not build past these)

- **A1** — client auth scheme (keys vs OAuth vs signed payloads). Shared with HANDSHAKE F1.
- **A2** — the API requires `org_id` tenancy + RLS **enforced** first (migration 003 is currently
  scaffolding with RLS commented + the app on the anon key). The API is blocked on this; it is the
  single biggest prerequisite.
- **A3** — does the analytics/measurement surface ever expose **aggregate cross-client** data (the
  compounding data-moat), or is it forever per-client only? Aggregate is the moat but raises
  privacy + competitive-trust questions. **Strategic decision.**
- **A4** — metering/pricing of API calls themselves (handoffs, analytics queries) vs pricing only
  on the per-onboarding ledger. Connects to the Stripe usage-based model (BZ2).
- **A5** — versioning + deprecation policy (the `/v1/` prefix is a placeholder commitment).
- **A6** — whether `graphs:write` (programmatic flow CRUD) ships at all, or flows stay admin-UI-only.

## Scaffold delivered (inert)

- `web/src/lib/api/contracts.ts` — `ClientTokenClaims`, `ClientScope`, `AnalyticsQuerySchema`,
  `LedgerQuerySchema` (+ the handoff types).
- `web/src/app/api/handoff/route.ts` — handoff stub (501).
- `web/src/app/api/v1/analytics/route.ts` — analytics stub (501).
- `web/src/app/api/v1/ledger/route.ts` — ledger stub (501).

Every stub returns **501 Not Implemented** and performs no data access — they express the
contract in code without shipping any behavior or any anonymous data surface.
