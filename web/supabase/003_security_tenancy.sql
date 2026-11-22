-- Migration 003: Security, tenancy, and a billable/auditable ledger.
--
-- Run manually in the Supabase SQL editor. REVIEW the RLS section before enabling —
-- enabling RLS while the app still uses the anon key will break reads; enable only
-- after moving server writes to the service-role key.
--
-- Run after migration.sql (001) and 002_add_api_key.sql.
-- Everything here is idempotent (IF NOT EXISTS / OR REPLACE) so it is safe to re-run.

-- ── Tenancy: org_id on companies ──────────────────────────────────────────────
-- The tenancy anchor. Sessions/events/docs are scoped to a company; a company
-- belongs to an org. RLS policies below key off this column. Nullable for now so
-- existing rows keep working until backfilled.

alter table companies add column if not exists org_id uuid;

create index if not exists idx_companies_org_id on companies(org_id);

-- ── Sessions: lifecycle columns for billing ───────────────────────────────────
-- These already exist in migration.sql (status default 'active', completed_at).
-- Re-asserted here defensively in case 003 is run against an older schema where
-- the columns were missing. The CHECK constraint is added separately and guarded
-- so a re-run does not error on an already-present constraint.

alter table sessions add column if not exists status text not null default 'active';
alter table sessions add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_status_check'
  ) then
    alter table sessions
      add constraint sessions_status_check
      check (status in ('active', 'completed', 'abandoned'));
  end if;
end $$;

create index if not exists idx_sessions_status on sessions(status);
create index if not exists idx_sessions_completed_at on sessions(completed_at);

-- ── Events: real payloads + the ledger index ──────────────────────────────────
-- The billing/audit ledger lives here. Every meaningful state change writes a row
-- with a non-empty payload (see /api/sessions/advance). payload default ensures a
-- row is never NULL-keyed; created_at gives a stable, indexable ingest timestamp.
-- (migration.sql named the timestamp column `timestamp`; we add `created_at` so the
-- ledger index and any service-role tooling have a consistent name across versions.)

alter table events add column if not exists payload jsonb default '{}'::jsonb;
alter table events add column if not exists created_at timestamptz default now();

create index if not exists idx_events_session_created on events(session_id, created_at);

-- ── RLS POLICY SCAFFOLDING (org_id tenancy) ───────────────────────────────────
--
-- ⚠️  REVIEW BEFORE ENABLING. The `enable row level security` lines are COMMENTED
--     OUT on purpose. The app currently talks to Supabase with the ANON key. Turning
--     RLS on now would make these org-scoped policies deny every anon read/write and
--     BREAK the live demo. Enable ONLY after server writes move to the service-role
--     key (which bypasses RLS) and the extension/admin reads are routed through
--     authenticated requests that carry the tenant's org_id claim.
--
-- The policies assume the caller's org is exposed as a request setting
-- `app.current_org` (set per request via `set_config('app.current_org', <org_id>, true)`
-- in a server-side transaction). Adjust to your auth model (e.g. auth.jwt()->>'org_id')
-- before going live.

-- Companies: a tenant sees only its own org's companies.
create policy "org_isolation_companies" on companies
  for all
  using (org_id is not null and org_id::text = current_setting('app.current_org', true))
  with check (org_id is not null and org_id::text = current_setting('app.current_org', true));

-- Sessions: scoped by the owning company's org_id (sessions.company -> companies.site).
create policy "org_isolation_sessions" on sessions
  for all
  using (
    exists (
      select 1 from companies c
      where c.site = sessions.company
        and c.org_id::text = current_setting('app.current_org', true)
    )
  )
  with check (
    exists (
      select 1 from companies c
      where c.site = sessions.company
        and c.org_id::text = current_setting('app.current_org', true)
    )
  );

-- Events: scoped through their session -> company -> org.
create policy "org_isolation_events" on events
  for all
  using (
    exists (
      select 1 from sessions s
      join companies c on c.site = s.company
      where s.id = events.session_id
        and c.org_id::text = current_setting('app.current_org', true)
    )
  )
  with check (
    exists (
      select 1 from sessions s
      join companies c on c.site = s.company
      where s.id = events.session_id
        and c.org_id::text = current_setting('app.current_org', true)
    )
  );

-- Docs: scoped by the company that owns the site.
create policy "org_isolation_docs" on docs
  for all
  using (
    exists (
      select 1 from companies c
      where c.site = docs.site
        and c.org_id::text = current_setting('app.current_org', true)
    )
  )
  with check (
    exists (
      select 1 from companies c
      where c.site = docs.site
        and c.org_id::text = current_setting('app.current_org', true)
    )
  );

-- ⚠️  DO NOT UNCOMMENT until server writes use the service-role key (see warning above).
-- alter table companies enable row level security;
-- alter table sessions  enable row level security;
-- alter table events    enable row level security;
-- alter table docs      enable row level security;

-- ── (Optional) Distributed rate limiting table ────────────────────────────────
-- The runtime limiter (lib/ratelimit.ts) is per-warm-instance and does not bound a
-- distributed flood. When ready to upgrade to a sliding window shared across all
-- serverless instances, uncomment this table and key it by the session token / sid.
-- Left commented because nothing reads it yet; it is a forward-looking artifact only.
--
-- create table if not exists rate_limits (
--   key         text not null,
--   window_start timestamptz not null,
--   count       integer not null default 0,
--   primary key (key, window_start)
-- );
-- create index if not exists idx_rate_limits_window on rate_limits(window_start);
