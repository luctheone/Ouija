import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { requireAdmin, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 20;

// Whitelist the columns an admin may PATCH — never trust a blind body into .update().
const UpdateCompany = z
  .object({
    name: z.string().min(1).max(120),
    site: z.string().min(1).max(200),
    status: z.enum(['configured', 'discovered']),
    welcome_message: z.string().max(2000),
  })
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: 'No fields to update' });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = requireAdmin(req); if (isResponse(a)) return a;
  const body = await parseBody(req, UpdateCompany);
  if (isResponse(body)) return body;
  try {
    const { id } = await params;
    const { data, error } = await supabase()
      .from('companies')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/admin/companies/[id] PATCH]', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = requireAdmin(req); if (isResponse(a)) return a;
  try {
    const { id } = await params;
    const { error } = await supabase()
      .from('companies')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[/api/admin/companies/[id] DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = requireAdmin(req); if (isResponse(a)) return a;
  try {
    const { id } = await params;

    const { data: company, error: companyErr } = await supabase()
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (companyErr || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get docs for this company
    const { data: docs } = await supabase()
      .from('docs')
      .select('*')
      .eq('site', company.site)
      .order('created_at', { ascending: false });

    // Get sessions for this company
    const { data: sessions } = await supabase()
      .from('sessions')
      .select('*, journey_graphs(graph, position, forks), events(step, action, timestamp)')
      .eq('company', company.site)
      .order('started_at', { ascending: false })
      .limit(20);

    // Compute stats
    const total = sessions?.length || 0;
    const completed = sessions?.filter((s: any) => s.status === 'completed').length || 0;
    const abandoned = sessions?.filter((s: any) => s.status === 'abandoned').length || 0;
    const active = sessions?.filter((s: any) => s.status === 'active').length || 0;

    return NextResponse.json({
      company,
      docs: docs || [],
      sessions: sessions || [],
      stats: { total, completed, abandoned, active },
    });
  } catch (error) {
    console.error('[/api/admin/companies/[id] GET]', error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}
