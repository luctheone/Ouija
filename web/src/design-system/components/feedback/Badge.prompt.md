A small status pill for step labels, connection status, or short counts; calm by default.

```jsx
<Badge variant="neutral" dot>Connecting</Badge>
<Badge variant="success" icon={<IconCheck/>}>Connected</Badge>
<Badge variant="accent">Step 3 of 6</Badge>
```

- `variant`: `neutral` (frosted glass), `accent`, `success`, `warn`.
- `dot` adds a status dot; `icon` accepts a Lucide `<svg/>`.
