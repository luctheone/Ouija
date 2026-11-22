import { supabase } from '@/lib/supabase';

export interface DocsResult {
  content: string;
  hasClientDocs: boolean;
}

export async function searchClientDocs(
  site: string,
  task: string,
  nodeId?: string
): Promise<DocsResult> {
  try {
    // Node-specific docs first (bespoke: per-node breakpoint guidance)
    if (nodeId) {
      const { data: nodeDoc } = await supabase()
        .from('docs')
        .select('content')
        .eq('site', site)
        .eq('task', `${task}:${nodeId}`)
        .single();

      if (nodeDoc?.content) {
        return { content: nodeDoc.content, hasClientDocs: true };
      }
    }

    // General task docs (bespoke: client's onboarding documentation)
    const { data: taskDoc } = await supabase()
      .from('docs')
      .select('content')
      .eq('site', site)
      .eq('task', task)
      .single();

    if (taskDoc?.content) {
      return { content: taskDoc.content, hasClientDocs: true };
    }

    // Plug-and-play mode: no client docs available
    return { content: '', hasClientDocs: false };
  } catch {
    return { content: '', hasClientDocs: false };
  }
}
