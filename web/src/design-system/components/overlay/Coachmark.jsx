import React from 'react';

const STYLE_ID = 'ouija-coachmark-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .ouija-coach {
    position: relative; display: inline-flex; flex-direction: column; gap: var(--space-2);
    max-width: 280px; font-family: var(--font-sans);
    padding: var(--space-3) var(--space-4);
    background: var(--glass-tint-strong);
    -webkit-backdrop-filter: var(--glass-blur);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-stroke);
    border-radius: var(--radius-lg);
    box-shadow: var(--glass-highlight), var(--shadow-lg);
    color: var(--text-primary);
  }
  .ouija-coach--animate { animation: ouija-coach-in var(--dur-base) var(--spring-soft); }
  @keyframes ouija-coach-in { from { transform: scale(0.92) translateY(4px);} to { transform: scale(1) translateY(0);} }
  @media (prefers-reduced-motion: reduce){ .ouija-coach--animate { animation: none; } }

  .ouija-coach__text { font-size: var(--fs-sm); font-weight: var(--fw-medium); line-height: var(--lh-snug); text-wrap: pretty; }
  .ouija-coach__text b, .ouija-coach__text strong { font-weight: var(--fw-bold); }

  .ouija-coach__copy {
    display: flex; align-items: center; gap: var(--space-2);
    background: var(--ink-50); border: 1px solid var(--ink-200);
    border-radius: var(--radius-sm); padding: 6px 6px 6px 10px;
  }
  .ouija-coach__val { flex: 1; font-family: var(--font-mono); font-size: var(--fs-mono);
    color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ouija-coach__btn {
    flex: 0 0 auto; display: inline-flex; align-items: center; gap: 5px; cursor: pointer;
    border: none; background: var(--accent-sheen), var(--fill-accent-grad); color: #fff;
    font-family: var(--font-sans); font-size: var(--fs-xs); font-weight: var(--fw-bold);
    padding: 5px 9px; border-radius: 7px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), var(--shadow-accent);
    transition: filter var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--spring-snappy);
  }
  .ouija-coach__btn:hover { filter: brightness(1.07); }
  .ouija-coach__btn:active { transform: scale(0.94); }
  .ouija-coach__btn svg { width: 13px; height: 13px; stroke-width: 2.25; }

  /* tail */
  .ouija-coach__tail { position: absolute; width: 14px; height: 14px;
    background: var(--glass-tint-strong); border: 1px solid var(--glass-stroke);
    -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur);
    transform: rotate(45deg); }
  .ouija-coach--up    .ouija-coach__tail { top: -8px; left: 24px; border-right:0; border-bottom:0; }
  .ouija-coach--down  .ouija-coach__tail { bottom: -8px; left: 24px; border-left:0; border-top:0; }
  .ouija-coach--left  .ouija-coach__tail { left: -8px; top: 22px; border-top:0; border-right:0; }
  .ouija-coach--right .ouija-coach__tail { right: -8px; top: 22px; border-bottom:0; border-left:0; }
  `;
  document.head.appendChild(el);
}

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="11" height="11" rx="2.5"/>
    <path d="M5 15V5a2 2 0 0 1 2-2h8"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="m20 7-11 11-5-5"/>
  </svg>
);

/**
 * Coachmark — a small glassy label that sits *beside* the spotlighted element
 * with a short instruction and an optional copy-to-clipboard chip (for pasting
 * a Pixel ID, key, or domain between sites). A little tail points at the target.
 */
export function Coachmark({
  children,
  html,
  arrow = 'up',
  copyValue,
  copyLabel = 'Copy',
  animate = true,
  style,
  className = '',
}) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(String(copyValue)); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className={`ouija-coach ouija-coach--${arrow}${animate ? ' ouija-coach--animate' : ''} ${className}`} style={style}>
      <span className="ouija-coach__tail" aria-hidden="true" />
      <div className="ouija-coach__text" {...(html ? { dangerouslySetInnerHTML: { __html: html } } : {})}>
        {html ? null : children}
      </div>
      {copyValue != null && (
        <div className="ouija-coach__copy">
          <span className="ouija-coach__val">{copyValue}</span>
          <button type="button" className="ouija-coach__btn" onClick={handleCopy}>
            {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> {copyLabel}</>}
          </button>
        </div>
      )}
    </div>
  );
}
