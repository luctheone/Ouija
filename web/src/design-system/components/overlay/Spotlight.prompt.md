A soft glowing rounded frame that highlights one element on the host page; a pool of light, not a hard border. It breathes and never covers the target.

```jsx
<div style={{position:'relative'}}>
  <button>Save changes</button>
  <Spotlight style={{ top:-6, left:-6, width:'calc(100% + 12px)', height:'calc(100% + 12px)' }} radius={14} />
</div>
```

- Render it as an absolutely-positioned sibling sized a few px larger than the target (so the glow surrounds it).
- `radius` should match the framed control's corner radius.
- `pointer-events` are off, so the user can still click the real element underneath.
- Pair with `<Pointer/>` and `<Coachmark/>` to point and explain.
