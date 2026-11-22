Ouija's primary action control — a pill-shaped, glassy button with a soft spring press; use it for advance/confirm and dialog actions.

```jsx
<Button variant="primary" size="md" iconRight={<IconArrowRight/>}>
  I did it — next
</Button>
<Button variant="secondary">Not yet</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

- `variant`: `primary` (solid accent + guidance glow on hover), `secondary` (frosted glass), `ghost` (transparent until hover).
- `size`: `sm` | `md` | `lg`.
- `iconLeft` / `iconRight`: pass a Lucide `<svg/>` node. Press scales to 0.96; hover lifts 1px.
- One `primary` per surface — it represents the single main action Ouija is nudging toward.
