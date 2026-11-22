# Reliquary — the Ouija dark aesthetic

## What it is

Reliquary is the named visual direction for Ouija's own surface — the **dark, inverted glass** that the panel, orb, and overlays are built from. It is intentionally the opposite of the original frosted-white liquid-glass concept.

Where the original design was a light, airy layer floating above the page, Reliquary is **warm amber, deep, and gem-like** — like candlelight held in a dark vessel. A reliquary is a container that holds something precious. The panel holds the user's progress; the dark material signals that what's inside matters.

---

## Why dark, why amber

Ouija is a guest on pages it doesn't own. A light-glass panel on a light host page (Shopify admin, Stripe dashboard) competes — both surfaces are frosted white, and the panel reads as part of the host chrome rather than as a distinct, trustworthy companion. Dark glass solves this: it separates cleanly from any host background, light or dark, without fighting.

Amber (oklch hue ~35) is the default because it is warm and non-competitive. It reads as candlelight, not as a brand color. No major SaaS product owns amber, so it doesn't accidentally look like it belongs to the host page. At low chroma it becomes almost a warm neutral; at full chroma it glows.

---

## The adaptive hue system

Reliquary has no fixed color. Two CSS custom properties are the only primitives:

```css
--ouija-h: 35;    /* hue  — amber by default */
--ouija-c: 0.18;  /* chroma — moderate saturation by default */
```

Every surface color, text color, glint, bubble, node, and button in the system derives from these two values via `oklch()`. The host-detector overrides them at runtime to the detected site hue, and the entire panel re-tints automatically. Amber is the fallback — what you see when no host hue has been detected yet.

This is different from the theme system (`data-theme="shopify"`). Themes are full palette swaps for known sites. The adaptive hue is a live, continuous response to unknown sites.

---

## The glint

The rotating conic-gradient border on every Reliquary surface — a single bright arc that slowly sweeps the panel edge — is the system's signature detail. It is the light catching the rim of the vessel. It is not decorative: it signals that the surface is alive and present without requiring the user's attention. The arc is narrow (18° wide), the animation is slow (9s), and the peak opacity is moderate. It should be noticeable on second glance, not on first.

Implementation: `conic-gradient` + `mask-composite: exclude` on a `::after` pseudo-element. See `components/surfaces/SidebarPanel.jsx` for the canonical pattern; replicate it for any new Reliquary surface.

---

## What Reliquary is not

- It is not a dark mode. It does not respond to `prefers-color-scheme`. It is always dark.
- It is not the same as the `--glass-*` tokens in `tokens/effects.css`. Those describe the original light-glass system (frosted white, backdrop blur, inner highlight). Reliquary uses `--ouija-surface` and `--ouija-*` tokens from `tokens/colors.css` instead.
- It is not opaque. The surface is still translucent (84% opacity) so the host page softens behind it — the user sees they are still on the host page, just guided by something above it.

---

## Token entry points

| Purpose | Token |
|---|---|
| Panel background | `--ouija-surface` |
| Stronger bg (header/footer gradient) | `--ouija-surface-strong` |
| Soft bg (nested chips, bubbles) | `--ouija-surface-soft` |
| Primary text | `--ouija-text-hi` |
| Secondary text | `--ouija-text-md` |
| Muted / eyebrow text | `--ouija-text-muted` |
| Mark icon color | `--ouija-mark-color` |
| Mark icon background | `--ouija-mark-bg` |
| Glint highlight | `--ouija-glint-hi` |
| Adaptive hue | `--ouija-h` / `--ouija-c` |

All in `tokens/colors.css`. Override `--ouija-h` and `--ouija-c` on any container to re-tint that subtree.
