import React from 'react';

const STYLE_ID = 'ouija-progress-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .ouija-progress { display: flex; align-items: center; gap: var(--space-3); font-family: var(--font-sans); }
  .ouija-progress__label { font-size: var(--fs-xs); font-weight: var(--fw-bold); letter-spacing: var(--ls-eyebrow);
    text-transform: uppercase; color: var(--text-tertiary); white-space: nowrap; }

  /* dots */
  .ouija-progress__dots { display: flex; align-items: center; gap: var(--space-2); }
  .ouija-dot { width: 8px; height: 8px; border-radius: var(--radius-pill); background: var(--ink-300);
    transition: all var(--dur-base) var(--spring-soft); }
  .ouija-dot--done { background: var(--accent-400); }
  .ouija-dot--current { width: 22px; background: var(--accent-500); box-shadow: var(--glow-accent); }

  /* bar */
  .ouija-progress__bar { position: relative; height: 6px; border-radius: var(--radius-pill);
    background: var(--ink-200); overflow: hidden; min-width: 120px; flex: 1; }
  .ouija-progress__fill { position: absolute; inset: 0 auto 0 0; border-radius: var(--radius-pill);
    background: linear-gradient(90deg, var(--accent-400), var(--accent-500));
    box-shadow: 0 0 12px var(--accent-glow);
    transition: width var(--dur-slow) var(--spring-soft); }
  `;
  document.head.appendChild(el);
}

/**
 * ProgressDots — shows where the user is in a multi-step journey. The current
 * step is an elongated glowing pill; completed steps are filled accent dots.
 */
export function ProgressDots({
  total = 6,
  current = 1,
  variant = 'dots',
  showLabel = true,
  labelFormat,
}) {
  const label = labelFormat
    ? labelFormat(current, total)
    : `Step ${current} of ${total}`;

  return (
    <div className="ouija-progress">
      {variant === 'bar' ? (
        <>
          <div className="ouija-progress__bar">
            <div className="ouija-progress__fill" style={{ width: `${Math.max(0, Math.min(1, current / total)) * 100}%` }} />
          </div>
          {showLabel && <span className="ouija-progress__label">{label}</span>}
        </>
      ) : (
        <>
          {showLabel && <span className="ouija-progress__label">{label}</span>}
          <div className="ouija-progress__dots">
            {Array.from({ length: total }).map((_, i) => {
              const n = i + 1;
              const cls = n < current ? 'ouija-dot--done' : n === current ? 'ouija-dot--current' : '';
              return <span key={i} className={`ouija-dot ${cls}`} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}
