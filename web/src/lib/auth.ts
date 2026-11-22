// Auth — stateless HMAC session tokens for the extension, + a simple admin gate.
//
// SECURITY CONTRACT (every API route depends on this — do not change formats casually):
//  - The extension receives a `session_token` from /api/sessions/start (and cold-start)
//    and MUST send it on every subsequent backend call as header `X-Ouija-Token`
//    (Authorization: Bearer <token> also accepted).
//  - Protected routes call: const s = requireSession(req); if (isResponse(s)) return s;
//  - Admin routes call:      const a = requireAdmin(req); if (isResponse(a)) return a;
//
// Runtime: Node only (uses node:crypto). Do NOT import this from middleware (Edge runtime).
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const DEV_SECRET = 'ouija-dev-insecure-secret-change-me';
const SECRET = process.env.SESSION_SECRET || DEV_SECRET;
if (SECRET === DEV_SECRET) {
  console.warn('[auth] SESSION_SECRET is not set — using an INSECURE dev default. Set SESSION_SECRET in the environment for real auth.');
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf as any).toString('base64url');
}
function hmac(data: string): string {
  return b64url(crypto.createHmac('sha256', SECRET).update(data).digest());
}
function safeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)); } catch { return false; }
}

export function isResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}

// ── Session tokens ────────────────────────────────────────────────────────────

export interface SessionClaims { sid: string; did: string; }

export function signSessionToken(claims: SessionClaims): string {
  const now = Math.floor(Date.now() / 1000);
  const p = b64url(JSON.stringify({ sid: claims.sid, did: claims.did, iat: now, exp: now + TTL_SECONDS }));
  return `v1.${p}.${hmac(p)}`;
}

export function verifySessionToken(token: string | null | undefined): SessionClaims | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  const [, p, sig] = parts;
  if (!safeEq(sig, hmac(p))) return null;
  try {
    const data = JSON.parse(Buffer.from(p, 'base64url').toString()) as { sid?: string; did?: string; exp?: number };
    if (typeof data.exp !== 'number' || data.exp < Math.floor(Date.now() / 1000)) return null;
    if (!data.sid || !data.did) return null;
    return { sid: data.sid, did: data.did };
  } catch { return null; }
}

export function getToken(req: NextRequest): string | null {
  const h = req.headers.get('x-ouija-token');
  if (h) return h;
  const auth = req.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

/** Returns the verified session claims, or a 401 NextResponse to return immediately. */
export function requireSession(req: NextRequest): SessionClaims | NextResponse {
  const claims = verifySessionToken(getToken(req));
  if (!claims) {
    return NextResponse.json(
      { error: 'Unauthorized — missing or invalid session token. Start a session at /api/sessions/start.' },
      { status: 401 }
    );
  }
  return claims;
}

// ── Admin gate (cookie-based; password from ADMIN_PASSWORD env) ─────────────────
// OPERATOR: set ADMIN_PASSWORD before deploying anywhere reachable. Until it is set,
// the gate is inactive so first-run local dev isn't locked out; a warning logs on each
// admin request while that is true.

const ADMIN_COOKIE = 'ouija_admin';

export function adminConfigured(): boolean { return ADMIN_PASSWORD.length > 0; }

export function makeAdminCookieValue(): string {
  return hmac('admin:' + ADMIN_PASSWORD);
}

export function checkAdminPassword(pw: string): boolean {
  return adminConfigured() && safeEq(pw, ADMIN_PASSWORD);
}

export function adminCookieName(): string { return ADMIN_COOKIE; }

/** Returns true only when ADMIN_PASSWORD is set and the request carries a valid admin cookie. */
export function isAdmin(req: NextRequest): boolean {
  if (!adminConfigured()) {
    console.warn('[auth] ADMIN_PASSWORD not set — /admin and /api/admin are UNPROTECTED. Set ADMIN_PASSWORD.');
    return false;
  }
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  return !!cookie && safeEq(cookie, makeAdminCookieValue());
}

/** Returns null-equivalent (the claims of being admin) or a 401 NextResponse. */
export function requireAdmin(req: NextRequest): true | NextResponse {
  if (isAdmin(req)) return true;
  return NextResponse.json({ error: 'Unauthorized — admin login required.' }, { status: 401 });
}
