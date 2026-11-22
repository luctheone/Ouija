A small glassy label that sits beside the spotlighted element with a short instruction and an optional copy chip; a tail points back at the target.

```jsx
<Coachmark arrow="left" html="Paste this into the <b>Pixel ID</b> box."
  copyValue="px_8f3c20a91b4e" />
```

- `arrow`: which edge the tail points from (`up` | `down` | `left` | `right`) — point it toward the spotlighted element.
- `copyValue` adds a mono value + "Copy" button (→ "Copied" for ~1.4s) for IDs/keys the user moves between sites.
- Use `html` to bold the exact field/label name. Sits beside the target, never on top of it.
