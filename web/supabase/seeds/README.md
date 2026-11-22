# Journey-graph seeds

Version-controlled snapshots of the **production journey graphs** — the pre-built
bespoke flows Ouija guides users through. These are the authored intelligence
(see `ARCHITECTURE.md` → "Agent orchestration"): the graph IS the product, so it lives in
git, reviewable and restorable, not only in the database.

## Files

Each `<site>__<task>.json` is one doc's graph, shaped exactly like a `docs` row's
`graph_template` column:

```jsonc
{
  "site": "shopify",                 // docs.site
  "task": "meta-pixel-connect",      // docs.task
  "graph_template": {                // docs.graph_template (the JourneyGraph)
    "nodes": [ { "id", "site", "instruction", "selector_hint", "verify_condition" }, ... ],
    "edges": [ { "from", "to" }, ... ]
  }
}
```

Current snapshots:

| File | site / task | Flow |
|------|-------------|------|
| `shopify__meta-pixel-connect.json` | `shopify` / `meta-pixel-connect` | Shopify → Meta Events Manager pixel + CAPI |
| `stripe__payment-link-webhook.json` | `stripe` / `payment-link-webhook` | Stripe payment link + webhook wiring |
| `aws__iam-cross-account-role.json` | `aws` / `iam-cross-account-role` | AWS IAM cross-account role for monitoring |
| `_all_graphs.json` | — | Convenience bundle: array of all of the above, for bulk restore |

The terminal node of each graph (the one with **no outgoing edge** in `edges`) is the
**billable completion** step. `/api/sessions/advance` derives terminality from these
edges server-side, so the graph shape here is what decides when a session is billed.
Keep edges accurate.

## Restoring a snapshot into `docs.graph_template`

A `docs` row must already exist for the `(site, task)` pair (the admin panel creates
companies + docs). Restore replaces only the `graph_template`.

### Option A — admin PATCH endpoint (preferred)

`PATCH /api/admin/companies/[id]/docs/[docId]` accepts `{ graph_template }` and updates
that doc. Requires the admin cookie (log in via `/admin`, or `POST /api/admin/login`).

```bash
# docId is the docs.id for this (site, task); companyId is the owning company.
curl -X PATCH "https://<host>/api/admin/companies/<companyId>/docs/<docId>" \
  -H 'Content-Type: application/json' \
  --cookie "ouija_admin=<cookie-value>" \
  --data @<(jq '{graph_template: .graph_template}' shopify__meta-pixel-connect.json)
```

### Option B — direct SQL (Supabase SQL editor)

Paste the `graph_template` object from the JSON file:

```sql
update docs
set graph_template = '<paste graph_template JSON here>'::jsonb
where site = 'shopify' and task = 'meta-pixel-connect';
```

Or upsert a brand-new doc from a snapshot:

```sql
insert into docs (site, task, content, graph_template)
values ('shopify', 'meta-pixel-connect', '', '<paste graph_template JSON>'::jsonb)
on conflict (site, task) do update set graph_template = excluded.graph_template;
```

## Re-exporting (capturing the live graph back to git)

When a graph is edited in the admin panel and you want to snapshot it back:

```sql
select graph_template from docs where site = 'shopify' and task = 'meta-pixel-connect';
```

Wrap the result as `{ "site", "task", "graph_template": <result> }` and overwrite the
matching `<site>__<task>.json` (and refresh `_all_graphs.json`) so git stays the source
of truth.
