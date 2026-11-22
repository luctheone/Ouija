import React from 'react';

const STYLE_ID = 'ouija-bubble-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .ouija-msg { display: flex; gap: var(--space-3); align-items: flex-end; font-family: var(--font-sans); max-width: 100%; }
  .ouija-msg--user { flex-direction: row-reverse; }

  .ouija-msg__avatar {
    flex: 0 0 auto; width: 28px; height: 28px; border-radius: var(--radius-pill);
    display: grid; place-items: center; color: var(--accent-600);
    background: var(--glass-tint-strong); border: 1px solid var(--glass-stroke);
    box-shadow: var(--glass-highlight), var(--glow-accent);
  }
  .ouija-msg__avatar svg { width: 16px; height: 16px; }

  .ouija-msg__bubble {
    position: relative; padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    font-size: var(--fs-body); font-weight: var(--fw-medium);
    line-height: var(--lh-normal); color: var(--text-primary);
    text-wrap: pretty;
    -webkit-backdrop-filter: var(--glass-blur);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-stroke);
    box-shadow: var(--glass-highlight), var(--shadow-sm);
  }
  /* agent guidance — frosted neutral, soft accent tint */
  .ouija-msg--guidance .ouija-msg__bubble { background: var(--glass-tint); border-bottom-left-radius: var(--radius-xs); }
  /* success — minty glow */
  .ouija-msg--success .ouija-msg__bubble {
    background: color-mix(in srgb, var(--success-500) 12%, rgba(255,255,255,0.7));
    color: var(--success-600); border-color: color-mix(in srgb, var(--success-500) 26%, white);
    box-shadow: var(--glass-highlight), var(--glow-success); border-bottom-left-radius: var(--radius-xs);
  }
  .ouija-msg--success .ouija-msg__avatar { color: var(--success-600); box-shadow: var(--glass-highlight), var(--glow-success); }
  /* user reply — solid accent, opposite side */
  .ouija-msg--user .ouija-msg__bubble {
    background: var(--accent-sheen), var(--fill-accent-grad); color: var(--text-on-accent);
    border-color: transparent; border-bottom-right-radius: var(--radius-xs);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), var(--shadow-sm), var(--shadow-accent);
    -webkit-backdrop-filter: none; backdrop-filter: none;
  }
  .ouija-msg__bubble b, .ouija-msg__bubble strong { font-weight: var(--fw-bold); }

  @keyframes ouija-bubble-in {
    from { transform: translateY(8px) scale(0.94); }
    to   { transform: translateY(0) scale(1); }
  }
  .ouija-msg--animate .ouija-msg__bubble,
  .ouija-msg--animate .ouija-msg__avatar {
    animation: ouija-bubble-in var(--dur-base) var(--spring-soft);
  }
  @media (prefers-reduced-motion: reduce) {
    .ouija-msg--animate .ouija-msg__bubble, .ouija-msg--animate .ouija-msg__avatar { animation: none; }
  }
  `;
  document.head.appendChild(el);
}

const Spark = () => (
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 6C33.2 16.8 38.2 24.5 47.6 27.4C50.8 28.4 50.8 35.6 47.6 36.6C38.2 39.5 33.2 47.2 32 58C30.8 47.2 25.8 39.5 16.4 36.6C13.2 35.6 13.2 28.4 16.4 27.4C25.8 24.5 30.8 16.8 32 6Z" fill="currentColor"/>
  </svg>
);

/**
 * MessageBubble — how Ouija speaks. A glassy, soft, friendly bubble. Use
 * `guidance` for instructions, `success` for confirmations, `user` for the
 * person's replies. `html` lets you bold the exact on-page label to click.
 */
export function MessageBubble({
  children,
  html,
  variant = 'guidance',
  avatar = true,
  animate = false,
}) {
  const showAvatar = avatar && variant !== 'user';
  return (
    <div className={`ouija-msg ouija-msg--${variant}${animate ? ' ouija-msg--animate' : ''}`}>
      {showAvatar && <div className="ouija-msg__avatar"><Spark /></div>}
      <div
        className="ouija-msg__bubble"
        {...(html ? { dangerouslySetInnerHTML: { __html: html } } : {})}
      >
        {html ? null : children}
      </div>
    </div>
  );
}
