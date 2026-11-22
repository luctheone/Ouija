Ouija's main floating surface — a glassy rounded sidebar that holds the identity header, step progress, the conversation, and the advance control; collapses to a re-summonable orb.

```jsx
const [collapsed, setCollapsed] = React.useState(false);

<SidebarPanel
  subtitle="Connect your Meta Pixel"
  step={3} totalSteps={6}
  collapsed={collapsed}
  onCollapse={() => setCollapsed(true)}
  onExpand={() => setCollapsed(false)}
  onAdvance={() => {/* next step */}}
>
  <MessageBubble html="Click the <b>Events Manager</b> tab on the left." animate />
  <MessageBubble variant="user">Done</MessageBubble>
</SidebarPanel>
```

- Pass `<MessageBubble/>`s as children for the conversation; set `thinking` to show the agent reasoning.
- `collapsed` swaps the panel for the orb (shows "Step N of M"); wire `onExpand`/`onCollapse` to toggle.
- Float it with margin from the screen edge (the kit positions it `fixed` with `--panel-margin`). Composes ProgressDots + Button internally.
