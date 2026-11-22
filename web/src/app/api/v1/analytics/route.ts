// Ouija API — analytics (cross-site funnel drop-off). ⚠️ SCAFFOLD (Phase C). NOT IMPLEMENTED.
//
// Design: API_DESIGN.md. Would return the CALLING CLIENT'S OWN cross-site drop-off, scoped to
// their org_id. Blocked on enforced tenancy (migration 003 RLS) and the client-token auth
// scheme — see flags A1/A2/A3. Returns 501 and touches no data.
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 20;

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Not implemented',
      detail:
        'The analytics API is designed but not built. See API_DESIGN.md — it is blocked on ' +
        'enforced org_id tenancy (A2) and the client auth scheme (A1), and the aggregate-vs-' +
        'per-client question (A3) is an open strategic decision.',
    },
    { status: 501 }
  );
}
