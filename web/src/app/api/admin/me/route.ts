// Admin session check — public (no auth). The UI uses this to decide whether to
// show the login form. `authed` reflects the cookie; `configured` reflects whether
// ADMIN_PASSWORD is set at all (when false the whole surface fails open).
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, adminConfigured } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 20;

export async function GET(req: NextRequest) {
  return NextResponse.json({ authed: isAdmin(req), configured: adminConfigured() });
}
