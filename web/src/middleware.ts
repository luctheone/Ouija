import { NextRequest, NextResponse } from 'next/server';

// CORS policy (Edge runtime — no node:crypto here).
//
// Two classes of API routes need different treatment:
//   • Admin routes (/api/admin/*) are cookie-authenticated and called SAME-ORIGIN from the
//     /admin page. They must NOT be reachable cross-origin, so they get CORS headers ONLY
//     for an allowlisted origin (the app's own deployment). Same-origin requests don't need
//     CORS headers at all, so the default of "no ACAO" is correct and safe for them.
//   • Extension routes (everything else under /api/*) are called from the content script,
//     whose fetch carries the ARBITRARY host page's origin (the user could be on any site).
//     A strict allowlist would break guidance on real third-party sites, so these keep a
//     wildcard origin. That is safe here because auth is a session token in a custom header
//     (X-Ouija-Token), NOT an ambient cookie: a malicious page can't read the token, and an
//     unauthenticated call just 401s. We never pair the wildcard with Allow-Credentials.
//
// The stricter end-state (removing the wildcard on extension routes too) requires relocating
// extension fetches into the background service worker so requests carry the extension origin
// — tracked as a follow-up; the token is the real boundary and is already enforced per-route.

const ALLOW_METHODS = 'GET, POST, PATCH, PUT, DELETE, OPTIONS';
const ALLOW_HEADERS = 'Content-Type, Authorization, X-Ouija-Token';

/** Origins permitted to call the admin API cross-origin (the app's own deployments). */
function adminOriginAllowlist(): string[] {
  const list = new Set<string>();
  const add = (u?: string | null) => {
    if (!u) return;
    const v = u.startsWith('http') ? u : `https://${u}`;
    list.add(v.replace(/\/$/, ''));
  };
  add(process.env.NEXT_PUBLIC_URL);
  add(process.env.VERCEL_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  add('http://localhost:3000');
  add('http://localhost:3001');
  return [...list];
}

function corsHeadersFor(req: NextRequest, pathname: string): Record<string, string> {
  const base: Record<string, string> = {
    'Access-Control-Allow-Methods': ALLOW_METHODS,
    'Access-Control-Allow-Headers': ALLOW_HEADERS,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };

  if (pathname.startsWith('/api/admin/')) {
    // Admin: reflect ONLY an allowlisted origin; otherwise emit no ACAO (same-origin is fine).
    const origin = req.headers.get('origin');
    if (origin && adminOriginAllowlist().includes(origin.replace(/\/$/, ''))) {
      base['Access-Control-Allow-Origin'] = origin;
    }
    return base;
  }

  // Extension/public routes: wildcard origin, no credentials (token lives in a custom header).
  base['Access-Control-Allow-Origin'] = '*';
  return base;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/api/')) return;

  const headers = corsHeadersFor(req, pathname);

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  const res = NextResponse.next();
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
}

export const config = {
  matcher: '/api/:path*',
};
