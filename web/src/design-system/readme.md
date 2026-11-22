# Ouija — Design System

> A calm, trustworthy companion that travels with the user across the messy web.

## What Ouija is

Ouija is a **cross-site onboarding-guidance browser extension**. It walks non-technical
users through complex software setup that spans multiple third-party websites — e.g.
"connect your Meta Pixel": configure something in the Shopify admin, hop to Meta Business
Suite, copy an ID back, paste it into Stripe, and so on. Ouija narrates and points the
whole way.

It manifests as two things on screen:

1. **A floating sidebar panel** — the home surface, where the agent talks to the user,
   shows the current step, and offers an "I did it / next" control.
2. **On-page overlay elements** drawn directly onto whatever third-party page the user is
   on — a spotlight that frames the exact button to click, a directional pointer, and a
   coachmark/tooltip with a short instruction and copy-to-clipboard affordance.

### The core tension that drives every decision
Ouija is a **guest on pages it doesn't own**. It floats on top of Shopify, Meta, Stripe,
Google — each with its own clashing visual language. So the system must feel like it
belongs to **the user**, never like a parasite stuck onto the host page.

**Guiding principle: "summoned, not imposed."** Present when wanted, gentle and
unobtrusive, never covering the thing the user needs to interact with. It should read as a
premium, almost Apple-like assistant layer floating *above* the messy web — not part of any
one site.

### Sources
This system was built from a written product + aesthetic brief (no codebase or Figma was
attached). It is a **design exploration** — visual artifacts and a token system, not
production code. If/when a codebase or Figma file exists, link it here and reconcile.

---

## CONTENT FUNDAMENTALS — how Ouija talks

Ouija is a warm, competent guide standing next to the user. The voice is the single most
humanizing part of the product — it must feel like a calm friend who has done this a
hundred times, never a robot reading a manual.

- **Person:** Ouija speaks as a gentle "I/we" helper and addresses the user as **"you."**
  ("I'll point you to it." / "You're almost there.") Never third-person, never "the user."
- **Tone:** warm, encouraging, quietly confident. Reassuring without being saccharine.
  Celebrates small wins ("nicely done") but doesn't over-congratulate.
- **Imperatives are soft and specific.** Tell the user exactly one thing to do, in plain
  language, pointing at a real on-screen element: *"Click the **Events Manager** tab on the
  left."* Not *"Navigate to the Events Manager section of the platform."*
- **Brevity.** One idea per message. A guidance bubble is usually 1 short sentence. The
  panel is small; every word earns its place.
- **Plain language over jargon.** Say "the long ID that starts with `px_`" before "the
  Pixel identifier string." When a technical term is unavoidable, name the exact label the
  user will see on the host page in **bold**.
- **Casing:** sentence case everywhere — headings, buttons, labels. The only uppercase is
  the occasional eyebrow/meta label with wide tracking (e.g. `STEP 3 OF 6`).
- **Punctuation:** light. Periods on full sentences; no exclamation-mark spam (at most one,
  for a genuine success). Em dashes for warmth.
- **No emoji** in the product voice. Warmth comes from word choice and the soft visual
  material, not from emoji or mascots. (A single ✦/spark glyph is used as a *brand* mark,
  not as punctuation in copy.)
- **Success language is human:** "Your pixel is connected — nicely done." Not "Operation
  completed successfully."
- **Errors are blameless and actionable:** "That key didn't take — let's grab a fresh one."
  Never "Invalid input."

**Voice examples**
| Situation | ✅ Ouija says | 🚫 Not |
|---|---|---|
| Guidance | "Click the **Events Manager** tab on the left." | "Please navigate to Events Manager." |
| Waiting | "Take your time — I'll be right here." | "Awaiting user action." |
| Success | "Your pixel is connected — nicely done." | "Pixel connection: SUCCESS." |
| Copy hint | "Copy this ID, then paste it into the box on Meta." | "Transfer the identifier to the destination field." |
| Error | "That key didn't take — let's grab a fresh one." | "Error: invalid API key." |

---

## VISUAL FOUNDATIONS

The whole system is one **liquid-glass material** — frosted translucent panels that feel
like physical objects floating in space above the host page (visionOS / Apple liquid-glass
lineage). Distinct, but calm enough to coexist with any site without visual war.

### Color
- **Cool frosted neutrals** are the base: soft whites and blue-grey greys (hue ~265).
  Deliberately desaturated and slightly cool so the glass never competes with a host site's
  brand colors.
- **One restrained accent — luminous periwinkle-indigo `#7174ee`** ("the glow of
  guidance"). It appears *only* on active/guidance states: the spotlight glow, focus rings,
  the primary button, the current step. Never as large flat fills.
- **Success = soft mint-emerald `#2fbf93`**, used sparingly for confirmations.
- Avoid harsh pure-black and saturated brand-style gradients. Shadows are cool and tinted
  (`rgba(29,31,43,…)`), never `#000`.
- See `tokens/colors.css`.

### The glass recipe (every floating surface)
Built from the same six layers so the system reads as one material — see `tokens/effects.css`:
1. **Translucent tint** — frosted white `rgba(255,255,255,0.62)` (strong/soft/accent variants).
2. **Backdrop blur + saturate** — `blur(22px) saturate(180%)` so the host page softens behind it.
3. **Top inner highlight** — a 1px bright inset line catching light on the upper edge.
4. **Hairline edge stroke** — a soft white 1px border, the refraction at the rim.
5. **Soft ambient outer shadow** — large, cool, low-opacity; the panel floats, it doesn't sit.
6. **Accent glow** — added only on active/guidance/focus/success states.

A dark-glass tint variant exists for dark host pages (`--glass-tint-dark`).

### Typography
- **Manrope** carries the entire UI — rounded, geometric-humanist, friendly but premium.
  Weight and size create hierarchy; we don't decorate.
- **JetBrains Mono** for anything the user copies/pastes — IDs, API keys, domains — so those
  strings read as data, not prose.
- Sentence case; tight tracking on display sizes; wide tracking only on uppercase eyebrows.
- Compact scale tuned for a 360px sidebar (body 15px). See `tokens/typography.css`.

### Shape & spacing
- **Rounded everything.** Generous radii — pills for buttons/chips/the collapsed orb, 14px
  for inputs, 20px for bubbles/coachmarks, 28px for the panel. No hard edges anywhere.
- 4pt spacing grid; generous whitespace; nothing busy. See `tokens/spacing.css`.

### Layout rules
- The sidebar **floats with a 16px margin** from the screen edge — it reads as "above" the
  page, never docked flush like part of the chrome.
- Overlays **never cover the element the user must interact with.** The spotlight frames
  *around* a target; coachmarks sit *beside* it with a pointer; the panel hugs one side and
  leaves the host page usable.
- Collapses to a small glassy **orb/pill** the user can re-summon from — Ouija gets out of
  the way on demand.

### Motion — "summoned, not imposed"
- **Soft spring physics** with gentle overshoot. Appearances *bloom* in (scale 0.9→1 with a
  friendly bounce); the orb→panel transition *morphs* rather than swaps.
- Easings live in `tokens/motion.css`: `--spring-bouncy` for the orb summon, `--spring-soft`
  for surfaces, `--ease-out` for settles, calm cross-fades between states.
- The spotlight **breathes** — a slow, subtle pulse of its glow to hold attention without
  nagging.
- **Hover:** a 1px lift + slightly brighter tint/glow (never a color swap on glass).
- **Press:** a soft scale-down to `0.96` — the surface gives, like pressing a physical key.
- Everything respects `prefers-reduced-motion` (durations collapse to 0).

### Imagery
- Ouija ships almost **no photography**. Its "imagery" is the glass material itself plus the
  live, blurred host page showing through. The vibe is light, airy, cool, and clean.

---

## THEME VARIANTS — "melts into the host site"

Ouija has **no single fixed color scheme**. Its philosophy is to be a guest that
*belongs to the user and adopts the visual language of whatever site they're on*,
so guidance feels native rather than bolted-on. In production this is a library of
per-site themes with a detector that auto-selects; here are two fully-realized
proofs of concept.

**What changes between variants:** only the **color identity** (and the typeface,
where it strengthens the native feel). The liquid-glass material, spring motion,
spacing/radii/type rhythm, and the entire component set are **inherited unchanged**.

**How it works:** the accent is tokenized to a single `--accent-rgb` triplet that
drives every glow, frost, focus ring, and the spotlight's breathing keyframe. A
theme is a single scope — `[data-theme="shopify"]` / `[data-theme="stripe"]` in
`tokens/themes/*.css` — that overrides a small, intentional set: the accent scale +
`--accent-rgb`, the neutral `--ink-*` ramp, the three glass tints (so the frost
carries a whisper of the host hue), `--success-*`, and optionally `--font-sans`.
Apply with `<html data-theme="…">` (or on any wrapper). No base override = the
original periwinkle.

- **Shopify-native (green).** "Frosted eucalyptus light" — pushed **premium**: a deep
  pine→emerald→**spring-neon** ramp, a dimensional fill gradient with a top sheen/glint,
  and a green colored cast under fills. The spotlight gets a tight neon core ring + a
  wide emerald halo. Kept monochromatic so guidance complements the brand. Manrope.
  `tokens/themes/shopify.css`.
- **Stripe-native (indigo).** "Refined fintech indigo" — pushed **premium**: Stripe's
  dashboard indigo (`#5469d4`) deepened to ink-blurple with an **electric-periwinkle**
  glint (`#8b9cff`) on cores/edges, a dimensional fill gradient + sheen, and an indigo
  cast. Cooler and bluer than generic AI-violet. Stripe's blue-slate neutrals on
  `#f6f9fc`; **Geist** typeface. `tokens/themes/stripe.css`.

**Premium hooks** (base, calm by default; themes turn them on): `--accent-neon-rgb`
(bright glint), `--fill-accent-grad` (dimensional fill), `--accent-sheen` (top glint),
`--shadow-accent` (colored cast). Applied to the primary Button, the user message bubble,
the Coachmark copy button, and the Spotlight glow.

**See it in context — Ouija living inside realistic host products:**
- `ui_kits/shopify/index.html` — Ouija on a believable commerce **admin** (setup guide,
  nav, metrics), guiding the user to connect a marketing pixel.
- `ui_kits/stripe/index.html` — Ouija on a believable payments **dashboard** (Developers ›
  Webhooks, endpoints table), guiding the user to add a webhook.
- `ui_kits/themes/index.html` — compact side-by-side palette + hero-surface comparison.

> Host environments are original, brand-neutral analogs ("Northwind", "Ledgerly") that
> evoke the layout/feel of those products without reproducing their proprietary UI.

---

## ICONOGRAPHY

- **Icon set: [Lucide](https://lucide.dev)** — loaded via CDN. Lucide's thin (1.75–2px),
  rounded-cap, geometric line style is the perfect match for Manrope and the soft glass
  material. We never use filled/heavy icon styles.
  > Substitution note: no first-party icon set was provided, so Lucide is chosen as the
  > closest match to the rounded, light aesthetic. Swap if a house set arrives.
- Icons are **monochrome**, inheriting `currentColor` — usually `--text-secondary`, or
  `--accent-500` when the icon marks an active/guidance affordance.
- Typical sizes: **16px** inline, **20px** for controls, **24px** for the panel header.
- **No emoji** anywhere in product UI. The only non-Lucide glyph is the Ouija **spark mark
  (✦)** used as the brand identity in the panel header and the collapsed orb.
- Copyable-data affordances (IDs/keys) pair a `copy` icon with the mono text and a
  copy-to-clipboard interaction.

---

## INDEX — what's in this system

**Foundations**
- `styles.css` — global entry point (link this). `@import`s only.
- `tokens/colors.css` · `typography.css` · `spacing.css` · `effects.css` (glass) ·
  `motion.css` · `fonts.css`
- `guidelines/` — foundation specimen cards (rendered in the Design System tab).

**Components** (`components/`) — reusable React primitives, see each `*.prompt.md`:
- `controls/` — **Button** (primary / secondary / ghost)
- `forms/` — **GlassInput** (default / focus / filled / mono + copy)
- `feedback/` — **ProgressDots** (dots / bar), **Badge**
- `surfaces/` — **SidebarPanel** (expanded + collapsed orb + thinking), **MessageBubble**
- `overlay/` — **Spotlight**, **Pointer**, **Coachmark** (the on-page hero overlays)

All components are exposed on `window.OuijaDesignSystem_93fedd` once the bundle is
built. Six are registered as Starting Points (Button, GlassInput, ProgressDots,
SidebarPanel, Spotlight, Coachmark).

**UI kit** (`ui_kits/extension/`) — the extension shown in context, floating over a mocked
host page, as a click-through.

**Skill** — `SKILL.md` makes this downloadable as a Claude Agent Skill.

---

*Namespace for `@dsCard` HTML:* `window.OuijaDesignSystem_93fedd`
