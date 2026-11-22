import * as React from 'react';

/**
 * Ouija's primary action control — a pill-shaped, glassy button with a soft
 * spring press. Use `primary` for the one main action (advance / confirm),
 * `secondary` (frosted glass) for alternatives, and `ghost` for quiet actions.
 *
 * @startingPoint section="Controls" subtitle="Pill button — primary / secondary / ghost" viewport="360x120"
 */
export interface ButtonProps {
  /** Button label / content. */
  children?: React.ReactNode;
  /** Visual emphasis. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Control height. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Icon node placed before the label (e.g. a Lucide <svg/>). */
  iconLeft?: React.ReactNode;
  /** Icon node placed after the label. */
  iconRight?: React.ReactNode;
  /** Disable interaction. @default false */
  disabled?: boolean;
  /** Native button type. @default "button" */
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
