import React from 'react';

const STYLE_ID = 'ouija-spotlight-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .ouija-spotlight {
    position: absolute; pointer-events: none;
    border-radius: var(--radius-md);
    border: 1.5px solid color-mix(in srgb, var(--accent-400) 80%, white);
    box-shadow: var(--glow-spotlight);
    background: color-mix(in srgb, var(--accent-300) 8%, transparent);
    animation: ouija-spot-breathe 2.6s var(--ease-in-out) infinite;
  }
  /* the soft light, not a harsh border */
  .ouija-spotlight::after {
    content: ''; position: absolute; inset: -2px; border-radius: inherit;
    box-shadow: inset 0 0 14px 1px color-mix(in srgb, var(--accent-200) 60%, transparent);
  }
  @keyframes ouija-spot-breathe {
    0%, 100% { box-shadow: 0 0 0 2px rgb(var(--accent-rgb) / 0.85), 0 0 0 7px rgb(var(--accent-rgb) / 0.22), 0 0 30px 5px rgb(var(--accent-rgb) / 0.42); }
    50%      { box-shadow: 0 0 0 2px rgb(var(--accent-rgb) / 0.95), 0 0 0 11px rgb(var(--accent-rgb) / 0.16), 0 0 44px 9px rgb(var(--accent-rgb) / 0.55); }
  }
  @media (prefers-reduced-motion: reduce) { .ouija-spotlight { animation: none; } }

  @keyframes ouija-spot-in {
    from { transform: scale(1.08); }
    to   { transform: scale(1); }
  }
  .ouija-spotlight--animate { animation: ouija-spot-in var(--dur-base) var(--spring-soft) both, ouija-spot-breathe 2.6s var(--ease-in-out) 0.3s infinite; }
  `;
  document.head.appendChild(el);
}

/**
 * Spotlight — a soft glowing rounded frame that draws attention to one element
 * on the host page. It reads as a gentle pool of light, not a harsh border, and
 * breathes slowly to hold attention without nagging. Never covers the target.
 */
export function Spotlight({
  radius,
  animate = true,
  style,
  className = '',
  ...rest
}) {
  return (
    <div
      className={`ouija-spotlight${animate ? ' ouija-spotlight--animate' : ''} ${className}`}
      style={{ ...(radius != null ? { borderRadius: radius } : {}), ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}
