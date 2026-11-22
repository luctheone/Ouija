-- Migration 004: turn RLS ON safely (the one script to paste).
--
-- ⚠️ SEQUENCING — do this in order, or you'll lock the app out of its own data:
--   1. The app must already be deployed with the SERVICE-ROLE Supabase client
--      (web/src/lib/supabase.ts now prefers SUPABASE_SERVICE_ROLE_KEY). Service-role
--      BYPASSES RLS, so the backend keeps working; the public anon key does not.
--   2. SUPABASE_SERVICE_ROLE_KEY must be set in the deployed env (Vercel). ✅ (you did this)
--   3. THEN paste + run this whole script in the Supabase SQL editor.
--
-- Idempotent — safe to re-run. Self-contained: it (re)creates the org_id column, a default
-- org + backfill, the org-isolation policies, and finally enables RLS. You do NOT need to have
-- run 003 first, though running it is harmless.

-- ── 1. Tenancy column + index ─────────────────────────────────────────────────
alter table companies add column if not exists org_id uuid;
create index if not exists idx_companies_org_id on companies(org_id);

-- ── 2. Default org + backfill (so existing rows aren't orphaned) ───────────────
-- Assign every company without an org to ONE default org. (Multi-org split comes later;
-- for one design partner, one org is correct.) The id is deterministic per-run via a CTE.
do $$
declare
  default_org uuid;
begin
  -- Reuse an existing org_id if any company already has one; else mint a fresh one.
  select org_id into default_org from companies where org_id is not null limit 1;
  if default_org is null then
    default_org := gen_random_uuid();
  end if;
  update companies set org_id = default_org where org_id is null;
  raise notice 'Default org_id = %', default_org;
end $$;

-- ── 3. Org-isolation policies (drop-then-create so this is re-runnable) ────────
-- Policies key off a per-request setting `app.current_org`. With all app access going through
-- the service-role key (which bypasses RLS), these only gate DIRECT anon-key access — which is
-- exactly what we want to deny. (When you later route authenticated tenant reads through the
-- anon key, set `app.current_org` per request, or switch these to auth.jwt()->>'org_id'.)

drop policy if exists "org_isolation_companies" on companies;
create policy "org_isolation_companies" on companies
  for all
  using (org_id is not null and org_id::text = current_setting('app.current_org', true))
  with check (org_id is not null and org_id::text = current_setting('app.current_org', true));

drop policy if exists "org_isolation_sessions" on sessions;
create policy "org_isolation_sessions" on sessions
  for all
  using (exists (select 1 from companies c where c.site = sessions.company and c.org_id::text = current_setting('app.current_org', true)))
  with check (exists (select 1 from companies c where c.site = sessions.company and c.org_id::text = current_setting('app.current_org', true)));

drop policy if exists "org_isolation_events" on events;
create policy "org_isolation_events" on events
  for all
  using (exists (select 1 from sessions s join companies c on c.site = s.company where s.id = events.session_id and c.org_id::text = current_setting('app.current_org', true)))
  with check (exists (select 1 from sessions s join companies c on c.site = s.company where s.id = events.session_id and c.org_id::text = current_setting('app.current_org', true)));

drop policy if exists "org_isolation_docs" on docs;
create policy "org_isolation_docs" on docs
  for all
  using (exists (select 1 from companies c where c.site = docs.site and c.org_id::text = current_setting('app.current_org', true)))
  with check (exists (select 1 from companies c where c.site = docs.site and c.org_id::text = current_setting('app.current_org', true)));

-- ── 4. Enable RLS (the actual switch) ─────────────────────────────────────────
-- After this, the public anon key can read NOTHING directly; the service-role app keeps working.
alter table companies enable row level security;
alter table sessions  enable row level security;
alter table events    enable row level security;
alter table docs      enable row level security;

-- ── Rollback (if anything looks wrong) ────────────────────────────────────────
-- alter table companies disable row level security;
-- alter table sessions  disable row level security;
-- alter table events    disable row level security;
-- alter table docs      disable row level security;
