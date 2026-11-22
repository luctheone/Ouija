import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { requireAdmin, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';

export const runtime = 'nodejs';
export const maxDuration = 20;

const AddDoc = z.object({
  site: z.string().min(1).max(200),
  task: z.string().min(1).max(120),
  content: z.string().max(50000).optional(),
  // graph_template is a journey graph (validated structurally where it's consumed).
  graph_template: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = requireAdmin(req); if (isResponse(a)) return a;
  const body = await parseBody(req, AddDoc);
  if (isResponse(body)) return body;
  try {
    const { id } = await params;
    const { site, task, content, graph_template } = body;

    const insertData: Record<string, unknown> = { site, task, content: content || '' };
    if (graph_template) insertData.graph_template = graph_template;

    const { data, error } = await supabase()
      .from('docs')
      .upsert(insertData, { onConflict: 'site,task' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[/api/admin/companies/[id]/docs POST]', error);
    return NextResponse.json({ error: 'Failed to add documentation' }, { status: 500 });
  }
}
