import React from 'react';

const STYLE_ID = 'ouija-pointer-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .ouija-pointer { position: absolute; display: grid; place-items: center; color: var(--accent-500);
    width: 34px; height: 34px; pointer-events: none; filter: drop-shadow(0 4px 10px var(--accent-glow)); }
  .ouija-pointer svg { width: 100%; height: 100%; }
  .ouija-pointer--up    { animation: ouija-bob-y 1.5s var(--ease-in-out) infinite; }
  .ouija-pointer--down  { animation: ouija-bob-y-rev 1.5s var(--ease-in-out) infinite; }
  .ouija-pointer--left  { animation: ouija-bob-x 1.5s var(--ease-in-out) infinite; }
  .ouija-pointer--right { animation: ouija-bob-x-rev 1.5s var(--ease-in-out) infinite; }
  @keyframes ouija-bob-y     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes ouija-bob-y-rev { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
  @keyframes ouija-bob-x     { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-6px)} }
  @keyframes ouija-bob-x-rev { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }
  @media (prefers-reduced-motion: reduce) { .ouija-pointer { animation: none; } }
  `;
  document.head.appendChild(el);
}

const ROT = { up: 270, down: 90, left: 180, right: 0 };

/**
 * Pointer — a glowing directional arrow that guides the eye from Ouija toward
 * the spotlighted element, with a gentle bob in its travel direction.
 */
export function Pointer({ direction = 'down', style, className = '', ...rest }) {
  return (
    <div className={`ouija-pointer ouija-pointer--${direction} ${className}`} style={style} aria-hidden="true" {...rest}>
      <svg viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${ROT[direction] || 0}deg)` }}>
        <path d="M4 12h13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="m12 6 6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
