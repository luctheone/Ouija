import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { requireAdmin, isResponse } from '@/lib/auth';
import { parseBody } from '@/lib/validate';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 20;

const CreateCompany = z.object({
  name: z.string().min(1).max(120),
  site: z.string().min(1).max(200),
});

export async function GET(req: NextRequest) {
  const a = requireAdmin(req); if (isResponse(a)) return a;
  try {
    const { data, error } = await supabase()
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ companies: data || [] });
  } catch (error) {
    console.error('[/api/admin/companies GET]', error);
    return NextResponse.json({ companies: [] });
  }
}

export async function POST(req: NextRequest) {
  const a = requireAdmin(req); if (isResponse(a)) return a;
  const body = await parseBody(req, CreateCompany);
  if (isResponse(body)) return body;
  try {
    const { name, site } = body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const api_key = `ouija_${slug}_${crypto.randomUUID().slice(0, 8)}`;

    const { data, error } = await supabase()
      .from('companies')
      .insert({ name, site, status: 'configured', session_count: 0, api_key })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[/api/admin/companies POST]', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
