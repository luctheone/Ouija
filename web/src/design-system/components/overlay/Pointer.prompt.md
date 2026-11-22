A glowing directional arrow that guides the eye toward the spotlighted element; bobs gently in its travel direction.

```jsx
<Pointer direction="down" style={{ top:-40, left:'50%' }} />
```

- `direction`: `up` | `down` | `left` | `right` — sets both the arrow rotation and the bob axis.
- Position absolutely just outside the target, pointing inward. `pointer-events` are off.
