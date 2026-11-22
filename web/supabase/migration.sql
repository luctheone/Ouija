-- Ouija — Supabase schema
-- Run in Supabase SQL editor to create all tables.

-- ── Sessions ──────────────────────────────────────────────────────────────────

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  company text not null,
  flow text not null,
  demo_key_type text,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  status text not null default 'active'
    check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz default now()
);

create index if not exists idx_sessions_device_id on sessions(device_id);
create index if not exists idx_sessions_company_flow on sessions(company, flow);
create index if not exists idx_sessions_status on sessions(status);

-- ── Journey Graphs ────────────────────────────────────────────────────────────

create table if not exists journey_graphs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  graph jsonb not null,
  position text not null,
  forks jsonb default '[]',
  updated_at timestamptz default now()
);

create index if not exists idx_journey_graphs_session on journey_graphs(session_id);

-- ── Docs (metadata-tagged, NOT vector) ────────────────────────────────────────
-- site + task is the key lookup. For bespoke mode, clients populate this.
-- Node-specific docs use task format: "meta-pixel-connect:shopify_3"

create table if not exists docs (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  task text not null,
  content text not null,
  graph_template jsonb,
  created_at timestamptz default now(),
  unique(site, task)
);

create index if not exists idx_docs_site_task on docs(site, task);

-- ── Companies (groups sessions by software — configured vs discovered) ────────
-- Configured = bespoke client with ingested docs + pre-built graph.
-- Discovered = auto-created when a cold flow is generated for a new site.

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  site text not null unique,
  status text not null default 'discovered'
    check (status in ('configured', 'discovered')),
  session_count integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_companies_site on companies(site);
create index if not exists idx_companies_status on companies(status);

-- ── Events ────────────────────────────────────────────────────────────────────

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  step text not null,
  action text not null
    check (action in ('enter', 'complete', 'error', 'skip', 'fork')),
  timestamp timestamptz default now() not null,
  payload jsonb default '{}'
);

create index if not exists idx_events_session_ts on events(session_id, timestamp);

-- ── RLS Policies (open for hackathon — no auth gating) ────────────────────────

alter table sessions enable row level security;
alter table journey_graphs enable row level security;
alter table docs enable row level security;
alter table events enable row level security;
alter table companies enable row level security;

create policy "Allow all" on sessions for all using (true) with check (true);
create policy "Allow all" on journey_graphs for all using (true) with check (true);
create policy "Allow all" on docs for all using (true) with check (true);
create policy "Allow all" on events for all using (true) with check (true);
create policy "Allow all" on companies for all using (true) with check (true);
