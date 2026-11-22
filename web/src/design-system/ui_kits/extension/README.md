# UI Kit — Ouija Extension (in context)

A high-fidelity, click-through recreation of the Ouija extension doing its job:
guiding a user to connect a marketing pixel across two third-party sites.

- `index.html` — mounts the interactive scene inside browser chrome. Press the
  primary button in the sidebar to advance the journey; minimize to the orb and
  re-summon. Loads the compiled bundle and mounts `OuijaExtension`.
- `HostPage.jsx` — generic, **made-up** host sites ("Northwind" store admin and
  "Beacon Ads" manager). Deliberately *not* a recreation of any real product —
  Ouija is brand-neutral and must float on top of anything. Exposes target nodes
  (`nav`, `cta`) via a `targets` ref so overlays can be measured onto them.
- `OuijaExtension.jsx` — the orchestration: a scripted multi-step journey that
  measures the active host target's rect and positions the `Spotlight`,
  `Pointer`, and `Coachmark` over it, while the `SidebarPanel` narrates with
  `MessageBubble`s and a `GlassInput` for the domain step.

It composes the published primitives — SidebarPanel, MessageBubble, GlassInput,
Spotlight, Pointer, Coachmark, ProgressDots, Button — rather than reimplementing
them. The two host pages are intentionally low-fidelity stand-ins; the fidelity
that matters is the Ouija layer floating above them.
