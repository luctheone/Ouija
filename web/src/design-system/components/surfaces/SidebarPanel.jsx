import React from 'react';

/* ── Inject component styles once ────────────────────────── */
const STYLE_ID = 'ouija-sidebar-panel-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  /* ── Root ────────────────────────────────────────────────── */
  .ouija-sp-root {
    font-family: var(--font-sans, 'Manrope', sans-serif);
  }

  /* ── Panel ───────────────────────────────────────────────── */
  .ouija-sp {
    position: relative;
    isolation: isolate;
    width: var(--ouija-panel-width, 296px);
    max-width: calc(100vw - 2 * var(--ouija-panel-margin, 16px));
    display: flex;
    flex-direction: column;
    background: var(--ouija-surface);
    -webkit-backdrop-filter: var(--ouija-blur-panel);
    backdrop-filter: var(--ouija-blur-panel);
    border-radius: var(--ouija-radius-panel, 24px);
    box-shadow: var(--ouija-shadow-panel);
    overflow: hidden;
  }

  /* Rotating glint border */
  .ouija-sp::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: conic-gradient(from var(--ouija-glint-angle, 45deg),
      var(--ouija-glint-lo)  0deg,
      var(--ouija-glint-lo)  var(--ouija-glint-arc-start, 66deg),
      var(--ouija-glint-mid) calc(var(--ouija-glint-arc-start, 66deg) + 9deg),
      var(--ouija-glint-hi)  var(--ouija-glint-peak, 84deg),
      var(--ouija-glint-mid) calc(var(--ouija-glint-arc-end, 102deg) - 9deg),
      var(--ouija-glint-lo)  var(--ouija-glint-arc-end, 102deg),
      var(--ouija-glint-lo)  360deg);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: ouija-glint-spin var(--ouija-glint-duration, 9s) var(--ouija-glint-ease, ease-in-out) infinite;
    pointer-events: none;
    z-index: 3;
  }

  @keyframes ouija-glint-spin {
    to { --ouija-glint-angle: 405deg; }
  }

  @keyframes ouija-sp-in {
    from { opacity: 0; transform: translateY(10px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .ouija-sp--animate {
    animation: ouija-sp-in 0.38s cubic-bezier(0.34, 1.48, 0.64, 1) both;
  }

  /* ── Header ──────────────────────────────────────────────── */
  .ouija-sp__head {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 16px 14px;
    background: linear-gradient(180deg, var(--ouija-surface-strong), transparent);
  }

  /* Spark mark */
  .ouija-sp__mark {
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--ouija-mark-color);
    background: var(--ouija-mark-bg);
    border: 1px solid var(--ouija-mark-border);
  }
  .ouija-sp__mark svg { width: 16px; height: 16px; }

  /* Identity */
  .ouija-sp__id { flex: 1; min-width: 0; }
  .ouija-sp__name {
    display: block;
    font-family: var(--font-serif, 'Instrument Serif', serif);
    font-style: italic;
    font-size: var(--fs-identity, 28px);
    line-height: var(--lh-tight, 1.15);
    color: var(--ouija-text-hi);
    letter-spacing: 0.01em;
  }
  .ouija-sp__sub {
    display: block;
    font-size: var(--fs-xs, 11px);
    font-weight: var(--fw-semibold, 600);
    color: var(--ouija-text-muted);
    letter-spacing: var(--ls-wide, 0.04em);
    margin-top: 1px;
  }

  /* Minimize button */
  .ouija-sp__min {
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: var(--ouija-surface-soft);
    color: var(--ouija-text-lo);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.15s, color 0.15s, transform 0.12s;
  }
  .ouija-sp__min:hover { color: var(--ouija-text-md); }
  .ouija-sp__min:active { transform: scale(0.92); }
  .ouija-sp__min svg { width: 13px; height: 13px; }

  /* ── Node progress ───────────────────────────────────────── */
  .ouija-sp__progress {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: var(--ouija-node-gap, 5px);
    padding: 0 16px 14px;
  }
  .ouija-nd {
    flex: 0 0 auto;
    border-radius: 50%;
  }
  .ouija-nd--done {
    width: var(--ouija-node-size, 7px);
    height: var(--ouija-node-size, 7px);
    background: var(--ouija-node-done-fill);
    border: var(--ouija-node-border-w, 1px) solid var(--ouija-node-done-stroke);
  }
  .ouija-nd--now {
    width: var(--ouija-node-size-now, 9px);
    height: var(--ouija-node-size-now, 9px);
    background: transparent;
    border: var(--ouija-node-now-border-w, 1.5px) solid var(--ouija-node-now-stroke);
    box-shadow: 0 0 10px var(--ouija-node-now-glow), inset 0 0 4px var(--ouija-node-now-glow);
  }
  .ouija-nd--future {
    width: var(--ouija-node-size, 7px);
    height: var(--ouija-node-size, 7px);
    background: var(--ouija-node-future-fill);
    border: var(--ouija-node-border-w, 1px) solid oklch(0 0 0 / 0);
  }
  .ouija-nd-seg {
    flex: 1;
    height: 1px;
    background: var(--ouija-node-seg);
  }
  .ouija-sp__step-lbl {
    font-size: var(--fs-xs, 11px);
    font-weight: var(--fw-semibold, 600);
    color: var(--ouija-text-muted);
    letter-spacing: var(--ls-wide, 0.04em);
    white-space: nowrap;
    margin-left: 2px;
  }

  /* ── Body ────────────────────────────────────────────────── */
  .ouija-sp__body {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 2px 14px 14px;
    overflow-y: auto;
  }

  /* ── Thinking indicator ──────────────────────────────────── */
  .ouija-sp__think {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    align-self: flex-start;
    padding: 10px 13px;
    border-radius: var(--ouija-radius-bubble-ai, 14px 14px 14px 4px);
    background: var(--ouija-bubble-ai);
    border: 1px solid var(--ouija-bubble-ai-border);
  }
  .ouija-sp__think span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--ouija-mark-color);
    animation: ouija-sp-think 1.2s ease-in-out infinite;
  }
  .ouija-sp__think span:nth-child(2) { animation-delay: 0.15s; }
  .ouija-sp__think span:nth-child(3) { animation-delay: 0.30s; }
  @keyframes ouija-sp-think {
    0%, 100% { opacity: 0.32; transform: translateY(0); }
    40%       { opacity: 1;    transform: translateY(-3px); }
  }

  /* ── Footer / CTA ────────────────────────────────────────── */
  .ouija-sp__foot {
    position: relative;
    z-index: 2;
    padding: 12px 14px 16px;
    background: linear-gradient(0deg, var(--ouija-surface-strong), transparent);
  }
  .ouija-sp__cta {
    width: 100%;
    height: 44px;
    border-radius: var(--ouija-radius-btn, 999px);
    border: 1px solid var(--ouija-btn-border);
    background: var(--ouija-btn-bg);
    color: var(--ouija-btn-text);
    font-family: var(--font-sans, 'Manrope', sans-serif);
    font-size: var(--fs-sm, 13px);
    font-weight: var(--fw-bold, 700);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    letter-spacing: 0.01em;
    transition: background 0.18s, border-color 0.18s, transform 0.12s;
  }
  .ouija-sp__cta:hover {
    background: var(--ouija-btn-bg-hover);
    border-color: var(--ouija-btn-border-hover);
  }
  .ouija-sp__cta:active { transform: scale(var(--ouija-press-scale, 0.96)); }
  .ouija-sp__cta svg { width: 14px; height: 14px; flex-shrink: 0; }

  /* ── Collapsed orb ───────────────────────────────────────── */
  .ouija-sp-orb {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 50px;
    padding: 0 14px 0 6px;
    border-radius: var(--ouija-radius-orb, 999px);
    background: var(--ouija-surface-strong);
    -webkit-backdrop-filter: var(--ouija-blur-orb);
    backdrop-filter: var(--ouija-blur-orb);
    box-shadow: var(--ouija-shadow-panel);
    cursor: pointer;
    border: none;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: ouija-orb-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes ouija-orb-in {
    from { transform: scale(0.4); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .ouija-sp-orb::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: conic-gradient(from var(--ouija-glint-angle, 45deg),
      var(--ouija-glint-lo) 0deg,
      var(--ouija-glint-lo) 66deg,
      var(--ouija-glint-hi) 84deg,
      var(--ouija-glint-lo) 102deg,
      var(--ouija-glint-lo) 360deg);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: ouija-glint-spin var(--ouija-glint-duration, 9s) ease-in-out infinite;
    pointer-events: none;
  }
  .ouija-sp-orb:hover { transform: var(--ouija-hover-lift, translateY(-2px) scale(1.02)); }
  .ouija-sp-orb:active { transform: scale(var(--ouija-press-scale, 0.96)); }
  .ouija-sp-orb__mark {
    width: 38px; height: 38px;
    border-radius: 50%;
    display: grid; place-items: center;
    color: var(--ouija-mark-color);
    background: var(--ouija-mark-bg);
    border: 1px solid var(--ouija-mark-border);
    flex: 0 0 auto;
  }
  .ouija-sp-orb__mark svg {
    width: 18px; height: 18px;
    animation: ouija-orb-pulse 3.2s ease-in-out infinite;
  }
  @keyframes ouija-orb-pulse {
    0%, 100% { transform: scale(1);    opacity: 0.88; }
    50%       { transform: scale(1.12); opacity: 1; }
  }
  .ouija-sp-orb__label {
    font-size: var(--fs-xs, 11px);
    font-weight: var(--fw-semibold, 600);
    color: var(--ouija-text-lo);
    white-space: nowrap;
    letter-spacing: var(--ls-wide, 0.04em);
  }

  @media (prefers-reduced-motion: reduce) {
    .ouija-sp::after,
    .ouija-sp-orb::after { animation: none; }
    .ouija-sp--animate,
    .ouija-sp-orb { animation: none; }
    .ouija-sp__think span { animation: none; }
    .ouija-sp-orb__mark svg { animation: none; }
  }
  `;
  document.head.appendChild(el);
}

/* ── Icons ──────────────────────────────────────────────── */
const Spark = () => (
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 6C33.2 16.8 38.2 24.5 47.6 27.4C50.8 28.4 50.8 35.6 47.6 36.6C38.2 39.5 33.2 47.2 32 58C30.8 47.2 25.8 39.5 16.4 36.6C13.2 35.6 13.2 28.4 16.4 27.4C25.8 24.5 30.8 16.8 32 6Z" fill="currentColor"/>
  </svg>
);
const MinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M5 12h14"/>
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
  </svg>
);

/* ── Node progress (inline — Reliquary aesthetic) ─────── */
function NodeProgress({ step, total }) {
  const nodes = Array.from({ length: total }, (_, i) => {
    const idx = i + 1;
    if (idx < step)  return 'done';
    if (idx === step) return 'now';
    return 'future';
  });
  return (
    <div className="ouija-sp__progress" role="progressbar" aria-valuenow={step} aria-valuemax={total} aria-label={`Step ${step} of ${total}`}>
      {nodes.map((state, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className="ouija-nd-seg" />}
          <div className={`ouija-nd ouija-nd--${state}`} />
        </React.Fragment>
      ))}
      <span className="ouija-sp__step-lbl">Step {step}</span>
    </div>
  );
}

/**
 * SidebarPanel — Ouija's main floating surface.
 * Reliquary aesthetic: dark inverted glass, amber glint border,
 * Instrument Serif italic name, node-based progress.
 *
 * The panel inherits its accent color from --ouija-h / --ouija-c,
 * which the host-detector sets at runtime. No fixed brand color.
 */
export function SidebarPanel({
  children,
  title = 'Ouija',
  subtitle,
  step = 1,
  totalSteps = 6,
  collapsed = false,
  thinking = false,
  advanceLabel = 'I did it — next',
  onAdvance,
  onCollapse,
  onExpand,
  showProgress = true,
  animate = false,
  style,
}) {
  if (collapsed) {
    return (
      <div className="ouija-sp-root">
        <button
          className="ouija-sp-orb"
          onClick={onExpand}
          aria-label={`Open Ouija — Step ${step} of ${totalSteps}`}
          style={style}
        >
          <span className="ouija-sp-orb__mark"><Spark /></span>
          <span className="ouija-sp-orb__label">{step} of {totalSteps}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="ouija-sp-root">
      <div
        className={`ouija-sp${animate ? ' ouija-sp--animate' : ''}`}
        style={style}
      >
        {/* Header */}
        <div className="ouija-sp__head">
          <span className="ouija-sp__mark"><Spark /></span>
          <span className="ouija-sp__id">
            <span className="ouija-sp__name">{title}</span>
            {subtitle && <span className="ouija-sp__sub">{subtitle}</span>}
          </span>
          <button className="ouija-sp__min" onClick={onCollapse} aria-label="Minimize">
            <MinIcon />
          </button>
        </div>

        {/* Node progress */}
        {showProgress && <NodeProgress step={step} total={totalSteps} />}

        {/* Conversational body */}
        <div className="ouija-sp__body">
          {children}
          {thinking && (
            <div className="ouija-sp__think" aria-label="Ouija is thinking">
              <span /><span /><span />
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="ouija-sp__foot">
          <button className="ouija-sp__cta" onClick={onAdvance}>
            {advanceLabel}
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
