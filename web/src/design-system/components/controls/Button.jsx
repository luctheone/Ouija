import React from 'react';

/* Inject Button styles once (pseudo-states can't live in inline style). */
const STYLE_ID = 'ouija-button-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .ouija-btn {
    font-family: var(--font-sans);
    font-weight: var(--fw-semibold);
    letter-spacing: -0.005em;
    display: inline-flex; align-items: center; justify-content: center;
    gap: var(--space-2);
    border: 1px solid transparent;
    border-radius: var(--radius-pill);
    cursor: pointer; white-space: nowrap;
    transition: transform var(--dur-fast) var(--spring-snappy),
                box-shadow var(--dur-base) var(--ease-out),
                background var(--dur-base) var(--ease-out),
                filter var(--dur-base) var(--ease-out);
    -webkit-backdrop-filter: var(--glass-blur);
    backdrop-filter: var(--glass-blur);
  }
  .ouija-btn:active { transform: scale(var(--press-scale)); }
  .ouija-btn:disabled { opacity: 0.45; cursor: not-allowed; pointer-events: none; }
  .ouija-btn .ouija-btn__icon { display: inline-flex; }
  .ouija-btn .ouija-btn__icon svg { width: 1.1em; height: 1.1em; stroke-width: 2; }

  /* sizes */
  .ouija-btn--sm { height: var(--control-h-sm); padding: 0 var(--space-4); font-size: var(--fs-sm); }
  .ouija-btn--md { height: var(--control-h-md); padding: 0 var(--space-5); font-size: var(--fs-body); }
  .ouija-btn--lg { height: var(--control-h-lg); padding: 0 var(--space-6); font-size: var(--fs-heading); }

  /* primary — dimensional accent with sheen + colored cast */
  .ouija-btn--primary { background: var(--accent-sheen), var(--fill-accent-grad); color: var(--text-on-accent);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.38), var(--shadow-md), var(--shadow-accent); }
  .ouija-btn--primary:hover { transform: translateY(var(--hover-lift)); filter: brightness(1.07) saturate(1.05);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), var(--glow-accent), var(--shadow-accent); }
  .ouija-btn--primary:active { filter: brightness(0.97); }

  /* secondary — frosted glass */
  .ouija-btn--secondary { background: var(--glass-tint-strong); color: var(--text-primary);
    border-color: var(--glass-stroke); box-shadow: var(--glass-highlight), var(--shadow-sm); }
  .ouija-btn--secondary:hover { background: #fff; transform: translateY(var(--hover-lift)); box-shadow: var(--glass-highlight), var(--shadow-md); }

  /* ghost — quiet, transparent until hover */
  .ouija-btn--ghost { background: transparent; color: var(--text-secondary); backdrop-filter: none; -webkit-backdrop-filter: none; }
  .ouija-btn--ghost:hover { background: var(--glass-tint-soft); color: var(--text-primary); }
  `;
  document.head.appendChild(el);
}

/**
 * Button — Ouija's primary action control. Pill-shaped, glassy, soft spring press.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  disabled = false,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`ouija-btn ouija-btn--${variant} ouija-btn--${size}`}
      disabled={disabled}
      onClick={onClick}
      style={style}
      {...rest}
    >
      {iconLeft && <span className="ouija-btn__icon">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ouija-btn__icon">{iconRight}</span>}
    </button>
  );
}
