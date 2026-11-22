// Admin login — exchanges the admin password for an httpOnly session cookie.
// POST { password } → sets the admin cookie + { ok: true }, or 401.
// DELETE clears the cookie (logout).
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminPassword, makeAdminCookieValue, adminCookieName } from '@/lib/auth';
import { parseBody, isResponse } from '@/lib/validate';
import { rateLimit, tooMany } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const maxDuration = 20;

const LoginBody = z.object({ password: z.string().min(1).max(200) });

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`admin-login:${clientIp(req)}`, 10)) return tooMany();

  const body = await parseBody(req, LoginBody);
  if (isResponse(body)) return body;
  const { password } = body;

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), makeAdminCookieValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

export async function DELETE(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
