Shows where the user is in a multi-step journey; the current step is a glowing elongated pill, completed steps are filled accent dots.

```jsx
<ProgressDots total={6} current={3} />
<ProgressDots total={6} current={3} variant="bar" />
```

- `variant`: `dots` (sidebar header) or `bar` (tight spaces).
- `current` is 1-based. `showLabel` toggles the "Step N of M" eyebrow; override copy with `labelFormat`.
