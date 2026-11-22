---
name: ouija-design
description: Use this skill to generate well-branded interfaces and assets for Ouija, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation
- **What Ouija is:** a calm, premium, glass "assistant layer" that floats above third-party websites to guide non-technical users through cross-site setup. Guiding principle: **"summoned, not imposed."**
- **The material:** liquid glass — frosted translucency, backdrop blur, top highlight, hairline edge, soft cool shadow, accent glow on active states. Recipe lives in `tokens/effects.css`.
- **Color:** cool frosted neutrals + ONE periwinkle accent (`#7174ee`, "the glow of guidance") + soft mint success. Never clash with the host page.
- **Type:** Manrope (UI), JetBrains Mono (IDs/keys). Sentence case, warm, short.
- **Motion:** soft spring overshoot on appearance; calm cross-fades; press scales to 0.96; respect `prefers-reduced-motion`.
- **Icons:** Lucide (thin rounded line). The ✦ spark is the only brand glyph. No emoji.

## Files
- `styles.css` — link this; it `@import`s every token + font file under `tokens/`.
- `readme.md` — full design guide (content fundamentals, visual foundations, iconography).
- `tokens/` — colors, typography, spacing, effects (glass), motion, fonts.
- `guidelines/*.card.html` — foundation specimens.
- `components/` — React primitives (Button, GlassInput, ProgressDots, Badge, MessageBubble, SidebarPanel, Spotlight, Pointer, Coachmark). Each has a `.prompt.md` with usage.
- `ui_kits/extension/` — the extension shown in context over a host site.
- `assets/` — the Ouija spark mark (gradient + mono).

For HTML mocks, link `styles.css`, use the glass recipe from `tokens/effects.css`, and follow the voice + motion rules above.
