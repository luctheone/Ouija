import { createClient, SupabaseClient } from '@supabase/supabase-js';

// SERVER-ONLY. This module is imported only by API routes (Node runtime). It prefers the
// SERVICE-ROLE key when present so that:
//   1. Server writes/reads always work even after RLS is enabled (service-role bypasses RLS).
//   2. Enabling RLS makes the PUBLIC anon key powerless against the database directly — anyone
//      who lifts the anon key from the client can no longer read tenant data, because the
//      org-scoped policies in 003/004 deny it. That is the whole point of turning RLS on.
// Falls back to the anon key (e.g. local dev without the service-role key set), where RLS is
// still allow-all today, so nothing breaks before the key is configured.
//
// ⚠️ NEVER import this from a Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!_client) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY not set — using the anon key. Set the service-role key before enabling RLS, or RLS will deny the app.');
    }
    _client = createClient(process.env.SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
