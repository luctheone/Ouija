How Ouija speaks — a glassy, soft, friendly message bubble; warm and short, never robotic.

```jsx
<MessageBubble html="Click the <b>Events Manager</b> tab on the left." animate />
<MessageBubble variant="success">Your pixel is connected — nicely done.</MessageBubble>
<MessageBubble variant="user">I clicked it</MessageBubble>
```

- `variant`: `guidance` (frosted neutral + spark avatar), `success` (minty glow), `user` (solid accent, right-aligned, no avatar).
- Use `html` to bold the exact label the user should look for on the host page.
- `animate` plays the soft spring entrance (used as each new bubble arrives in the panel).
