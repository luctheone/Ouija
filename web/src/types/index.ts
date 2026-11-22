// Ouija — Shared types across web app and extension

// ── Serialized DOM elements (content script → backend) ────────────────────────

export interface SerializedElement {
  index: number;
  type: string;
  text: string;
  id: string;
  ariaLabel: string;
  placeholder: string;
  nearbyLabel: string;
  visibleInViewport: boolean;
}

// ── Journey Graph (the stateful centerpiece) ──────────────────────────────────

export interface GraphNode {
  id: string;
  site: string;
  selector_hint: string;
  instruction: string;
  verify_condition: string;
  confidence?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface Fork {
  at: string;
  branch: GraphNode[];
  deadEnd: boolean;
}

export interface JourneyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  welcome_message?: string;
}

export interface JourneyState {
  id: string;
  session_id: string;
  graph: JourneyGraph;
  position: string;
  forks: Fork[];
}

// ── Backend responses ─────────────────────────────────────────────────────────

export interface NextStepResponse {
  elementIndex: number;
  tooltip: string;
  pointDirection: 'above' | 'below' | 'left' | 'right';
  done: boolean;
  confidence: number;
}

export interface VerifyResponse {
  completed: boolean;
  evidence: string;
  newUrl?: string;
}

export interface DiagnoseResponse {
  hypothesis: string;
  fork: Fork;
  recovery_instruction: string;
}

export interface PlanResponse {
  graph: JourneyGraph;
  source: 'warm' | 'cold';
}

// ── Session & Events ──────────────────────────────────────────────────────────

export interface Session {
  id: string;
  device_id: string;
  company: string;
  flow: string;
  demo_key_type: 'shopify' | 'stripe' | 'aws' | null;
  started_at: string;
  completed_at: string | null;
  status: 'active' | 'completed' | 'abandoned';
}

export interface JourneyEvent {
  id: string;
  session_id: string;
  step: string;
  action: 'enter' | 'complete' | 'error' | 'skip' | 'fork';
  timestamp: string;
  payload: Record<string, unknown>;
}

// ── Extension messaging ───────────────────────────────────────────────────────

export type MessageType =
  | 'AUTH_SUCCESS'
  | 'AUTH_CLEARED'
  | 'TOGGLE_SIDEBAR'
  | 'STEP_UPDATE'
  | 'RESHOW_OVERLAY'
  | 'SHOW_BADGE'
  | 'THEME_OVERRIDE'
  | 'JOURNEY_UPDATE'
  | 'FORK_EVENT'
  | 'VERIFY_REQUEST'
  | 'CLIPBOARD_SAVE'
  | 'CLIPBOARD_RETRIEVE'
  | 'PAGE_CONTEXT'
  | 'ANALYSIS_STATUS'
  | 'CAPTURE_SCREENSHOT'
  | 'SCREENSHOT_RESULT';

export interface ExtensionMessage {
  type: MessageType;
  [key: string]: unknown;
}

// ── Docs (warm retrieval) ─────────────────────────────────────────────────────

export interface Doc {
  id: string;
  site: string;
  task: string;
  content: string;
  graph_template: JourneyGraph | null;
}
