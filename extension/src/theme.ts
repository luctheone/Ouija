// UI Chameleon — pre-set scheme library + host-page color scan + nearest-match.
//
// NOT on-the-fly generation. We scan the host page's dominant accent + background, then SNAP
// to the closest pre-built Reliquary scheme. The whole sidebar palette is driven by two CSS
// custom properties — --ouija-h (oklch hue) and --ouija-c (chroma) — so a scheme is just a
// (hue, chroma) pair plus the host signature it harmonizes with.
//
// DESIGN DECISION: the sidebar keeps its dark
// liquid-glass IDENTITY. A guidance overlay must stay visually distinct from the host page —
// "feels native" means a harmonized ACCENT, not camouflage (a sidebar that matched a white
// host exactly would vanish). So the chameleon shifts hue/chroma to match the site's accent
// family while preserving the dark-glass base. Bright hosts nudge toward higher-contrast
// schemes for legibility.

export interface OuijaScheme {
  id: string;
  label: string;
  oklchH: number;        // applied accent hue → --ouija-h
  oklchC: number;        // applied chroma base → --ouija-c
  matchHue: number | null; // representative HSL hue (deg) used for nearest-match; null = chosen by signal
  neutral?: boolean;     // matches low-saturation / grayscale hosts
  highContrast?: boolean;// matches stark black-on-white hosts
}

// ~11 archetype schemes spanning the hue wheel + neutral + high-contrast. Each is a complete
// Reliquary palette (the dark token set re-tinted to this hue/chroma).
export const SCHEMES: OuijaScheme[] = [
  { id: 'amber-warm',      label: 'Amber',          oklchH: 35,  oklchC: 0.18, matchHue: 35 },
  { id: 'sunset-red',      label: 'Sunset',         oklchH: 20,  oklchC: 0.19, matchHue: 8 },
  { id: 'magenta-vibrant', label: 'Vibrant',        oklchH: 355, oklchC: 0.20, matchHue: 322 },
  { id: 'violet-saas',     label: 'Violet',         oklchH: 320, oklchC: 0.17, matchHue: 278 },
  { id: 'indigo',          label: 'Indigo',         oklchH: 285, oklchC: 0.16, matchHue: 248 },
  { id: 'blue-corporate',  label: 'Corporate Blue', oklchH: 255, oklchC: 0.15, matchHue: 212 },
  { id: 'teal',            label: 'Teal',           oklchH: 200, oklchC: 0.15, matchHue: 182 },
  { id: 'green-fresh',     label: 'Fresh Green',    oklchH: 155, oklchC: 0.16, matchHue: 138 },
  { id: 'lime',            label: 'Lime',           oklchH: 120, oklchC: 0.15, matchHue: 95 },
  { id: 'neutral-slate',   label: 'Neutral',        oklchH: 255, oklchC: 0.045, matchHue: null, neutral: true },
  { id: 'high-contrast',   label: 'High Contrast',  oklchH: 35,  oklchC: 0.225, matchHue: null, highContrast: true },
];

export const DEFAULT_SCHEME = SCHEMES[0];

export interface HostScan {
  accentHue: number | null; // dominant accent HSL hue (deg), null if none found
  accentSat: number;        // 0..1 saturation of that accent
  bgLightness: number;      // 0..1 background lightness (1 = white)
}

// ── colour helpers ──────────────────────────────────────────────────────────

function parseRgb(str: string): [number, number, number, number] | null {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return [parts[0], parts[1], parts[2], parts[3] === undefined ? 1 : parts[3]];
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/** Smallest circular distance between two hues (deg). */
function hueDist(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// ── host scan ─────────────────────────────────────────────────────────────────

function isOuija(el: Element): boolean {
  return (el as HTMLElement).id?.startsWith('ouija-') === true || el.closest('[id^="ouija-"]') !== null;
}

function median(nums: number[]): number {
  const a = [...nums].sort((x, y) => x - y);
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

/** Effective background lightness AT a point: walk up to the first element that paints an opaque bg. */
function bgLightnessAt(x: number, y: number): number | null {
  try {
    let el: Element | null = document.elementFromPoint(x, y);
    for (let hops = 0; el && hops < 16; hops++) {
      if (!isOuija(el)) {
        const rgb = parseRgb(getComputedStyle(el).backgroundColor);
        if (rgb && rgb[3] >= 0.5) return rgbToHsl(rgb[0], rgb[1], rgb[2]).l;
      }
      el = el.parentElement;
    }
  } catch { /* elementFromPoint can throw in odd framing contexts */ }
  return null;
}

function readBgLightness(): number {
  // Sample the effective background across a GRID of points (left of the docked sidebar), walking
  // each up to its first opaque background. The MEDIAN is the page's real lightness — a single
  // bright promo/sign-up bar (or a stray light card) can't tip it, and we don't depend on any one
  // element. The page only counts as "light" if MOST of it is light.
  const xs = [0.16, 0.30, 0.44, 0.58];
  const ys = [0.20, 0.38, 0.56, 0.74];
  const bgs: number[] = [];
  for (const fx of xs) for (const fy of ys) {
    const l = bgLightnessAt(Math.round(window.innerWidth * fx), Math.round(window.innerHeight * fy));
    if (l !== null) bgs.push(l);
  }
  if (bgs.length >= 3) return median(bgs);

  // Few/no opaque backgrounds (transparent SPA) → infer from ACTUAL rendered text. NOT
  // document.body.color — SPAs like X leave that at the unset default BLACK (it set text colours
  // on inner components), which is exactly what flipped a dark page to "light". So we read the
  // colour of elements that genuinely contain visible text, take the median, and invert it.
  const texts: number[] = [];
  const els = document.querySelectorAll('p, span, a, h1, h2, h3, li, button, td, label');
  for (const el of Array.from(els)) {
    if (texts.length >= 40) break;
    if (isOuija(el) || (el.textContent || '').trim().length < 2) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > window.innerHeight) continue;
    const rgb = parseRgb(getComputedStyle(el).color);
    if (rgb && rgb[3] >= 0.3) texts.push(rgbToHsl(rgb[0], rgb[1], rgb[2]).l);
  }
  if (texts.length >= 3) return Math.max(0, Math.min(1, 1 - median(texts)));
  if (bgs.length) return median(bgs);
  return 0.12; // nothing legible → default dark (always safe)
}

/**
 * Sample the host page's dominant accent: scan links + buttons (where brand colour lives) for
 * the most-saturated, mid-lightness colour across their text / background / border. Cheap —
 * caps the sample, reads computed styles only.
 */
export function scanHostColors(): HostScan {
  const bgLightness = readBgLightness();
  const candidates = Array.from(
    document.querySelectorAll('a[href], button, [role="button"], [class*="btn"], [class*="primary"]')
  ).slice(0, 120);

  let bestHue: number | null = null;
  let bestSat = 0;
  for (const el of candidates) {
    const cs = getComputedStyle(el as Element);
    for (const prop of [cs.color, cs.backgroundColor, cs.borderColor, cs.outlineColor]) {
      const rgb = parseRgb(prop);
      if (!rgb || rgb[3] < 0.4) continue;
      const { h, s, l } = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      // Ignore near-greys and extremes (text black / page white) — we want brand accents.
      if (s > bestSat && s > 0.28 && l > 0.18 && l < 0.82) {
        bestSat = s;
        bestHue = h;
      }
    }
  }
  return { accentHue: bestHue, accentSat: bestSat, bgLightness };
}

// ── nearest-match ─────────────────────────────────────────────────────────────

export function matchScheme(scan: HostScan): OuijaScheme {
  // Stark black-on-white with no real accent → high-contrast scheme.
  if ((scan.accentHue === null || scan.accentSat < 0.12) && scan.bgLightness > 0.9) {
    return SCHEMES.find((s) => s.highContrast) || DEFAULT_SCHEME;
  }
  // Grayscale / very low-saturation host → neutral scheme.
  if (scan.accentHue === null || scan.accentSat < 0.18) {
    return SCHEMES.find((s) => s.neutral) || DEFAULT_SCHEME;
  }
  // Otherwise snap to the nearest hue-family scheme.
  let best = DEFAULT_SCHEME;
  let bestD = Infinity;
  for (const s of SCHEMES) {
    if (s.matchHue === null) continue;
    const d = hueDist(scan.accentHue, s.matchHue);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

/** The CSS custom properties to set on the sidebar root for this scheme. */
export function schemeToVars(s: OuijaScheme): Record<string, string> {
  return {
    '--ouija-h': String(s.oklchH),
    '--ouija-c': String(s.oklchC),
  };
}

export type SurfaceMode = 'light' | 'dark';

/**
 * Convenience: scan + match + pick a surface mode. The sidebar goes LIGHT on a bright host and
 * DARK on a dark host so it reads as native to the site's own light/dark mode — while always
 * keeping a distinct frosted-glass border + accent so it never fully disappears into the page.
 */
export function detectScheme(): { scheme: OuijaScheme; scan: HostScan; mode: SurfaceMode } {
  const scan = scanHostColors();
  const mode: SurfaceMode = scan.bgLightness > 0.62 ? 'light' : 'dark';
  return { scheme: matchScheme(scan), scan, mode };
}
