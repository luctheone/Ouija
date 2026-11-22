import * as React from 'react';

/**
 * A glowing directional arrow that guides the eye from Ouija toward the
 * spotlighted element. Bobs gently in its travel direction. Position it
 * absolutely just outside the target, pointing inward.
 */
export interface PointerProps {
  /** Which way the arrow points (and bobs). @default "down" */
  direction?: 'up' | 'down' | 'left' | 'right';
  style?: React.CSSProperties;
  className?: string;
}

export function Pointer(props: PointerProps): JSX.Element;
