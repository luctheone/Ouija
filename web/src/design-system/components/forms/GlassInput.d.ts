import * as React from 'react';

/**
 * A frosted text field with a soft focus glow. Use for the moments the user
 * types or pastes something — an API key, a domain, a Pixel ID. Turn on `mono`
 * + `copyable` for IDs/keys the user copies between sites.
 *
 * @startingPoint section="Forms" subtitle="Glassy input — default / focus / filled / mono+copy" viewport="360x96"
 */
export interface GlassInputProps {
  /** Field label rendered above the input. */
  label?: string;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Render the value in JetBrains Mono (for IDs/keys/domains). @default false */
  mono?: boolean;
  /** Leading icon node. */
  leadIcon?: React.ReactNode;
  /** Trailing icon node (ignored when `copyable`). */
  trailIcon?: React.ReactNode;
  /** Show a copy-to-clipboard button on the right. @default false */
  copyable?: boolean;
  /** Disable interaction. @default false */
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}

export function GlassInput(props: GlassInputProps): JSX.Element;
