import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { parseBody } from '@/lib/validate';

const Body = z.object({ device_id: z.string().min(1) });

function jsonRequest(payload: string): Request {
  return new Request('http://x', {
    method: 'POST',
    body: payload,
    headers: { 'content-type': 'application/json' },
  });
}

describe('parseBody', () => {
  it('returns the parsed, typed data for a valid body', async () => {
    const req = jsonRequest(JSON.stringify({ device_id: 'dev_123' }));
    const out = await parseBody(req, Body);
    expect(out).toEqual({ device_id: 'dev_123' });
    expect(out instanceof NextResponse).toBe(false);
  });

  it('returns a 400 NextResponse for invalid JSON', async () => {
    const req = jsonRequest('{ this is not json');
    const out = await parseBody(req, Body);
    expect(out instanceof NextResponse).toBe(true);
    expect((out as NextResponse).status).toBe(400);
  });

  it('returns a 422 NextResponse for a schema mismatch', async () => {
    // Valid JSON, but device_id is missing → fails the schema.
    const req = jsonRequest(JSON.stringify({ wrong_field: true }));
    const out = await parseBody(req, Body);
    expect(out instanceof NextResponse).toBe(true);
    expect((out as NextResponse).status).toBe(422);
  });

  it('returns 422 when a field is the wrong type', async () => {
    const req = jsonRequest(JSON.stringify({ device_id: '' }));
    const out = await parseBody(req, Body);
    expect(out instanceof NextResponse).toBe(true);
    expect((out as NextResponse).status).toBe(422);
  });
});
