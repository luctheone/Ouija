import * as React from 'react';

/**
 * Ouija's main floating surface — a glassy, rounded panel docked to the side of
 * the screen with margin so it reads as floating *above* the host page. Renders
 * the identity header, step progress, a conversational body (pass MessageBubbles
 * as children) and a primary advance control. Collapses to a re-summonable orb.
 *
 * @startingPoint section="Surfaces" subtitle="The Ouija sidebar — expanded & collapsed orb" viewport="400x520"
 */
export interface SidebarPanelProps {
  /** Conversational body — typically a stack of <MessageBubble/>. */
  children?: React.ReactNode;
  /** Identity title. @default "Ouija" */
  title?: string;
  /** Small line under the title (e.g. the journey name). */
  subtitle?: string;
  /** 1-based current step. @default 1 */
  step?: number;
  /** Total steps in the journey. @default 6 */
  totalSteps?: number;
  /** Render the collapsed orb instead of the full panel. @default false */
  collapsed?: boolean;
  /** Show the animated "thinking" indicator in the body. @default false */
  thinking?: boolean;
  /** Primary button label. @default "I did it — next" */
  advanceLabel?: string;
  /** Advance handler (primary button). */
  onAdvance?: () => void;
  /** Minimize handler (header button) → collapse to orb. */
  onCollapse?: () => void;
  /** Expand handler (orb click) → open the panel. */
  onExpand?: () => void;
  /** Show the progress bar under the header. @default true */
  showProgress?: boolean;
  /** Play the entrance animation. @default false */
  animate?: boolean;
  style?: React.CSSProperties;
}

export function SidebarPanel(props: SidebarPanelProps): JSX.Element;
