import * as React from 'react';

/**
 * A small status pill — a step label, a connection status, a short count.
 * Calm by default (`neutral`); `accent`/`success` carry meaning, use sparingly.
 */
export interface BadgeProps {
  /** Badge content (keep it short). */
  children?: React.ReactNode;
  /** Tone. @default "neutral" */
  variant?: 'neutral' | 'accent' | 'success' | 'warn';
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Show a small status dot before the label. @default false */
  dot?: boolean;
}

export function Badge(props: BadgeProps): JSX.Element;
