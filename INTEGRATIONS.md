# Ouija — Integration Patterns

> Technical reference for each external integration. Read before implementing. Verify against current docs if >30 days old.

## Engine — Anthropic SDK (`lib/engine.ts`)

> **The engine is the Anthropic Messages API via `@anthropic-ai/sdk`, in `web/src/lib/engine.ts`.** We migrated off AWS Bedrock during the hackathon. `web/src/lib/bedrock.ts` is now a **deprecated one-line re-export shim** (`export * from './engine'`) kept only so existing `@/lib/bedrock` imports keep compiling — do not add to it; import from `@/lib/engine` in new code. Anything below or elsewhere that still says "Bedrock", "Converse API", or "Opus 4.x model ID" is stale Bedrock-era phrasing; the runtime is the plain Anthropic SDK.

### Package & Client Setup

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY from the environment.
export const anthropic = new Anthropic();
```

### Models (cost split)

```typescript
export const MODEL_SONNET = "claude-sonnet-4-6"; // reasoning: chat, verify, diagnose, plan
export const MODEL_HAIKU  = "claude-haiku-4-5";  // cheap, high-frequency per-step perception
```

Cheap per-step calls pass `MODEL_HAIKU` explicitly; everything defaults to `MODEL_SONNET`. This split is the unit-economics lever — keep perception on Haiku and reasoning rare.

### Structured Output (JSON Schema) — forced tool call

The engine enforces structured output by *forcing a tool call*: the model is required to call a `structured_output` tool whose `input_schema` is the JSON schema, and we return the validated tool input. This is `invokeStructured<T>(messages, schema, maxTokens?, model?)` in `engine.ts`.

```typescript
import { invokeStructured } from "@/lib/engine";

const nextStepSchema = {
  type: "object",
  properties: {
    elementIndex: { type: "integer" },
    tooltip: { type: "string" },
    pointDirection: { enum: ["above", "below", "left", "right"] },
    done: { type: "boolean" },
    confidence: { type: "number" }
  },
  required: ["elementIndex", "tooltip", "pointDirection", "done", "confidence"]
};

const nextStep = await invokeStructured<NextStep>(
  [
    {
      role: "user",
      content: `You are guiding a user through Shopify onboarding.

Current step: Connect Meta pixel
Journey position: node 3 of 7
User's page: Meta Events Manager

Serialized interactive elements:
${JSON.stringify(domSnapshot, null, 2)}

Pick the element index the user should click next.`
    }
  ],
  nextStepSchema
);
// nextStep is the tool input, shaped by the schema. (The engine checks the schema's required
// keys at runtime; pair with zod at the route boundary where the shape matters.)
```

### Streaming (Sidebar Guidance Text)

For human-readable guidance, stream tokens with the standard SDK streaming API:

```typescript
import { anthropic, MODEL_SONNET } from "@/lib/engine";

async function* streamGuidance(prompt: string) {
  const stream = await anthropic.messages.stream({
    model: MODEL_SONNET,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }]
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}
```

### Tool Use (multi-turn) — Escalation Paths Only

The cold planning and error diagnosis paths use Anthropic tool-use with tool definitions. The model reasons iteratively — calling tools, receiving results, and continuing until it reaches a conclusion. This is wrapped by `converseWithTools` (exported from `engine.ts`; still importable via the `bedrock` shim).

```typescript
import { converseWithTools, type ToolDefinition } from "@/lib/engine";

// converseWithTools(systemPrompt, messages, tools, toolHandlers, maxTurns)
// Loops: messages.create → tool_use → execute handler → feed result → repeat
// Terminates on: end_turn OR terminal tool call OR maxTurns exceeded
//                (also breaks out on non-tool_use/end_turn stop reasons, e.g. max_tokens)
```

**Planner tools (cold /api/plan):**
| Tool | Purpose | Terminal? |
|------|---------|-----------|
| `retrieve_docs` | Exa search for setup documentation | No |
| `validate_step` | Self-check: is this step logical given prior steps? | No |
| `submit_graph` | Submit final {nodes, edges} — ends loop | Yes |

**Failure squad (3 agents, sequential on complex breakpoints):**

| Agent | Source | Purpose |
|-------|--------|---------|
| Research Agent | Exa (web) | Search open web for failure context: updated docs, known issues, UI changes |
| Docs Agent | Supabase (client metadata) | Search client's ingested documentation for step-specific guidance |
| Diagnosis Agent | Anthropic tool_use (`converseWithTools`) | Investigate DOM, form hypothesis, propose recovery fork |

**Diagnosis tools (/api/diagnose):**
| Tool | Purpose | Terminal? |
|------|---------|-----------|
| `inspect_elements` | Filter page elements by keyword focus area | No |
| `check_url_state` | Verify user is on expected URL | No |
| `submit_diagnosis` | Submit {hypothesis, fork, recovery_instruction} — ends loop | Yes |

**Docs Agent retrieval pattern (bespoke mode):**
```typescript
// Metadata key lookup — NOT vector search
const { data: docs } = await supabase()
  .from('docs')
  .select('content, graph_template')
  .eq('site', site)
  .eq('task', task);

// Node-specific docs (future: per-node breakpoint guidance)
const { data: nodeDoc } = await supabase()
  .from('docs')
  .select('content')
  .eq('site', site)
  .eq('task', `${task}:${nodeId}`);
```

In plug-and-play mode, the Docs Agent returns empty and the Diagnosis Agent relies on Research Agent (Exa) context only.

This demonstrates genuine agentic tool use — the model investigates, reasons, and acts iteratively rather than just receiving a prompt and returning a response.

### JSON Schema Notes (Anthropic tool input_schema)

Structured output is a forced tool call, so the schema is the tool's `input_schema` (standard JSON Schema). Keep schemas simple and explicit; list `required` fields. The SDK does not re-validate the returned input against the schema at runtime, so validate at the route boundary with zod (`lib/validate.ts`) where the shape matters.

---

## Exa (Cold Retrieval)

### When Invoked

Only on the **cold/unknown-SaaS path** — when no pre-built journey graph exists for the (site, task) pair. The Planner agent uses Exa to retrieve docs, then builds the graph. The demo flows (Shopify, Stripe) are warm (pre-cached graphs), so Exa is used for:
- The recorded video showing plug-and-play cold flow
- Future vendor onboarding (post-hackathon)

### Package & Auth

```bash
npm install exa-js
```

```typescript
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);
```

API key from [dashboard.exa.ai](https://dashboard.exa.ai). Header: `x-api-key`.

### Search + Content Retrieval

```typescript
const results = await exa.searchAndContents(
  "Shopify Meta pixel setup guide site:help.shopify.com",
  {
    type: "auto",           // Let Exa pick search strategy
    numResults: 5,
    text: {
      maxCharacters: 10000,
      includeHtmlTags: false
    },
    // OR for token efficiency:
    // highlights: { query: "pixel installation steps", numSentences: 5 }
  }
);

// Response shape:
// {
//   results: [
//     {
//       title: "Add the Meta pixel to your online store",
//       url: "https://help.shopify.com/...",
//       text: "To add the Meta pixel to your Shopify store...",
//       score: 0.92
//     }
//   ]
// }
```

### Feeding to the Planner

```typescript
const docContext = results.results
  .map(r => `### ${r.title}\nSource: ${r.url}\n\n${r.text}`)
  .join("\n\n---\n\n");

const plannerPrompt = `Build a step-by-step journey graph for connecting a Meta pixel to a Shopify store.

Documentation context:
${docContext}

Return a JSON journey graph with nodes and edges.`;
```

### Bounty Note

Exa has a "best use" bounty. The integration is load-bearing (not decorative) — it's the retrieval layer for unknown SaaS flows. Show it in the recorded video with a cold flow demo.

### Pricing (Hackathon Context)

- Free tier: 1,000 requests/month
- Search: $7/1k requests
- Contents: $1/1k pages
- Startup grants available ($1,000 credits)

---

## Stripe (Test Mode)

### Test vs Live

All demo work uses **test mode** — test API keys (`sk_test_...`, `pk_test_...`), test card numbers, test business data. Judges never enter real credentials.

### Test Cards

| Brand | Number | Use |
|-------|--------|-----|
| Visa | `4242424242424242` | Success |
| Mastercard | `5555555555554444` | Success |
| Declined | `4000000000000002` | Decline scenario |

Any future expiry, any 3-digit CVC.

### KYB/Connect Onboarding Demo

The demo walks judges through Stripe's hosted onboarding UI for a test connected account.

**Setup (backend):**
```typescript
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST);

// 1. Create test connected account
const account = await stripe.accounts.create({
  type: "standard",
  country: "US",
  email: "judge@demo.ouija.ai"
});

// 2. Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: "https://ouija.ai/demo/stripe/refresh",
  return_url: "https://ouija.ai/demo/stripe/complete",
  type: "account_onboarding"
});

// 3. Redirect judge to accountLink.url
```

**Test business data (for the onboarding form):**

| Field | Test Value | Effect |
|-------|------------|--------|
| `company.tax_id` | `000000000` | Successful verification |
| `company.name` | `Demo Business Inc` | Standard pass |
| `business_profile.url` | `https://accessible.stripe.com` | URL validation passes |

### Usage-Based Billing (Pitch Concept)

Per-onboarding billing via Stripe Meters:

```typescript
// Report a completed onboarding
await stripe.billing.meterEvents.create({
  event_name: "onboarding_completed",
  payload: {
    value: "1",
    stripe_customer_id: customerId
  }
});
```

This is the monetization pitch (verifiable via the journey-graph ledger). May not be fully built in 36h — document for judges, implement if time permits.

---

## Supabase (Store)

### Tables

#### sessions
```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  company text not null,
  flow text not null,
  demo_key_type text,  -- 'shopify' | 'stripe' | null (real user)
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  status text not null default 'active'
    check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz default now()
);

create index idx_sessions_device_id on sessions(device_id);
create index idx_sessions_company_flow on sessions(company, flow);
create index idx_sessions_status on sessions(status);
```

#### journey_graphs
```sql
create table journey_graphs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  graph jsonb not null,      -- { nodes: [...], edges: [...] }
  position text not null,    -- current node ID
  forks jsonb default '[]',  -- [{ at: nodeId, branch: [...], deadEnd: bool }]
  updated_at timestamptz default now()
);

create index idx_journey_graphs_session on journey_graphs(session_id);
create index idx_journey_graphs_graph_gin on journey_graphs using gin(graph);
```

#### docs
```sql
create table docs (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  task text not null,
  content text not null,
  graph_template jsonb,  -- pre-built journey graph for warm flows
  created_at timestamptz default now(),
  unique(site, task)
);

create index idx_docs_site_task on docs(site, task);
```

#### events
```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  step text not null,
  action text not null
    check (action in ('enter', 'complete', 'error', 'skip', 'fork')),
  timestamp timestamptz default now() not null,
  payload jsonb default '{}'
);

create index idx_events_session_ts on events(session_id, timestamp);
```

### TypeScript Types

```typescript
interface Session {
  id: string;
  device_id: string;
  company: string;
  flow: string;
  demo_key_type: 'shopify' | 'stripe' | null;
  started_at: string;
  completed_at: string | null;
  status: 'active' | 'completed' | 'abandoned';
}

interface JourneyGraph {
  id: string;
  session_id: string;
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  position: string;
  forks: Fork[];
}

interface GraphNode {
  id: string;
  site: string;
  selector_hint: string;
  instruction: string;
  verify_condition: string;
}

interface GraphEdge {
  from: string;
  to: string;
  condition?: string;
}

interface Fork {
  at: string;
  branch: GraphNode[];
  deadEnd: boolean;
}

interface Doc {
  id: string;
  site: string;
  task: string;
  content: string;
  graph_template: JourneyGraph['graph'] | null;
}

interface Event {
  id: string;
  session_id: string;
  step: string;
  action: 'enter' | 'complete' | 'error' | 'skip' | 'fork';
  timestamp: string;
  payload: Record<string, unknown>;
}
```

### Warm Lookup Pattern

```typescript
// Fast path: load pre-built graph by (site, task)
const { data: doc } = await supabase
  .from('docs')
  .select('graph_template')
  .eq('site', 'shopify')
  .eq('task', 'meta-pixel-connect')
  .single();

if (doc?.graph_template) {
  // Warm: use cached graph
  return doc.graph_template;
} else {
  // Cold: call Exa + Planner to build graph
  return await buildGraphFromExa(site, task);
}
```

---

## Integration Checklist (Pre-Build)

- [ ] Anthropic API key in env (`ANTHROPIC_API_KEY`) — the engine (`lib/engine.ts`)
- [ ] Auth secrets in env (`SESSION_SECRET`, `ADMIN_PASSWORD`) — unset = insecure-but-functional
- [ ] Exa API key in env (`EXA_API_KEY`) — optional, cold-start only
- [ ] Stripe test keys in env (`STRIPE_SECRET_KEY_TEST`, `STRIPE_PUBLISHABLE_KEY_TEST`)
- [ ] Supabase project created, connection string in env (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
- [ ] Tables created via Supabase SQL editor
- [ ] Shopify Partners account + dev store created
- [ ] Stripe test connected account created for demo
