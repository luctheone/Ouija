import * as React from 'react';

/**
 * How Ouija speaks — a glassy, soft, friendly message bubble. `guidance` for
 * instructions, `success` for confirmations, `user` for the person's replies.
 * Keep copy warm and short; bold the exact on-page label the user should find.
 */
export interface MessageBubbleProps {
  /** Plain text / nodes (use this OR `html`). */
  children?: React.ReactNode;
  /** Trusted HTML string — lets you <b>bold</b> the on-page label. Wins over children. */
  html?: string;
  /** Bubble role. @default "guidance" */
  variant?: 'guidance' | 'success' | 'user';
  /** Show the Ouija spark avatar (ignored for `user`). @default true */
  avatar?: boolean;
  /** Play the soft spring entrance. @default false */
  animate?: boolean;
}

export function MessageBubble(props: MessageBubbleProps): JSX.Element;
