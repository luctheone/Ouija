// Handshake protocol — handoff endpoint. ⚠️ SCAFFOLD (Phase C). NOT IMPLEMENTED.
//
// Design: HANDSHAKE_PROTOCOL.md. This stub validates the proposed payload contract so
// integrators get a useful shape error, then returns 501 — it mints NO session, issues NO
// code, and touches NO data. It exists to pin the contract in code, not to ship behavior.
// Do not implement past the decisions flagged in HANDSHAKE_PROTOCOL.md (F1–F5).
import { NextRequest, NextResponse } from 'next/server';
import { parseBody, isResponse } from '@/lib/validate';
import { HandoffPayloadSchema } from '@/lib/api/contracts';

export const runtime = 'nodejs';
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  // Validate the contract (helps integrators), but go no further.
  const body = await parseBody(req, HandoffPayloadSchema);
  if (isResponse(body)) return body;

  return NextResponse.json(
    {
      error: 'Not implemented',
      detail:
        'The handshake protocol is designed but not built. See HANDSHAKE_PROTOCOL.md — the ' +
        'cross-domain extension-summon mechanism (F3), client auth (F1), and handoff privacy ' +
        '(F4) are pending decisions.',
    },
    { status: 501 }
  );
}
