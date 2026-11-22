// Ouija API — billable onboarding ledger. ⚠️ SCAFFOLD (Phase C). NOT IMPLEMENTED.
//
// Design: API_DESIGN.md. Would expose the CALLING CLIENT'S OWN auditable onboarding ledger
// (the verifiable invoice basis — server-stamped completions from Phase A), scoped to their
// org_id. Blocked on enforced tenancy + client auth (A1/A2). Returns 501, touches no data.
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 20;

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Not implemented',
      detail:
        'The ledger API is designed but not built. See API_DESIGN.md — it reads the ledger ' +
        'Phase A populated, but is blocked on enforced org_id tenancy (A2) and the client auth ' +
        'scheme (A1). Pricing/metering of API access is flag A4.',
    },
    { status: 501 }
  );
}
