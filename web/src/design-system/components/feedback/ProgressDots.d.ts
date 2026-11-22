import * as React from 'react';

/**
 * Shows where the user is in a multi-step journey (e.g. "step 3 of 6"). The
 * current step is an elongated glowing pill; completed steps are filled accent
 * dots. Use `dots` for the sidebar header and `bar` for tighter spots.
 *
 * @startingPoint section="Feedback" subtitle="Multi-step journey progress — dots or bar" viewport="320x60"
 */
export interface ProgressDotsProps {
  /** Total steps in the journey. @default 6 */
  total?: number;
  /** 1-based current step. @default 1 */
  current?: number;
  /** Render as dots or a slim bar. @default "dots" */
  variant?: 'dots' | 'bar';
  /** Show the "Step N of M" label. @default true */
  showLabel?: boolean;
  /** Custom label formatter, e.g. (c, t) => `${c}/${t}`. */
  labelFormat?: (current: number, total: number) => string;
}

export function ProgressDots(props: ProgressDotsProps): JSX.Element;
