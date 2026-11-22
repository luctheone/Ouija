import { createRoot } from 'react-dom/client';
import { useState, useEffect, useMemo } from 'react';
import './styles.css';

interface GraphNode {
  id: string;
  site: string;
  instruction: string;
}

interface Fork {
  at: string;
  branch: GraphNode[];
  deadEnd: boolean;
}

interface JourneyGraph {
  nodes: GraphNode[];
  edges: { from: string; to: string; condition?: string }[];
}

interface GraphData {
  graph: JourneyGraph;
  position: string;
  forks: Fork[];
}

type NodeStatus = 'done' | 'current' | 'future' | 'error';

// ── Chameleon palette ────────────────────────────────────────────────────────
// Every node/edge/label colour derives from the matched host scheme (oklch hue `h`,
// chroma base `c`) and the surface `mode`. This mirrors the sidebar: in DARK mode the
// panel sits on dark glass so strokes/labels are LIGHT; in LIGHT mode the container bg is
// flipped light by the content script, so strokes/labels go DARK (low oklch L) to stay
// legible — while the current/active node keeps a saturated mid-L accent glow in both.
//
// The error/fork family is intentionally NOT tied to the scheme hue: errors must always
// read as errors. We anchor them to a warm-red hue (~28) so a breakpoint on a blue or
// green flow still looks like a warning, never like "just another node".
const FORK_HUE = 28; // fixed warm-red for breakpoints/forks — distinctness over matching
const FORK_C = 0.16;

interface Palette {
  doneFill: string;
  doneStroke: string;
  doneCheck: string;
  currentStroke: string;
  currentGlow: string;
  currentHaloA: string;
  currentHaloB: string;
  currentHalo: string;
  currentPillFill: string;
  currentPillStroke: string;
  currentPillText: string;
  futureFill: string;
  futureStroke: string;
  futureDot: string;
  lineDone: string;
  lineFuture: string;
  // fork / error family (fixed hue)
  forkColor: string;
  forkNodeFill: string;
  forkLine: string;
  forkLabelDim: string;
  forkBox: string;
}

function makePalette(h: number, c: number, mode: 'light' | 'dark'): Palette {
  const light = mode === 'light';
  // Accent (current node) stays a saturated mid/high-L hue in BOTH modes — it's the focal glow.
  const accentL = light ? 0.62 : 0.88;
  const accentC = c;
  const accent = `oklch(${accentL} ${accentC} ${h})`;

  if (light) {
    // Light surface: dark ink on light panel. Strokes/labels low-L; surfaces lighten.
    return {
      doneFill: `oklch(0.78 calc(${c}*0.55) ${h} / 0.45)`,
      doneStroke: `oklch(0.48 calc(${c}*0.70) ${h} / 0.75)`,
      doneCheck: `oklch(0.40 calc(${c}*0.80) ${h})`,
      currentStroke: accent,
      currentGlow: `oklch(${accentL} ${accentC} ${h} / 0.40)`,
      currentHaloA: `oklch(0.60 ${c} ${h} / 0.10)`,
      currentHaloB: `oklch(0.60 ${c} ${h} / 0.14)`,
      currentHalo: `oklch(0.60 ${c} ${h} / 0.07)`,
      currentPillFill: `oklch(0.92 calc(${c}*0.30) ${h} / 0.55)`,
      currentPillStroke: `oklch(0.55 calc(${c}*0.70) ${h} / 0.55)`,
      currentPillText: `oklch(0.40 calc(${c}*0.80) ${h})`,
      futureFill: `oklch(0.86 calc(${c}*0.10) ${h} / 0.65)`,
      futureStroke: `oklch(0.60 calc(${c}*0.30) ${h} / 0.55)`,
      futureDot: `oklch(0.55 calc(${c}*0.40) ${h} / 0.55)`,
      lineDone: `oklch(0.55 calc(${c}*0.85) ${h} / 0.55)`,
      lineFuture: `oklch(0.62 calc(${c}*0.30) ${h} / 0.40)`,
      forkColor: `oklch(0.50 ${FORK_C} ${FORK_HUE})`,
      forkNodeFill: `oklch(0.88 calc(${FORK_C}*0.40) ${FORK_HUE} / 0.55)`,
      forkLine: `oklch(0.55 ${FORK_C} ${FORK_HUE} / 0.45)`,
      forkLabelDim: `oklch(0.52 ${FORK_C} ${FORK_HUE} / 0.65)`,
      forkBox: `oklch(0.55 ${FORK_C} ${FORK_HUE} / 0.40)`,
    };
  }

  // Dark surface — preserves today's exact look (was hue 35 / chroma 0.18).
  return {
    doneFill: `oklch(0.56 calc(${c}*0.80) ${h} / 0.55)`,
    doneStroke: `oklch(0.68 calc(${c}*0.85) ${h} / 0.65)`,
    doneCheck: `oklch(0.92 calc(${c}*1.33) ${h})`,
    currentStroke: accent,
    currentGlow: `oklch(${accentL} ${accentC} ${h} / 0.40)`,
    currentHaloA: `oklch(0.84 calc(${c}*1.22) ${h} / 0.06)`,
    currentHaloB: `oklch(0.84 calc(${c}*1.22) ${h} / 0.08)`,
    currentHalo: `oklch(0.84 calc(${c}*1.22) ${h} / 0.04)`,
    currentPillFill: `oklch(0.22 calc(${c}*0.53) ${h} / 0.30)`,
    currentPillStroke: `oklch(0.84 calc(${c}*1.22) ${h} / 0.45)`,
    currentPillText: `oklch(0.88 calc(${c}*1.22) ${h})`,
    futureFill: `oklch(0.22 calc(${c}*0.28) ${h} / 0.70)`,
    futureStroke: `oklch(0.45 calc(${c}*0.55) ${h} / 0.55)`,
    futureDot: `oklch(0.45 calc(${c}*0.55) ${h} / 0.55)`,
    lineDone: `oklch(0.60 calc(${c}*1.07) ${h} / 0.55)`,
    lineFuture: `oklch(0.28 calc(${c}*0.37) ${h} / 0.28)`,
    forkColor: `oklch(0.82 ${FORK_C} ${FORK_HUE})`,
    forkNodeFill: `oklch(0.18 calc(${FORK_C}*0.27) ${FORK_HUE} / 0.50)`,
    forkLine: `oklch(0.82 ${FORK_C} ${FORK_HUE} / 0.40)`,
    forkLabelDim: `oklch(0.82 ${FORK_C} ${FORK_HUE} / 0.55)`,
    forkBox: `oklch(0.82 ${FORK_C} ${FORK_HUE} / 0.50)`,
  };
}

const NODE_SPACING = 80;
const NODE_Y = 70;
const PADDING_X = 50;
const PADDING_Y = 30;
const FORK_DROP = 70;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

function NodeDone({ cx, cy, p }: { cx: number; cy: number; p: Palette }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={p.doneFill} stroke={p.doneStroke} strokeWidth={1.8} />
      <path
        d={`M${cx - 3.5} ${cy} l3 3 5-5`}
        stroke={p.doneCheck}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  );
}

function NodeCurrent({ cx, cy, p }: { cx: number; cy: number; p: Palette }) {
  return (
    <g>
      {/* Pulsing outer ring — animated via CSS class */}
      <circle cx={cx} cy={cy} r={18} fill="none" stroke={p.currentGlow} strokeWidth={1.5} className="node-current-pulse" />
      <circle cx={cx} cy={cy} r={22} fill={p.currentHaloA} />
      <circle cx={cx} cy={cy} r={16} fill={p.currentHaloB} />
      <circle cx={cx} cy={cy} r={11} fill="transparent" stroke={p.currentStroke} strokeWidth={2.5} className="node-current-ring" />
      <circle cx={cx} cy={cy} r={5} fill={p.currentStroke} />
      {/* YOU ARE HERE pill */}
      <rect
        x={cx - 34}
        y={cy + 18}
        width={68}
        height={15}
        rx={7.5}
        fill={p.currentPillFill}
        stroke={p.currentPillStroke}
        strokeWidth={0.8}
      />
      <text
        x={cx}
        y={cy + 29}
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontSize={7.5}
        fontWeight={800}
        fill={p.currentPillText}
        letterSpacing=".10em"
      >
        YOU ARE HERE
      </text>
    </g>
  );
}

function NodeFuture({ cx, cy, p }: { cx: number; cy: number; p: Palette }) {
  return (
    <g>
      {/* Higher-contrast outer ring */}
      <circle cx={cx} cy={cy} r={9} fill={p.futureFill} stroke={p.futureStroke} strokeWidth={1.5} />
      {/* Subtle inner dot to read as a real step */}
      <circle cx={cx} cy={cy} r={2.5} fill={p.futureDot} />
    </g>
  );
}

function NodeError({ cx, cy, p }: { cx: number; cy: number; p: Palette }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill={p.forkNodeFill}
        stroke={p.forkColor}
        strokeWidth={1.2}
        strokeDasharray="3 2"
      />
      <text x={cx} y={cy + 3} textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize={9} fontWeight={900} fill={p.forkColor}>!</text>
    </g>
  );
}

function GraphPanel() {
  const [data, setData] = useState<GraphData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ id: string; cx: number; cy: number; label: string; site?: string } | null>(null);
  // Chameleon theme — defaults reproduce today's Reliquary amber dark look.
  const [theme, setTheme] = useState<{ h: number; c: number; mode: 'light' | 'dark' }>({ h: 35, c: 0.18, mode: 'dark' });

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg?.type) return;

      if (msg.type === 'GRAPH_DATA') {
        setData({
          graph: msg.graph,
          position: msg.position,
          forks: msg.forks || [],
        });
      } else if (msg.type === 'THEME') {
        // Content script matched the host page to a scheme. Re-tint everything: SVG colours
        // derive from (h, c, mode) below, and the CSS vars feed the header/legend/scrollbar.
        const h = typeof msg.h === 'number' ? msg.h : 35;
        const c = typeof msg.c === 'number' ? msg.c : 0.18;
        const mode: 'light' | 'dark' = msg.mode === 'light' ? 'light' : 'dark';
        setTheme({ h, c, mode });
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Drive the CSS custom props + light-surface class that styles.css reads (header, progress
  // bar, legend, scrollbar, empty state). Mirrors the sidebar's THEME_SCHEME handler.
  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--ouija-h', String(theme.h));
    el.style.setProperty('--ouija-c', String(theme.c));
    el.classList.toggle('ouija-light', theme.mode === 'light');
  }, [theme]);

  const palette = useMemo(() => makePalette(theme.h, theme.c, theme.mode), [theme]);

  const layout = useMemo(() => {
    if (!data || !data.graph) return null;

    const { graph, position, forks } = data;
    const posIndex = graph.nodes.findIndex((n) => n.id === position);
    const forkNodeIds = new Set(forks.map((f) => f.at));

    const nodes = graph.nodes.map((node, i) => {
      const status: NodeStatus = forkNodeIds.has(node.id)
        ? 'error'
        : i < posIndex
        ? 'done'
        : i === posIndex
        ? 'current'
        : 'future';

      return {
        ...node,
        status,
        cx: PADDING_X + i * NODE_SPACING,
        cy: NODE_Y,
      };
    });

    // Calculate fork positions
    const forkLayouts = forks.map((fork) => {
      const parentNode = nodes.find((n) => n.id === fork.at);
      if (!parentNode) return null;
      return {
        ...fork,
        parentCx: parentNode.cx,
        parentCy: parentNode.cy,
        branchNodes: fork.branch.map((bn, bi) => ({
          ...bn,
          cx: parentNode.cx + (bi + 1) * 40,
          cy: parentNode.cy + FORK_DROP,
        })),
      };
    }).filter(Boolean);

    const totalWidth = PADDING_X * 2 + (nodes.length - 1) * NODE_SPACING;
    const hasForks = forkLayouts.length > 0;
    const totalHeight = hasForks ? NODE_Y + FORK_DROP + 60 : NODE_Y * 2 + PADDING_Y;
    const doneCount = nodes.filter((n) => n.status === 'done').length;

    return { nodes, forkLayouts, totalWidth, totalHeight, posIndex, doneCount };
  }, [data]);

  if (!data || !data.graph || !layout) {
    return (
      <div className="graph-panel">
        <div className="graph-panel__empty">
          <span className="graph-panel__empty-orb" />
          Waiting for journey data…
        </div>
      </div>
    );
  }

  const { nodes, forkLayouts, totalWidth, totalHeight, posIndex, doneCount } = layout;
  const total = nodes.length;
  const stepNo = posIndex >= 0 ? posIndex + 1 : doneCount;
  const pct = total > 1 ? Math.round((doneCount / (total - 1)) * 100) : doneCount > 0 ? 100 : 0;

  return (
    <div className="graph-panel">
      <div className="graph-panel__header">
        <div className="graph-panel__title">Journey graph</div>
        <div className="graph-panel__progress">
          <span className="graph-panel__step">{posIndex >= 0 ? `Step ${stepNo} of ${total}` : `${doneCount}/${total} done`}</span>
          <div className="graph-panel__bar">
            <div className="graph-panel__bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <div className="graph-panel__svg-wrap">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="graph-panel__svg"
          style={{ width: totalWidth, minWidth: totalWidth }}
        >
          {/* Connecting edges between main nodes */}
          {nodes.map((node, i) => {
            if (i === nodes.length - 1) return null;
            const next = nodes[i + 1];
            const isDoneEdge =
              node.status === 'done' && (next.status === 'done' || next.status === 'current');
            const isFutureEdge = next.status === 'future';

            return (
              <line
                key={`edge-${i}`}
                className={`graph-edge ${isDoneEdge ? 'graph-edge--done' : ''}`}
                x1={node.cx}
                y1={node.cy}
                x2={next.cx}
                y2={next.cy}
                stroke={isDoneEdge ? palette.lineDone : palette.lineFuture}
                strokeWidth={isDoneEdge ? 2.2 : 1.2}
                strokeDasharray={isFutureEdge ? '4 4' : '0'}
                strokeLinecap="round"
              />
            );
          })}

          {/* Fork branches */}
          {forkLayouts.map((fork, fi) => {
            if (!fork) return null;
            return (
              <g key={`fork-${fi}`} className="graph-fork">
                {/* Dashed line from parent down */}
                <path
                  d={`M${fork.parentCx} ${fork.parentCy + 11} Q${fork.parentCx} ${fork.parentCy + FORK_DROP * 0.5} ${fork.parentCx} ${fork.parentCy + FORK_DROP - 10}`}
                  stroke={palette.forkLine}
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                  fill="none"
                />
                {/* BREAKPOINT label */}
                <text
                  x={fork.parentCx + 14}
                  y={fork.parentCy + FORK_DROP * 0.5}
                  fontFamily="Manrope, sans-serif"
                  fontSize={8}
                  fontWeight={800}
                  fill={palette.forkLabelDim}
                  letterSpacing=".10em"
                >
                  BREAKPOINT
                </text>
                {/* Fork branch nodes */}
                {fork.branchNodes.map((bn, bi) => (
                  <g key={`fork-${fi}-node-${bi}`}>
                    {bi > 0 && (
                      <line
                        x1={fork.branchNodes[bi - 1].cx}
                        y1={fork.branchNodes[bi - 1].cy}
                        x2={bn.cx}
                        y2={bn.cy}
                        stroke={palette.forkLine}
                        strokeWidth={1}
                        strokeDasharray="3 2"
                      />
                    )}
                    {bi === 0 && (
                      <line
                        x1={fork.parentCx}
                        y1={fork.parentCy + FORK_DROP - 10}
                        x2={bn.cx}
                        y2={bn.cy}
                        stroke={palette.forkLine}
                        strokeWidth={1}
                        strokeDasharray="3 2"
                      />
                    )}
                    <circle
                      cx={bn.cx}
                      cy={bn.cy}
                      r={6}
                      fill={palette.forkNodeFill}
                      stroke={palette.forkBox}
                      strokeWidth={1}
                      strokeDasharray="3 2"
                    />
                    <text
                      x={bn.cx}
                      y={bn.cy + 16}
                      textAnchor="middle"
                      fontFamily="Manrope, sans-serif"
                      fontSize={8}
                      fontWeight={600}
                      fill={palette.forkColor}
                    >
                      {truncate(bn.instruction, 15)}
                    </text>
                  </g>
                ))}
                {fork.deadEnd && (
                  <text
                    x={fork.branchNodes[fork.branchNodes.length - 1]?.cx ?? fork.parentCx}
                    y={(fork.branchNodes[fork.branchNodes.length - 1]?.cy ?? fork.parentCy + FORK_DROP) + 28}
                    textAnchor="middle"
                    fontFamily="Manrope, sans-serif"
                    fontSize={7}
                    fontWeight={700}
                    fill={palette.forkBox}
                    letterSpacing=".06em"
                  >
                    DEAD END
                  </text>
                )}
              </g>
            );
          })}

          {/* Current node background glow */}
          {nodes.map((node) => {
            if (node.status !== 'current') return null;
            return (
              <g key={`glow-${node.id}`}>
                <circle cx={node.cx} cy={node.cy} r={32} fill={palette.currentHalo} className="node-current-halo" />
              </g>
            );
          })}

          {/* Main nodes with hover handlers — each node animates its position via CSS
              transition on a translate transform so re-layout (advance) glides. */}
          {nodes.map((node) => {
            const nodeEl = (() => {
              switch (node.status) {
                case 'done':
                  return <NodeDone key={node.id} cx={node.cx} cy={node.cy} p={palette} />;
                case 'current':
                  return <NodeCurrent key={node.id} cx={node.cx} cy={node.cy} p={palette} />;
                case 'error':
                  return <NodeError key={node.id} cx={node.cx} cy={node.cy} p={palette} />;
                case 'future':
                default:
                  return <NodeFuture key={node.id} cx={node.cx} cy={node.cy} p={palette} />;
              }
            })();

            return (
              <g
                key={`hover-${node.id}`}
                className="graph-node-group"
                onMouseEnter={() => setHoveredNode({ id: node.id, cx: node.cx, cy: node.cy, label: node.instruction, site: node.site })}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Invisible larger hit area */}
                <circle cx={node.cx} cy={node.cy} r={20} fill="transparent" />
                {nodeEl}
              </g>
            );
          })}

          {/* Hover tooltip — HTML via foreignObject so the label WRAPS inside its border
              (an SVG <text> can't wrap, which is why it used to overflow the box). */}
          {hoveredNode && (() => {
            const label = truncate(hoveredNode.label, 88);
            const site = hoveredNode.site ? truncate(hoveredNode.site, 44) : '';
            const boxW = 280;
            const boxH = site ? 70 : 54;
            const x = Math.max(4, Math.min(hoveredNode.cx - boxW / 2, totalWidth - boxW - 4));
            const y = Math.max(2, hoveredNode.cy - boxH - 12);
            return (
              <foreignObject x={x} y={y} width={boxW} height={boxH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                <div className="graph-tip-wrap">
                  <div className="graph-tip">
                    <div className="graph-tip__label">{label}</div>
                    {site && <div className="graph-tip__site">{site}</div>}
                  </div>
                </div>
              </foreignObject>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="graph-panel__legend">
        <span className="graph-legend__item"><span className="graph-legend__dot graph-legend__dot--done" />Done</span>
        <span className="graph-legend__item"><span className="graph-legend__dot graph-legend__dot--current" />Here</span>
        <span className="graph-legend__item"><span className="graph-legend__dot graph-legend__dot--future" />Upcoming</span>
        {forkLayouts.length > 0 && (
          <span className="graph-legend__item"><span className="graph-legend__dot graph-legend__dot--fork" />Recovery</span>
        )}
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<GraphPanel />);
}
