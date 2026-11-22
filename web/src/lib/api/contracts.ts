// Ouija API & Handshake — CONTRACT TYPES (Phase C scaffold).
//
// ⚠️ SCAFFOLD ONLY. These types express the PROPOSED contracts for the handshake protocol
// (HANDSHAKE_PROTOCOL.md) and the Ouija API (API_DESIGN.md). They are NOT wired into any
// load-bearing behavior — the route stubs that reference them return 501. The shapes are
// deliberately conservative; several fields hang on decisions flagged for Luc in the docs.
// Do not start depending on these in product code until those decisions are made.

import { z } from 'zod';

// ── Handshake (C1) ─────────────────────────────────────────────────────────────

/**
 * The payload a B2B client's native chatbot sends to summon Ouija and hand off context when
 * it detects a user struggling with a cross-site task. See HANDSHAKE_PROTOCOL.md.
 *
 * FLAGGED: the auth fields (client_id + signature vs a bearer client key) and whether the
 * full conversation transcript should be sent (privacy) are decisions for Luc.
 */
export const HandoffPayloadSchema = z.object({
  // Client identity (server-to-server). FLAGGED: exact auth scheme TBD — see API_DESIGN.md §Auth.
  client_id: z.string().min(1).max(120),

  user: z.object({
    // An opaque, client-side pseudonymous id — NOT PII. Maps to Ouija's device journey later.
    anonymous_id: z.string().min(1).max(200),
    locale: z.string().max(20).optional(),
  }),

  goal: z.object({
    // Natural-language intent ("connect my Stripe account to my store").
    intent: z.string().min(1).max(500),
    // Optional: a known bespoke flow slug the client maps this intent to (warm path).
    target_flow: z.string().max(120).optional(),
    // The sites the journey is expected to span (brand tokens or hostnames).
    sites_involved: z.array(z.string().max(200)).max(20).optional(),
  }),

  // Conversation context. FLAGGED: send full transcript vs a model-summarized brief (privacy +
  // payload size). Default here is "summary or short tail", capped.
  conversation: z
    .array(z.object({ role: z.enum(['user', 'assistant', 'system']), text: z.string().max(4000), ts: z.union([z.string(), z.number()]).optional() }))
    .max(50)
    .optional(),

  // Where the user is right now, if the client knows it.
  state: z
    .object({
      current_site: z.string().max(200).optional(),
      current_url: z.string().max(2000).optional(),
      last_action: z.string().max(500).optional(),
    })
    .optional(),

  // The detected failure, if any — seeds the diagnose/failure-squad at the right node.
  failure_point: z
    .object({
      description: z.string().max(1000),
      node_hint: z.string().max(120).optional(),
      error_signal: z.string().max(1000).optional(),
    })
    .optional(),

  // Optional callback for Ouija to report completion/abandonment back to the client funnel.
  return: z.object({ callback_url: z.string().url().max(2000).optional() }).optional(),
});
export type HandoffPayload = z.infer<typeof HandoffPayloadSchema>;

/** What the handoff endpoint returns: a short-lived code the user's extension redeems. */
export interface HandoffResult {
  // Short-lived, single-use code the extension exchanges for the live session (graph+pos+token).
  handoff_code: string;
  expires_in: number; // seconds
  // A deep link that opens/triggers the extension's resume flow (mechanism FLAGGED — see doc).
  resume_url?: string;
}

/**
 * The mapping interface from a handoff onto Ouija's journey graph. An implementation decides
 * how goal/failure_point become a configured graph + start position. (Stub: not implemented.)
 */
export interface ContextToGraph {
  // Resolve the handoff to a journey graph + the node to start the user on.
  resolve(handoff: HandoffPayload): Promise<{
    graph: unknown;        // JourneyGraph — typed loosely here to avoid a load-bearing import
    position: string;      // start node id (e.g. the failure_point node)
    source: 'warm' | 'cold' | 'recovery';
  }>;
}

// ── Ouija API (C2) ─────────────────────────────────────────────────────────────

/** Claims carried by a per-client API token (server-to-server). FLAGGED: key vs OAuth. */
export interface ClientTokenClaims {
  client_id: string;
  org_id: string;        // ties to migration 003 tenancy (not yet enforced)
  scopes: ClientScope[];
}

export type ClientScope =
  | 'handoff:create'     // summon guidance
  | 'analytics:read'     // query the client's own cross-site funnel
  | 'ledger:read'        // query the client's own billable onboarding ledger
  | 'graphs:write';      // CRUD the client's own flows programmatically

/** Analytics query — cross-site drop-off in the CLIENT'S OWN funnel. */
export const AnalyticsQuerySchema = z.object({
  flow: z.string().max(120).optional(),
  from: z.string().max(40).optional(), // ISO date
  to: z.string().max(40).optional(),
  group_by: z.enum(['node', 'site', 'day']).optional(),
});
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

/** Ledger query — auditable, billable onboarding completions (the verifiable invoice basis). */
export const LedgerQuerySchema = z.object({
  flow: z.string().max(120).optional(),
  status: z.enum(['completed', 'abandoned', 'active']).optional(),
  from: z.string().max(40).optional(),
  to: z.string().max(40).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
});
export type LedgerQuery = z.infer<typeof LedgerQuerySchema>;
