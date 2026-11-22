import React from 'react';

const STYLE_ID = 'ouija-badge-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .ouija-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-sans); font-size: var(--fs-xs); font-weight: var(--fw-bold);
    letter-spacing: 0.01em; line-height: 1; white-space: nowrap;
    padding: 5px 10px; border-radius: var(--radius-pill);
    border: 1px solid transparent;
  }
  .ouija-badge svg { width: 13px; height: 13px; stroke-width: 2.25; }
  .ouija-badge--neutral { background: var(--glass-tint-soft); color: var(--text-secondary);
    border-color: var(--glass-stroke); box-shadow: var(--glass-highlight); -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur); }
  .ouija-badge--accent { background: var(--accent-50); color: var(--accent-700); border-color: var(--accent-100); }
  .ouija-badge--success { background: color-mix(in srgb, var(--success-500) 14%, white); color: var(--success-600); border-color: color-mix(in srgb, var(--success-500) 26%, white); }
  .ouija-badge--warn { background: color-mix(in srgb, var(--warn-500) 16%, white); color: #9a6a13; border-color: color-mix(in srgb, var(--warn-500) 30%, white); }
  .ouija-badge__dot { width: 6px; height: 6px; border-radius: var(--radius-pill); background: currentColor; }
  `;
  document.head.appendChild(el);
}

/**
 * Badge — a small status pill (step label, connection status, a count).
 * Calm by default; the accent/success variants carry meaning, used sparingly.
 */
export function Badge({
  children,
  variant = 'neutral',
  icon = null,
  dot = false,
}) {
  return (
    <span className={`ouija-badge ouija-badge--${variant}`}>
      {dot && <span className="ouija-badge__dot" />}
      {icon}
      {children}
    </span>
  );
}
