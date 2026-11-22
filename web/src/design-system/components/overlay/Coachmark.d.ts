import * as React from 'react';

/**
 * A small glassy label that sits *beside* the spotlighted element with a short
 * instruction and an optional copy-to-clipboard chip (for pasting a Pixel ID,
 * key, or domain between sites). A little tail points back at the target.
 *
 * @startingPoint section="Overlay" subtitle="On-page coachmark — instruction + copy chip" viewport="320x160"
 */
export interface CoachmarkProps {
  /** Instruction text / nodes (use this OR `html`). */
  children?: React.ReactNode;
  /** Trusted HTML — lets you <b>bold</b> the on-page label. Wins over children. */
  html?: string;
  /** Which edge the tail points from (toward the target). @default "up" */
  arrow?: 'up' | 'down' | 'left' | 'right';
  /** If set, renders a mono value + copy button. */
  copyValue?: string;
  /** Copy button label. @default "Copy" */
  copyLabel?: string;
  /** Play the soft spring entrance. @default true */
  animate?: boolean;
  /** Position it absolutely near the spotlighted element. */
  style?: React.CSSProperties;
  className?: string;
}

export function Coachmark(props: CoachmarkProps): JSX.Element;
