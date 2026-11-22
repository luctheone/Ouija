import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { requireAdmin, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';

export const runtime = 'nodejs';
export const maxDuration = 20;

const UpdateDoc = z
  .object({
    graph_template: z.record(z.string(), z.unknown()),
    content: z.string().max(50000),
  })
  .partial()
  .refine((o) => o.graph_template !== undefined || o.content !== undefined, {
    message: 'No fields to update',
  });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const a = requireAdmin(req); if (isResponse(a)) return a;
  const body = await parseBody(req, UpdateDoc);
  if (isResponse(body)) return body;
  try {
    const { docId } = await params;

    const updateFields: Record<string, unknown> = {};
    if (body.graph_template !== undefined) updateFields.graph_template = body.graph_template;
    if (body.content !== undefined) updateFields.content = body.content;

    const { data, error } = await supabase()
      .from('docs')
      .update(updateFields)
      .eq('id', docId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/admin/companies/[id]/docs/[docId] PATCH]', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}
