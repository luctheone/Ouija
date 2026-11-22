import React from 'react';

const STYLE_ID = 'ouija-input-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .ouija-field { display: flex; flex-direction: column; gap: var(--space-2); font-family: var(--font-sans); }
  .ouija-field__label { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text-secondary); }
  .ouija-input-wrap {
    position: relative; display: flex; align-items: center;
    background: var(--glass-tint-soft);
    -webkit-backdrop-filter: var(--glass-blur);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-stroke);
    border-radius: var(--radius-md);
    box-shadow: var(--glass-highlight), var(--shadow-sm);
    transition: box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out);
  }
  .ouija-input-wrap:hover { background: var(--glass-tint); }
  .ouija-input-wrap--focus {
    border-color: var(--accent-300);
    background: var(--glass-tint-strong);
    box-shadow: var(--glass-highlight), var(--glow-focus);
  }
  .ouija-input-wrap--mono .ouija-input { font-family: var(--font-mono); font-size: var(--fs-mono); letter-spacing: 0; }
  .ouija-input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: var(--font-sans); font-size: var(--fs-body); font-weight: var(--fw-medium);
    color: var(--text-primary); padding: 0 var(--space-4); height: var(--control-h-lg); min-width: 0;
  }
  .ouija-input::placeholder { color: var(--text-muted); font-weight: var(--fw-medium); }
  .ouija-input__lead, .ouija-input__trail { display: inline-flex; align-items: center; color: var(--text-tertiary); }
  .ouija-input__lead { padding-left: var(--space-4); }
  .ouija-input__trail { padding-right: var(--space-3); }
  .ouija-input__trail svg, .ouija-input__lead svg { width: 18px; height: 18px; stroke-width: 1.75; }
  .ouija-input__copy {
    display: inline-flex; align-items: center; gap: 5px; cursor: pointer;
    border: none; background: transparent; color: var(--accent-600);
    font-family: var(--font-sans); font-size: var(--fs-sm); font-weight: var(--fw-semibold);
    padding: 5px 8px; border-radius: var(--radius-sm);
    transition: background var(--dur-fast) var(--ease-out);
  }
  .ouija-input__copy:hover { background: var(--accent-50); }
  `;
  document.head.appendChild(el);
}

/**
 * GlassInput — a frosted text field with a soft focus glow. Supports a label,
 * leading/trailing icons, a mono mode for IDs/keys, and a copy affordance.
 */
export function GlassInput({
  label,
  value,
  defaultValue,
  placeholder,
  mono = false,
  leadIcon = null,
  trailIcon = null,
  copyable = false,
  disabled = false,
  onChange,
  id,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const fieldId = id || React.useId();

  const handleCopy = () => {
    const text = value ?? defaultValue ?? '';
    try { navigator.clipboard && navigator.clipboard.writeText(String(text)); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="ouija-field">
      {label && <label className="ouija-field__label" htmlFor={fieldId}>{label}</label>}
      <div className={`ouija-input-wrap${focused ? ' ouija-input-wrap--focus' : ''}${mono ? ' ouija-input-wrap--mono' : ''}`}>
        {leadIcon && <span className="ouija-input__lead">{leadIcon}</span>}
        <input
          id={fieldId}
          className="ouija-input"
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {copyable && (
          <button type="button" className="ouija-input__copy" onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
        {!copyable && trailIcon && <span className="ouija-input__trail">{trailIcon}</span>}
      </div>
    </div>
  );
}
