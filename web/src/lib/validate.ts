// Validate — zod-backed request-body parsing for API routes.
//
//   import { z } from 'zod';
//   const Body = z.object({ device_id: z.string().min(1) });
//   const body = await parseBody(req, Body);
//   if (isResponse(body)) return body;   // 400/422 already formed
//   // body is typed + validated here
import { z } from 'zod';
import { NextResponse } from 'next/server';

export { isResponse } from './auth';

export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: result.error.flatten() },
      { status: 422 }
    );
  }
  return result.data;
}
