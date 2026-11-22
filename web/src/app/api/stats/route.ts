import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { count, error } = await supabase()
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return NextResponse.json({ sessions_guided: count || 0 });
  } catch {
    return NextResponse.json({ sessions_guided: 0 });
  }
}
