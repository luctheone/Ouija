import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { requireAdmin, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';

export const runtime = 'nodejs';
export const maxDuration = 20;

const AddBreakpoint = z.object({
  site: z.string().min(1).max(200),
  flow: z.string().min(1).max(120),
  node_id: z.string().min(1).max(120),
  content: z.string().max(10000),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = requireAdmin(req); if (isResponse(a)) return a;
  const body = await parseBody(req, AddBreakpoint);
  if (isResponse(body)) return body;
  try {
    const { id } = await params;
    const { site, flow, node_id, content } = body;

    // Breakpoints stored as node-specific docs: task = "flow:nodeId"
    const task = `${flow}:${node_id}`;

    const { data, error } = await supabase()
      .from('docs')
      .upsert({ site, task, content }, { onConflict: 'site,task' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[/api/admin/companies/[id]/breakpoints POST]', error);
    return NextResponse.json({ error: 'Failed to add breakpoint' }, { status: 500 });
  }
}
