/* @ds-bundle: {"format":3,"namespace":"OuijaDesignSystem_93fedd","components":[{"name":"Button","sourcePath":"components/controls/Button.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"ProgressDots","sourcePath":"components/feedback/ProgressDots.jsx"},{"name":"GlassInput","sourcePath":"components/forms/GlassInput.jsx"},{"name":"Coachmark","sourcePath":"components/overlay/Coachmark.jsx"},{"name":"Pointer","sourcePath":"components/overlay/Pointer.jsx"},{"name":"Spotlight","sourcePath":"components/overlay/Spotlight.jsx"},{"name":"MessageBubble","sourcePath":"components/surfaces/MessageBubble.jsx"},{"name":"SidebarPanel","sourcePath":"components/surfaces/SidebarPanel.jsx"},{"name":"HostPage","sourcePath":"ui_kits/extension/HostPage.jsx"},{"name":"OuijaExtension","sourcePath":"ui_kits/extension/OuijaExtension.jsx"}],"sourceHashes":{"components/controls/Button.jsx":"94d4b07b8fe4","components/feedback/Badge.jsx":"fbc8d8fda986","components/feedback/ProgressDots.jsx":"7bf87b1eb83e","components/forms/GlassInput.jsx":"ede095f88b61","components/overlay/Coachmark.jsx":"38e2946666d3","components/overlay/Pointer.jsx":"004ac8de0d3a","components/overlay/Spotlight.jsx":"36f63ba4f6b5","components/surfaces/MessageBubble.jsx":"18eaa6a52b0b","components/surfaces/SidebarPanel.jsx":"404ffe0e683f","explorations/design-canvas.jsx":"bd8746af6e58","ui_kits/extension/HostPage.jsx":"64fa9b35f3c2","ui_kits/extension/OuijaExtension.jsx":"80bc0d22c1ac"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.OuijaDesignSystem_93fedd = window.OuijaDesignSystem_93fedd || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/controls/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Button({
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
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: `ouija-btn ouija-btn--${variant} ouija-btn--${size}`,
    disabled: disabled,
    onClick: onClick,
    style: style
  }, rest), iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "ouija-btn__icon"
  }, iconLeft), children, iconRight && /*#__PURE__*/React.createElement("span", {
    className: "ouija-btn__icon"
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Button.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
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
function Badge({
  children,
  variant = 'neutral',
  icon = null,
  dot = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `ouija-badge ouija-badge--${variant}`
  }, dot && /*#__PURE__*/React.createElement("span", {
    className: "ouija-badge__dot"
  }), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressDots.jsx
try { (() => {
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
function ProgressDots({
  total = 6,
  current = 1,
  variant = 'dots',
  showLabel = true,
  labelFormat
}) {
  const label = labelFormat ? labelFormat(current, total) : `Step ${current} of ${total}`;
  return /*#__PURE__*/React.createElement("div", {
    className: "ouija-progress"
  }, variant === 'bar' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "ouija-progress__bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ouija-progress__fill",
    style: {
      width: `${Math.max(0, Math.min(1, current / total)) * 100}%`
    }
  })), showLabel && /*#__PURE__*/React.createElement("span", {
    className: "ouija-progress__label"
  }, label)) : /*#__PURE__*/React.createElement(React.Fragment, null, showLabel && /*#__PURE__*/React.createElement("span", {
    className: "ouija-progress__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "ouija-progress__dots"
  }, Array.from({
    length: total
  }).map((_, i) => {
    const n = i + 1;
    const cls = n < current ? 'ouija-dot--done' : n === current ? 'ouija-dot--current' : '';
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: `ouija-dot ${cls}`
    });
  }))));
}
Object.assign(__ds_scope, { ProgressDots });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressDots.jsx", error: String((e && e.message) || e) }); }

// components/forms/GlassInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function GlassInput({
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
    try {
      navigator.clipboard && navigator.clipboard.writeText(String(text));
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ouija-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "ouija-field__label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("div", {
    className: `ouija-input-wrap${focused ? ' ouija-input-wrap--focus' : ''}${mono ? ' ouija-input-wrap--mono' : ''}`
  }, leadIcon && /*#__PURE__*/React.createElement("span", {
    className: "ouija-input__lead"
  }, leadIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    className: "ouija-input",
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false)
  }, rest)), copyable && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ouija-input__copy",
    onClick: handleCopy
  }, copied ? 'Copied' : 'Copy'), !copyable && trailIcon && /*#__PURE__*/React.createElement("span", {
    className: "ouija-input__trail"
  }, trailIcon)));
}
Object.assign(__ds_scope, { GlassInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/GlassInput.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Coachmark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
const CopyIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("rect", {
  x: "9",
  y: "9",
  width: "11",
  height: "11",
  rx: "2.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 15V5a2 2 0 0 1 2-2h8"
}));
const CheckIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "m20 7-11 11-5-5"
}));

/**
 * Coachmark — a small glassy label that sits *beside* the spotlighted element
 * with a short instruction and an optional copy-to-clipboard chip (for pasting
 * a Pixel ID, key, or domain between sites). A little tail points at the target.
 */
function Coachmark({
  children,
  html,
  arrow = 'up',
  copyValue,
  copyLabel = 'Copy',
  animate = true,
  style,
  className = ''
}) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    try {
      navigator.clipboard && navigator.clipboard.writeText(String(copyValue));
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `ouija-coach ouija-coach--${arrow}${animate ? ' ouija-coach--animate' : ''} ${className}`,
    style: style
  }, /*#__PURE__*/React.createElement("span", {
    className: "ouija-coach__tail",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", _extends({
    className: "ouija-coach__text"
  }, html ? {
    dangerouslySetInnerHTML: {
      __html: html
    }
  } : {}), html ? null : children), copyValue != null && /*#__PURE__*/React.createElement("div", {
    className: "ouija-coach__copy"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ouija-coach__val"
  }, copyValue), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ouija-coach__btn",
    onClick: handleCopy
  }, copied ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CheckIcon, null), " Copied") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CopyIcon, null), " ", copyLabel))));
}
Object.assign(__ds_scope, { Coachmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Coachmark.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Pointer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
const ROT = {
  up: 270,
  down: 90,
  left: 180,
  right: 0
};

/**
 * Pointer — a glowing directional arrow that guides the eye from Ouija toward
 * the spotlighted element, with a gentle bob in its travel direction.
 */
function Pointer({
  direction = 'down',
  style,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `ouija-pointer ouija-pointer--${direction} ${className}`,
    style: style,
    "aria-hidden": "true"
  }, rest), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      transform: `rotate(${ROT[direction] || 0}deg)`
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 12h13",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m12 6 6 6-6 6",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })));
}
Object.assign(__ds_scope, { Pointer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Pointer.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Spotlight.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Spotlight({
  radius,
  animate = true,
  style,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `ouija-spotlight${animate ? ' ouija-spotlight--animate' : ''} ${className}`,
    style: {
      ...(radius != null ? {
        borderRadius: radius
      } : {}),
      ...style
    },
    "aria-hidden": "true"
  }, rest));
}
Object.assign(__ds_scope, { Spotlight });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Spotlight.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/MessageBubble.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
const Spark = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M32 6C33.2 16.8 38.2 24.5 47.6 27.4C50.8 28.4 50.8 35.6 47.6 36.6C38.2 39.5 33.2 47.2 32 58C30.8 47.2 25.8 39.5 16.4 36.6C13.2 35.6 13.2 28.4 16.4 27.4C25.8 24.5 30.8 16.8 32 6Z",
  fill: "currentColor"
}));

/**
 * MessageBubble — how Ouija speaks. A glassy, soft, friendly bubble. Use
 * `guidance` for instructions, `success` for confirmations, `user` for the
 * person's replies. `html` lets you bold the exact on-page label to click.
 */
function MessageBubble({
  children,
  html,
  variant = 'guidance',
  avatar = true,
  animate = false
}) {
  const showAvatar = avatar && variant !== 'user';
  return /*#__PURE__*/React.createElement("div", {
    className: `ouija-msg ouija-msg--${variant}${animate ? ' ouija-msg--animate' : ''}`
  }, showAvatar && /*#__PURE__*/React.createElement("div", {
    className: "ouija-msg__avatar"
  }, /*#__PURE__*/React.createElement(Spark, null)), /*#__PURE__*/React.createElement("div", _extends({
    className: "ouija-msg__bubble"
  }, html ? {
    dangerouslySetInnerHTML: {
      __html: html
    }
  } : {}), html ? null : children));
}
Object.assign(__ds_scope, { MessageBubble });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/MessageBubble.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/SidebarPanel.jsx
try { (() => {
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
const Spark = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M32 6C33.2 16.8 38.2 24.5 47.6 27.4C50.8 28.4 50.8 35.6 47.6 36.6C38.2 39.5 33.2 47.2 32 58C30.8 47.2 25.8 39.5 16.4 36.6C13.2 35.6 13.2 28.4 16.4 27.4C25.8 24.5 30.8 16.8 32 6Z",
  fill: "currentColor"
}));
const MinIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14"
}));
const ArrowIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.4",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14"
}), /*#__PURE__*/React.createElement("path", {
  d: "m13 6 6 6-6 6"
}));

/* ── Node progress (inline — Reliquary aesthetic) ─────── */
function NodeProgress({
  step,
  total
}) {
  const nodes = Array.from({
    length: total
  }, (_, i) => {
    const idx = i + 1;
    if (idx < step) return 'done';
    if (idx === step) return 'now';
    return 'future';
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "ouija-sp__progress",
    role: "progressbar",
    "aria-valuenow": step,
    "aria-valuemax": total,
    "aria-label": `Step ${step} of ${total}`
  }, nodes.map((state, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    className: "ouija-nd-seg"
  }), /*#__PURE__*/React.createElement("div", {
    className: `ouija-nd ouija-nd--${state}`
  }))), /*#__PURE__*/React.createElement("span", {
    className: "ouija-sp__step-lbl"
  }, "Step ", step));
}

/**
 * SidebarPanel — Ouija's main floating surface.
 * Reliquary aesthetic: dark inverted glass, amber glint border,
 * Instrument Serif italic name, node-based progress.
 *
 * The panel inherits its accent color from --ouija-h / --ouija-c,
 * which the host-detector sets at runtime. No fixed brand color.
 */
function SidebarPanel({
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
  style
}) {
  if (collapsed) {
    return /*#__PURE__*/React.createElement("div", {
      className: "ouija-sp-root"
    }, /*#__PURE__*/React.createElement("button", {
      className: "ouija-sp-orb",
      onClick: onExpand,
      "aria-label": `Open Ouija — Step ${step} of ${totalSteps}`,
      style: style
    }, /*#__PURE__*/React.createElement("span", {
      className: "ouija-sp-orb__mark"
    }, /*#__PURE__*/React.createElement(Spark, null)), /*#__PURE__*/React.createElement("span", {
      className: "ouija-sp-orb__label"
    }, step, " of ", totalSteps)));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "ouija-sp-root"
  }, /*#__PURE__*/React.createElement("div", {
    className: `ouija-sp${animate ? ' ouija-sp--animate' : ''}`,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "ouija-sp__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ouija-sp__mark"
  }, /*#__PURE__*/React.createElement(Spark, null)), /*#__PURE__*/React.createElement("span", {
    className: "ouija-sp__id"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ouija-sp__name"
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    className: "ouija-sp__sub"
  }, subtitle)), /*#__PURE__*/React.createElement("button", {
    className: "ouija-sp__min",
    onClick: onCollapse,
    "aria-label": "Minimize"
  }, /*#__PURE__*/React.createElement(MinIcon, null))), showProgress && /*#__PURE__*/React.createElement(NodeProgress, {
    step: step,
    total: totalSteps
  }), /*#__PURE__*/React.createElement("div", {
    className: "ouija-sp__body"
  }, children, thinking && /*#__PURE__*/React.createElement("div", {
    className: "ouija-sp__think",
    "aria-label": "Ouija is thinking"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null))), /*#__PURE__*/React.createElement("div", {
    className: "ouija-sp__foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ouija-sp__cta",
    onClick: onAdvance
  }, advanceLabel, /*#__PURE__*/React.createElement(ArrowIcon, null)))));
}
Object.assign(__ds_scope, { SidebarPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/SidebarPanel.jsx", error: String((e && e.message) || e) }); }

// explorations/design-canvas.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Exports (to window): DesignCanvas, DCSection, DCArtboard, DCPostIt.
// Artboards are reorderable (grip-drag), deletable, labels/titles are
// inline-editable, and any artboard can be opened in a fullscreen focus
// overlay (←/→/Esc). State persists to a .design-canvas.state.json sidecar
// via the host bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>
//
// Artboards are static design frames, not scroll regions — never use
// height: 100% + overflow: auto/scroll on inner elements; size each artboard
// to fit its content (explicit pixel height, or let it grow).
/* END USAGE */

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
  // isolation:isolate contains artboard content's z-indexes so a
  // z-indexed child (sticky navbar etc.) can't paint over .dc-header or
  // the .dc-menu popover that drops into the top of the card.
  '.dc-card{isolation:isolate;transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}',
  // Per-artboard header: grip + label on the left, delete/expand on the
  // right. Single flex row; when the artboard's on-screen width is too
  // narrow for both the label yields (ellipsis, then hidden entirely below
  // ~4ch via the container query) and the buttons stay on the row.
  '.dc-header{position:absolute;bottom:100%;left:-4px;margin-bottom:calc(4px * var(--dc-inv-zoom,1));z-index:2;', '  display:flex;align-items:center;container-type:inline-size}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px;flex:1 1 auto;min-width:0}', '.dc-grip{flex:0 0 auto;cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s,opacity .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{flex:1 1 auto;min-width:0;cursor:pointer;border-radius:4px;padding:3px 6px;', '  display:flex;align-items:center;transition:background .12s;overflow:hidden}',
  // Below ~4ch of label room: hide the label entirely, and drop the grip to
  // hover-only (same reveal rule as .dc-btns) so a narrow header is clean
  // until the card is moused.
  '@container (max-width: 110px){', '  .dc-labeltext{display:none}', '  .dc-grip{opacity:0}', '  [data-dc-slot]:hover .dc-grip{opacity:1}', '}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-labeltext .dc-editable{overflow:hidden;text-overflow:ellipsis;max-width:100%}', '.dc-labeltext .dc-editable:focus{overflow:visible;text-overflow:clip}', '.dc-btns{flex:0 0 auto;margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .12s}', '[data-dc-slot]:hover .dc-btns,.dc-btns:has(.dc-menu){opacity:1}', '.dc-expand,.dc-kebab{width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center;', '  font:inherit;transition:background .12s,color .12s}', '.dc-expand:hover,.dc-kebab:hover{background:rgba(0,0,0,.06);color:#2a251f}',
  // Slot hosting an open menu floats above later siblings (which otherwise
  // paint on top — same z-index:auto, later DOM order) so the popup isn't
  // clipped by the next card.
  '[data-dc-slot]:has(.dc-menu){z-index:10}', '.dc-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border-radius:8px;', '  box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.05);padding:4px;min-width:160px;z-index:10}', '.dc-menu button{display:block;width:100%;padding:7px 10px;border:0;background:transparent;', '  border-radius:5px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;', '  color:#29261b;cursor:pointer;text-align:left;transition:background .12s;white-space:nowrap}', '.dc-menu button:hover{background:rgba(0,0,0,.05)}', '.dc-menu hr{border:0;border-top:1px solid rgba(0,0,0,.08);margin:4px 2px}', '.dc-menu .dc-danger{color:#c96442}', '.dc-menu .dc-danger:hover{background:rgba(201,100,66,.1)}',
  // Chrome (titles / labels / buttons) counter-scales against the viewport
  // zoom so it stays a constant on-screen size. --dc-inv-zoom is set by
  // DCViewport on every transform update and inherits to all descendants —
  // any overlay inside the world (e.g. a TweaksPanel on an artboard) can use
  // it the same way.
  //
  // The header uses transform:scale (out-of-flow, so layout impact doesn't
  // matter) with its world-space width set to card-width / inv-zoom so that
  // after counter-scaling its on-screen width exactly matches the card's —
  // that's what lets the container query + text-overflow behave against the
  // card's visible edge at every zoom level.
  //
  // The section head uses CSS zoom instead of transform so its layout box
  // grows with the counter-scale, pushing the card row down — otherwise the
  // constant-screen-size title would overflow into the (shrinking) world-
  // space gap and overlap the artboard headers at low zoom.
  '.dc-header{width:calc((100% + 4px) / var(--dc-inv-zoom,1));', '  transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom left}', '.dc-sectionhead{zoom:var(--dc-inv-zoom,1)}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// Recursively unwrap React.Fragment so <>…</> grouping doesn't hide
// DCSection/DCArtboard children from the type-based walks below.
function dcFlatten(children) {
  const out = [];
  React.Children.forEach(children, c => {
    if (c && c.type === React.Fragment) out.push(...dcFlatten(c.props.children));else out.push(c);
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, hidden
// artboards, focused artboard). Order/titles/labels/hidden persist to a
// .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Fragments are flattened; wrapping in other
  // elements still opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  dcFlatten(children).forEach(sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const abs = [];
    dcFlatten(sec.props.children).forEach(ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (aid) abs.push([aid, ab]);
    });
    // hidden is scoped to one source revision — when the agent regenerates
    // (artboard-ID set changes), prior deletes don't apply to new content.
    const srcKey = abs.map(([k]) => k).join('\x1f');
    const hidden = persisted.srcKey === srcKey ? persisted.hidden || [] : [];
    const srcIds = [];
    abs.forEach(([aid, ab]) => {
      if (hidden.includes(aid)) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  // Persist viewport across reloads so the user lands back where they were
  // after an agent edit or browser refresh. The sandbox origin is already
  // per-project; pathname keeps multiple canvas files in one project apart.
  const tfKey = 'dc-viewport:' + location.pathname;
  const saveT = React.useRef(0);
  const lastPostedScale = React.useRef();
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    // Exposed for zoom-invariant chrome (labels, buttons, TweaksPanel).
    el.style.setProperty('--dc-inv-zoom', String(1 / scale));
    // Keep the host toolbar's % readout in sync with the canvas scale. Pan
    // ticks leave scale unchanged — skip the cross-frame post for those.
    if (lastPostedScale.current !== scale) {
      lastPostedScale.current = scale;
      window.parent.postMessage({
        type: '__dc_zoom',
        scale
      }, '*');
    }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    }, 200);
  }, [tfKey]);
  React.useLayoutEffect(() => {
    const flush = () => {
      clearTimeout(saveT.current);
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    };
    try {
      const s = JSON.parse(localStorage.getItem(tfKey) || 'null');
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
        tf.current = {
          x: s.x,
          y: s.y,
          scale: Math.min(maxScale, Math.max(minScale, s.scale))
        };
        apply();
      }
    } catch {}
    // Flush on pagehide and unmount so a reload within the 200ms debounce
    // window doesn't drop the last pan/zoom.
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // --dc-inv-zoom consumers (.dc-sectionhead's CSS zoom, each section's
      // marginBottom) reflow on every scale change, vertically shifting the
      // world layout — so a world point mathematically pinned under the cursor
      // drifts as you zoom (content creeps up on zoom-in, down on zoom-out).
      // Anchor the DOM element under the cursor instead: record its screen Y,
      // apply the transform + --dc-inv-zoom, then cancel whatever vertical
      // drift the reflow introduced so it stays put on screen.
      let marker = null,
        markerY0 = 0;
      if (k !== 1) {
        const hit = document.elementFromPoint(cx, cy);
        marker = hit && hit.closest ? hit.closest('[data-dc-slot],[data-dc-section]') : null;
        if (marker) markerY0 = marker.getBoundingClientRect().top;
      }
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
      if (marker) {
        // A pure zoom around (cx, cy) maps screen Y → cy + (Y - cy) * k. Any
        // departure after the --dc-inv-zoom reflow is the layout drift.
        const drift = marker.getBoundingClientRect().top - (cy + (markerY0 - cy) * k);
        if (Math.abs(drift) > 0.1) {
          t.y -= drift;
          apply();
        }
      }
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
        // trackpad pinch, or ctrl/cmd + smooth-scroll mouse. Notched
        // wheels fall through to the fixed-step branch below.
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    // Host-driven zoom (toolbar % menu). Zooms around viewport centre so the
    // visible midpoint stays fixed — matching the host's iframe-zoom feel.
    const onHostMsg = e => {
      const d = e.data;
      if (d && d.type === '__dc_set_zoom' && typeof d.scale === 'number') {
        const r = vp.getBoundingClientRect();
        zoomAt(r.left + r.width / 2, r.top + r.height / 2, d.scale / tf.current.scale);
      } else if (d && d.type === '__dc_probe') {
        // Host's [readyGen] reset asks whether a canvas is present; it
        // fires on the iframe's native 'load', which for canvases with
        // images/fonts is after our mount-time announce, so re-announce.
        // Clear the pan-tick guard so apply() re-posts the current scale
        // even if it's unchanged — the host just reset dcScale to 1.
        window.parent.postMessage({
          type: '__dc_present'
        }, '*');
        lastPostedScale.current = undefined;
        apply();
      }
    };
    window.addEventListener('message', onHostMsg);
    // Announce canvas mode so the host toolbar proxies its % control here
    // instead of scaling the iframe element (which would just shrink the
    // viewport window of an infinite canvas). The apply() that follows emits
    // the initial __dc_zoom so the toolbar % is correct before first pinch.
    // lastPostedScale reset mirrors the __dc_probe handler: the layout
    // effect's restore-path apply() may already have posted the restored
    // scale (before __dc_present), so clear the guard to re-post it in order.
    window.parent.postMessage({
      type: '__dc_present'
    }, '*');
    lastPostedScale.current = undefined;
    apply();
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('message', onHostMsg);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(dcFlatten(children));
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const sec = ctx && sid && ctx.section(sid) || {};
  // Must match DesignCanvas's srcKey computation exactly (it filters falsy
  // IDs), or onDelete persists a srcKey that DesignCanvas never recognizes.
  const allIds = artboards.map(a => a.props.id ?? a.props.label).filter(Boolean);
  const srcKey = allIds.join('\x1f');
  const hidden = sec.srcKey === srcKey ? sec.hidden || [] : [];
  const srcOrder = allIds.filter(k => !hidden.includes(k));
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));

  // marginBottom counter-scales so the on-screen gap between sections stays
  // constant — otherwise at low zoom the (world-space) gap collapses while
  // the screen-constant sectionhead below it doesn't, and the title reads as
  // belonging to the section above. paddingBottom below is just enough for
  // the 24px artboard-header (abs-positioned above each card) plus ~8px, so
  // the title sits tight against its own row at every zoom.
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 'calc(80px * var(--dc-inv-zoom, 1))',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-sectionhead",
    style: {
      paddingBottom: 36
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onDelete: () => ctx && ctx.patchSection(sid, x => ({
      hidden: [...(x.srcKey === srcKey ? x.hidden || [] : []), k],
      srcKey
    })),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}

// Per-artboard export (kind: 'png' | 'html'). Both paths share the same
// self-contained clone: computed styles baked in, @font-face / <img> /
// inline-style background-image urls inlined as data URIs. PNG wraps the
// clone in foreignObject→canvas at 3× the artboard's natural width×height
// (same pipeline the host uses for page captures); HTML wraps it in a
// minimal standalone document. Both are independent of viewport zoom.
async function dcExport(node, w, h, name, kind) {
  try {
    await document.fonts.ready;
  } catch {}
  const toDataURL = url => fetch(url).then(r => r.blob()).then(b => new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => res(url);
    fr.readAsDataURL(b);
  })).catch(() => url);

  // Collect @font-face rules. ss.cssRules throws SecurityError on
  // cross-origin sheets (e.g. fonts.googleapis.com) — in that case fetch
  // the CSS text directly (those endpoints send ACAO:*) and regex-extract
  // the blocks. @import and @media/@supports are walked so nested
  // @font-face rules aren't missed.
  const fontRules = [],
    pending = [],
    seen = new Set();
  const scrapeCss = href => {
    if (seen.has(href)) return;
    seen.add(href);
    pending.push(fetch(href).then(r => r.text()).then(css => {
      for (const m of css.match(/@font-face\s*{[^}]*}/g) || []) fontRules.push({
        css: m,
        base: href
      });
      for (const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g)) scrapeCss(new URL(m[1], href).href);
    }).catch(() => {}));
  };
  const walk = (rules, base) => {
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) fontRules.push({
        css: r.cssText,
        base
      });else if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
        const ibase = r.styleSheet.href || base;
        try {
          walk(r.styleSheet.cssRules, ibase);
        } catch {
          scrapeCss(ibase);
        }
      } else if (r.cssRules) walk(r.cssRules, base);
    }
  };
  for (const ss of document.styleSheets) {
    const base = ss.href || location.href;
    try {
      walk(ss.cssRules, base);
    } catch {
      if (ss.href) scrapeCss(ss.href);
    }
  }
  while (pending.length) await pending.shift();
  const fontCss = (await Promise.all(fontRules.map(async rule => {
    let out = rule.css,
      m;
    const re = /url\((['"]?)([^'")]+)\1\)/g;
    while (m = re.exec(rule.css)) {
      if (m[2].indexOf('data:') === 0) continue;
      let abs;
      try {
        abs = new URL(m[2], rule.base).href;
      } catch {
        continue;
      }
      out = out.split(m[0]).join('url("' + (await toDataURL(abs)) + '")');
    }
    return out;
  }))).join('\n');
  const cloneStyled = src => {
    if (src.nodeType === 8 || src.nodeType === 1 && src.tagName === 'SCRIPT') return document.createTextNode('');
    const dst = src.cloneNode(false);
    if (src.nodeType === 1) {
      const cs = getComputedStyle(src);
      let txt = '';
      for (let i = 0; i < cs.length; i++) txt += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';';
      dst.setAttribute('style', txt + 'animation:none;transition:none;');
      if (src.tagName === 'CANVAS') try {
        const im = document.createElement('img');
        im.src = src.toDataURL();
        im.setAttribute('style', txt);
        return im;
      } catch {}
    }
    for (let c = src.firstChild; c; c = c.nextSibling) dst.appendChild(cloneStyled(c));
    return dst;
  };
  const clone = cloneStyled(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  // Drop the card's own shadow/radius so the export is a flush w×h rect;
  // the artboard's own background (if any) is already in the computed style.
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  const jobs = [];
  clone.querySelectorAll('img').forEach(el => {
    const s = el.getAttribute('src');
    if (s && s.indexOf('data:') !== 0) jobs.push(toDataURL(el.src).then(d => el.setAttribute('src', d)));
  });
  [clone, ...clone.querySelectorAll('*')].forEach(el => {
    const bg = el.style.backgroundImage;
    if (!bg) return;
    let m;
    const re = /url\(["']?([^"')]+)["']?\)/g;
    while (m = re.exec(bg)) {
      const tok = m[0],
        url = m[1];
      if (url.indexOf('data:') === 0) continue;
      jobs.push(toDataURL(url).then(d => {
        el.style.backgroundImage = el.style.backgroundImage.split(tok).join('url("' + d + '")');
      }));
    }
  });
  await Promise.all(jobs);
  const xml = new XMLSerializer().serializeToString(clone);
  const save = (blob, ext) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.' + ext;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  if (kind === 'html') {
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + name + '</title>' + (fontCss ? '<style>' + fontCss + '</style>' : '') + '</head><body style="margin:0">' + xml + '</body></html>';
    return save(new Blob([html], {
      type: 'text/html'
    }), 'html');
  }

  // PNG: the SVG's own width/height must be the output resolution — an
  // <img>-loaded SVG rasterizes at its intrinsic size, so sizing it at 1×
  // and ctx.scale()-ing up would just upscale a 1× bitmap. viewBox maps the
  // w×h foreignObject onto the px·w × px·h SVG canvas so the browser renders
  // the HTML at full resolution.
  const px = 3;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px + '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject width="' + w + '" height="' + h + '">' + (fontCss ? '<style><![CDATA[' + fontCss + ']]></style>' : '') + xml + '</foreignObject></svg>';
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error('svg load failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = w * px;
  cv.height = h * px;
  cv.getContext('2d').drawImage(img, 0, 0);
  cv.toBlob(blob => save(blob, 'png'), 'image/png');
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus,
  onDelete
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);
  const cardRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  // ⋯ menu: close on any outside pointerdown. Two-click delete lives inside
  // the menu — first click arms the row, second commits; closing disarms.
  React.useEffect(() => {
    if (!menuOpen) {
      setConfirming(false);
      return;
    }
    const off = e => {
      if (!menuRef.current || !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [menuOpen]);
  const doExport = kind => {
    setMenuOpen(false);
    if (!cardRef.current) return;
    const name = String(label || id || 'artboard').replace(/[^\w\s.-]+/g, '_');
    dcExport(cardRef.current, width, height, name, kind).catch(e => console.error('[design-canvas] export failed:', e));
  };

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-header",
    "data-omelette-chrome": "",
    style: {
      color: DC.label
    },
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-btns"
  }, /*#__PURE__*/React.createElement("div", {
    ref: menuRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dc-kebab",
    title: "More",
    onClick: () => setMenuOpen(o => !o)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2.5",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.5",
    cy: "6",
    r: "1.1"
  }))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "dc-menu",
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('png')
  }, "Download PNG"), /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('html')
  }, "Download HTML"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("button", {
    className: "dc-danger",
    onClick: () => {
      if (confirming) {
        setMenuOpen(false);
        onDelete();
      } else setConfirming(true);
    }
  }, confirming ? 'Click again to delete' : 'Delete'))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))))), /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    // Sections whose artboards are all deleted have slotIds:[] — step past
    // them to the next non-empty section so ↑/↓ doesn't dead-end.
    const n = sectionOrder.length;
    for (let i = 1; i < n; i++) {
      const ns = sectionOrder[((secIdx + d * i) % n + n) % n];
      const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
      if (first) {
        ctx.setFocus(`${ns}/${first}`);
        return;
      }
    }
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.filter(sid => sectionMeta[sid].slotIds.length).map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "explorations/design-canvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/extension/HostPage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Generic, made-up third-party host sites the user is being guided through.
   Intentionally NOT a recreation of any real product — Ouija is brand-neutral
   and must sit on top of *anything*. Two looks: a store admin and an ads manager. */

const STYLE_ID = 'ouija-host-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .host { position: absolute; inset: 0; display: grid; grid-template-columns: 232px 1fr;
    font-family: 'Manrope', system-ui, sans-serif; background: #f3f4f7; color: #3a3f4b; overflow: hidden; }
  .host__nav { background: #fff; border-right: 1px solid #e8eaef; padding: 20px 16px; display: flex; flex-direction: column; gap: 4px; }
  .host__brand { display:flex; align-items:center; gap:10px; padding: 4px 8px 18px; font-weight: 800; font-size: 16px; color:#1f2430; }
  .host__brand .logo { width: 26px; height: 26px; border-radius: 8px; display:grid; place-items:center; color:#fff; font-size:14px; }
  .host__navitem { display:flex; align-items:center; gap:11px; padding: 9px 11px; border-radius: 9px; font-size: 14px; font-weight: 600; color:#5b6170; cursor: default; }
  .host__navitem .ic { width:18px;height:18px; opacity:.7; }
  .host__navitem.active { background:#eef1f8; color:#1f2430; }
  .host__navitem .dot { width:7px;height:7px;border-radius:50%;background:#cfd5e0;margin-left:auto; }

  .host__main { padding: 26px 34px; overflow: hidden; }
  .host__top { display:flex; align-items:center; justify-content:space-between; margin-bottom: 24px; }
  .host__h1 { font-size: 24px; font-weight: 800; color:#1f2430; letter-spacing:-0.02em; }
  .host__crumb { font-size:13px; color:#8a91a0; font-weight:600; }
  .host__actions { display:flex; gap:10px; }
  .host__btn { border:none; border-radius:9px; font-family:inherit; font-weight:700; font-size:13.5px; padding:9px 16px; cursor:default; }
  .host__btn--ghost { background:#fff; color:#5b6170; border:1px solid #e2e5ec; }

  .host__grid { display:grid; grid-template-columns: 1fr 1fr; gap:18px; }
  .host__card { background:#fff; border:1px solid #e8eaef; border-radius:14px; padding:20px; }
  .host__card h3 { margin:0 0 6px; font-size:15px; font-weight:700; color:#1f2430; }
  .host__card p { margin:0; font-size:13px; color:#8a91a0; line-height:1.5; }
  .host__stat { font-size:30px; font-weight:800; color:#1f2430; margin-top:10px; letter-spacing:-0.02em; }
  .host__skel { height:11px;background:#edeef2;border-radius:6px;margin-top:10px;}
  .host__skel.s2{width:70%}

  /* ads-manager skin */
  .host--ads { background:#f5f6f8; }
  .host--ads .host__nav { background:#101522; border-right-color:#1c2436; }
  .host--ads .host__brand { color:#fff; }
  .host--ads .host__navitem { color:#9aa3b8; }
  .host--ads .host__navitem.active { background:#1b2334; color:#fff; }
  .host--ads .host__navitem .dot { background:#3a455e; }
  `;
  document.head.appendChild(el);
}
const Box = p => /*#__PURE__*/React.createElement("svg", _extends({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.9",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "ic"
}, p));
function HostPage({
  site = 'store',
  activeNav,
  targets = {}
}) {
  const isAds = site === 'ads';
  const nav = isAds ? ['Overview', 'Campaigns', 'Audiences', 'Data sources', 'Settings'] : ['Home', 'Orders', 'Products', 'Customers', 'Settings'];
  const reg = id => node => {
    if (node) targets[id] = node;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `host ${isAds ? 'host--ads' : ''}`
  }, /*#__PURE__*/React.createElement("aside", {
    className: "host__nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "host__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "logo",
    style: {
      background: isAds ? '#5b8cff' : '#1f9e78'
    }
  }, isAds ? 'B' : 'N'), isAds ? 'Beacon Ads' : 'Northwind'), nav.map(label => {
    const active = label === activeNav;
    const isTarget = isAds && label === 'Data sources' || !isAds && label === 'Settings';
    return /*#__PURE__*/React.createElement("div", {
      key: label,
      ref: isTarget ? reg('nav') : null,
      className: `host__navitem ${active ? 'active' : ''}`
    }, /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "4"
    })), label, active && /*#__PURE__*/React.createElement("span", {
      className: "dot",
      style: {
        background: '#7174ee'
      }
    }));
  })), /*#__PURE__*/React.createElement("main", {
    className: "host__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "host__top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "host__crumb"
  }, isAds ? 'Beacon Ads' : 'Northwind', " \xB7 ", activeNav), /*#__PURE__*/React.createElement("div", {
    className: "host__h1"
  }, isAds ? 'Data sources' : activeNav)), /*#__PURE__*/React.createElement("div", {
    className: "host__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "host__btn host__btn--ghost"
  }, "Help"), /*#__PURE__*/React.createElement("button", {
    ref: reg('cta'),
    className: "host__btn",
    style: {
      background: isAds ? '#5b8cff' : '#1f9e78',
      color: '#fff'
    }
  }, isAds ? 'Connect a website' : 'Save'))), /*#__PURE__*/React.createElement("div", {
    className: "host__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "host__card"
  }, /*#__PURE__*/React.createElement("h3", null, isAds ? 'Website events' : 'Today\u2019s orders'), /*#__PURE__*/React.createElement("p", null, isAds ? 'Track visits and purchases from your store.' : 'Across all sales channels.'), /*#__PURE__*/React.createElement("div", {
    className: "host__stat"
  }, isAds ? '—' : '128')), /*#__PURE__*/React.createElement("div", {
    className: "host__card"
  }, /*#__PURE__*/React.createElement("h3", null, isAds ? 'Pixel status' : 'Revenue'), /*#__PURE__*/React.createElement("p", null, isAds ? 'No pixel connected yet.' : 'Last 7 days.'), /*#__PURE__*/React.createElement("div", {
    className: "host__stat"
  }, isAds ? 'Off' : '$8.4k')), /*#__PURE__*/React.createElement("div", {
    className: "host__card",
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("h3", null, isAds ? 'Setup checklist' : 'Recent activity'), /*#__PURE__*/React.createElement("div", {
    className: "host__skel"
  }), /*#__PURE__*/React.createElement("div", {
    className: "host__skel s2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "host__skel"
  })))));
}
Object.assign(__ds_scope, { HostPage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/extension/HostPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/extension/OuijaExtension.jsx
try { (() => {
/* The scripted journey: guiding the user to connect "Beacon Ads" to their
   "Northwind" store — hopping between two host sites, the heart of Ouija. */
const STEPS = [{
  site: 'store',
  nav: 'Home',
  target: 'nav',
  point: 'right',
  msg: "Let\u2019s connect Beacon Ads to your store. First, open <b>Settings</b> in the left menu.",
  coach: {
    arrow: 'right',
    html: 'Open <b>Settings</b> \u2192'
  },
  advance: 'I opened Settings'
}, {
  site: 'store',
  nav: 'Settings',
  target: 'cta',
  point: 'left',
  msg: "Perfect. Now <b>Save</b> to make sure your store info is up to date.",
  coach: {
    arrow: 'up',
    html: 'Click <b>Save</b>'
  },
  advance: 'Done — what\u2019s next?'
}, {
  site: 'store',
  nav: 'Settings',
  target: null,
  msg: "Saved. Switch over to your <b>Beacon Ads</b> tab and let me know when you\u2019re there.",
  advance: 'I\u2019m on Beacon Ads'
}, {
  site: 'ads',
  nav: 'Data sources',
  target: 'cta',
  point: 'left',
  msg: "Great \u2014 we\u2019re in Beacon Ads. Click <b>Connect a website</b> to add a new pixel.",
  coach: {
    arrow: 'up',
    html: 'Click <b>Connect a website</b>'
  },
  advance: 'I clicked it'
}, {
  site: 'ads',
  nav: 'Data sources',
  target: null,
  input: true,
  msg: "Which store should I connect? Pop in your domain and I\u2019ll match it.",
  advance: 'Connect it'
}, {
  site: 'ads',
  nav: 'Data sources',
  target: 'cta',
  point: 'left',
  msg: "Here\u2019s your Pixel ID. Copy it, then head back to Northwind and paste it under <b>Settings \u203a Customer events</b>.",
  coach: {
    arrow: 'up',
    html: 'Paste this into <b>Customer events</b>',
    copy: 'px_8f3c20a91b4e'
  },
  advance: 'Pasted it'
}, {
  site: 'ads',
  nav: 'Data sources',
  target: null,
  success: true,
  msg: "Your pixel is connected \u2014 nicely done. You\u2019re all set to track sales.",
  advance: 'Finish',
  done: true
}];
function OuijaExtension() {
  const [step, setStep] = React.useState(0);
  const [collapsed, setCollapsed] = React.useState(false);
  const [thinking, setThinking] = React.useState(false);
  const [rect, setRect] = React.useState(null);
  const stageRef = React.useRef(null);
  const targetsRef = React.useRef({});
  const s = STEPS[step];
  const total = STEPS.length - 1; // last is the success cap

  // measure the active target relative to the stage
  React.useLayoutEffect(() => {
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!s.target || !stageRef.current) {
          setRect(null);
          return;
        }
        const node = targetsRef.current[s.target];
        if (!node) {
          setRect(null);
          return;
        }
        const c = stageRef.current.getBoundingClientRect();
        const r = node.getBoundingClientRect();
        setRect({
          top: r.top - c.top,
          left: r.left - c.left,
          w: r.width,
          h: r.height
        });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [step]);
  const advance = () => {
    if (s.done) {
      setStep(0);
      return;
    }
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setStep(n => Math.min(n + 1, STEPS.length - 1));
    }, 650);
  };
  const PAD = 7;
  return /*#__PURE__*/React.createElement("div", {
    ref: stageRef,
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.HostPage, {
    site: s.site,
    activeNav: s.nav,
    targets: targetsRef.current,
    key: s.site + s.nav
  }), !collapsed && rect && !thinking && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 40,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Spotlight, {
    radius: 12,
    style: {
      top: rect.top - PAD,
      left: rect.left - PAD,
      width: rect.w + PAD * 2,
      height: rect.h + PAD * 2
    }
  }), s.point === 'left' && /*#__PURE__*/React.createElement(__ds_scope.Pointer, {
    direction: "right",
    style: {
      top: rect.top + rect.h / 2 - 17,
      left: rect.left - 50
    }
  }), s.point === 'right' && /*#__PURE__*/React.createElement(__ds_scope.Pointer, {
    direction: "right",
    style: {
      top: rect.top + rect.h / 2 - 17,
      left: rect.left + rect.w + 16
    }
  }), s.coach && /*#__PURE__*/React.createElement(__ds_scope.Coachmark, {
    arrow: s.coach.arrow,
    html: s.coach.html,
    copyValue: s.coach.copy,
    key: step,
    style: {
      position: 'absolute',
      top: rect.top + rect.h + 20,
      left: Math.min(rect.left, (stageRef.current?.clientWidth || 900) - 320)
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'var(--panel-margin)',
      right: 'var(--panel-margin)',
      bottom: 'var(--panel-margin)',
      zIndex: 60,
      display: 'flex',
      alignItems: collapsed ? 'flex-start' : 'stretch',
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.SidebarPanel, {
    subtitle: "Connect Beacon Ads",
    step: Math.min(step + 1, total),
    totalSteps: total,
    collapsed: collapsed,
    thinking: thinking,
    advanceLabel: thinking ? 'One moment\u2026' : s.advance,
    onAdvance: advance,
    onCollapse: () => setCollapsed(true),
    onExpand: () => setCollapsed(false),
    style: collapsed ? undefined : {
      maxHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.MessageBubble, {
    key: 'm' + step,
    html: s.msg,
    variant: s.success ? 'success' : 'guidance',
    animate: true
  }), s.input && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.GlassInput, {
    label: "Store domain",
    placeholder: "store.example.com",
    defaultValue: "northwind.shop",
    mono: true
  })))));
}
Object.assign(__ds_scope, { OuijaExtension });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/extension/OuijaExtension.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.ProgressDots = __ds_scope.ProgressDots;

__ds_ns.GlassInput = __ds_scope.GlassInput;

__ds_ns.Coachmark = __ds_scope.Coachmark;

__ds_ns.Pointer = __ds_scope.Pointer;

__ds_ns.Spotlight = __ds_scope.Spotlight;

__ds_ns.MessageBubble = __ds_scope.MessageBubble;

__ds_ns.SidebarPanel = __ds_scope.SidebarPanel;

__ds_ns.HostPage = __ds_scope.HostPage;

__ds_ns.OuijaExtension = __ds_scope.OuijaExtension;

})();
