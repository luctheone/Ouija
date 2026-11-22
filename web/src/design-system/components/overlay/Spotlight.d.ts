import * as React from 'react';

/**
 * A soft glowing rounded frame that draws attention to one element on the host
 * page — a gentle pool of light, not a harsh border. It breathes slowly and
 * frames *around* the target so it never covers what the user must click.
 * Position it absolutely over the target (the kit measures the element's rect).
 *
 * @startingPoint section="Overlay" subtitle="On-page spotlight — glowing target frame" viewport="320x140"
 */
export interface SpotlightProps {
  /** Override the corner radius to match the framed control (number = px). */
  radius?: number | string;
  /** Play the entrance pop, then breathe. @default true */
  animate?: boolean;
  /** Position it: pass `position:absolute` + top/left/width/height of the target. */
  style?: React.CSSProperties;
  className?: string;
}

export function Spotlight(props: SpotlightProps): JSX.Element;
