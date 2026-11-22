A frosted text field with a soft focus glow; use it whenever the user types or pastes a value (API key, domain, Pixel ID).

```jsx
<GlassInput label="Domain" placeholder="store.example.com"
  leadIcon={<IconGlobe/>} />

<GlassInput label="Pixel ID" mono copyable
  defaultValue="px_8f3c20a91b4e" />
```

- States are automatic: default → hover (brighter tint) → focus (accent border + `--glow-focus`) → filled.
- `mono` switches the value to JetBrains Mono for data strings.
- `copyable` adds a "Copy" button (becomes "Copied" for ~1.4s) — pair with `mono` for IDs/keys.
- `leadIcon` / `trailIcon` accept Lucide `<svg/>` nodes.
