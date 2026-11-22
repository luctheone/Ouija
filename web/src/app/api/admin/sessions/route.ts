import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin, isResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 20;

export async function GET(req: NextRequest) {
  const a = requireAdmin(req); if (isResponse(a)) return a;
  try {
    const flow = req.nextUrl.searchParams.get('flow') || undefined;

    let query = supabase()
      .from('sessions')
      .select(`
        *,
        journey_graphs (graph, position, forks),
        events (step, action, timestamp)
      `)
      .order('started_at', { ascending: false })
      .limit(20);

    if (flow) {
      query = query.eq('flow', flow);
    }

    const { data, error } = await query;
    if (error) throw error;

    const sessions = (data || []).map((s: any) => ({
      id: s.id,
      device_id: s.device_id,
      company: s.company,
      flow: s.flow,
      demo_key_type: s.demo_key_type,
      started_at: s.started_at,
      completed_at: s.completed_at,
      status: s.status,
      graph: s.journey_graphs?.[0]?.graph || null,
      position: s.journey_graphs?.[0]?.position || null,
      forks: s.journey_graphs?.[0]?.forks || [],
      events: s.events || [],
    }));

    // Compute stats
    const total = sessions.length;
    const completed = sessions.filter((s: any) => s.status === 'completed').length;
    const abandoned = sessions.filter((s: any) => s.status === 'abandoned').length;
    const active = sessions.filter((s: any) => s.status === 'active').length;

    return NextResponse.json({
      sessions,
      stats: { total, completed, abandoned, active },
    });
  } catch (error) {
    console.error('[/api/admin/sessions]', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
