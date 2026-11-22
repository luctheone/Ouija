// Rate limit — best-effort in-memory fixed-window limiter, per warm lambda instance.
//
// This is a BACKSTOP, not a guarantee: serverless spreads requests across instances,
// so a distributed flood isn't fully bounded here. The real protections are (1) the
// required session token (auth.ts) and (2) a hard spend cap on the Anthropic key.
// Upgrade path: move to a Postgres/Upstash sliding window keyed by session token.
//
//   if (!rateLimit(`next-step:${session.sid}`, 120)) return tooMany();

import { NextResponse } from 'next/server';

const buckets = new Map<string, { count: number; window: number }>();

export function rateLimit(key: string, limit: number, windowSec = 60): boolean {
  const window = Math.floor(Date.now() / (windowSec * 1000));
  const b = buckets.get(key);
  if (!b || b.window !== window) {
    buckets.set(key, { count: 1, window });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.window !== window) buckets.delete(k);
    }
    return true;
  }
  b.count++;
  return b.count <= limit;
}

export function tooMany(): NextResponse {
  return NextResponse.json({ error: 'Rate limit exceeded — slow down.' }, { status: 429 });
}
