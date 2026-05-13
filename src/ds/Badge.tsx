/**
 * DS shim — mirrors @jisr-hr/ds-web Badge API.
 * Source: Figma — Wasl DS / Atoms / Badge (componentSetId 2142:3401)
 *
 * Variant matrix from Figma:
 *   variant:    primary | secondary
 *   appearance: info | success | warning | danger | neutral
 *   dot:        true | false
 *   size:       small | medium
 *   rtl:        true | false (handled by parent layout)
 *
 * Used for: notification counters, status indicators, tab count badges, "New" dots.
 * Distinct from Tag — Tag is a larger inline status chip with optional dismiss.
 */
import type { ReactNode } from 'react';

type BadgeAppearance = 'info' | 'success' | 'warning' | 'danger' | 'neutral';
type BadgeVariant = 'primary' | 'secondary';
type BadgeSize = 'small' | 'medium';

interface BadgeProps {
  /** Show as a 6×6 dot indicator instead of a labelled pill */
  dot?: boolean;
  variant?: BadgeVariant;
  appearance?: BadgeAppearance;
  size?: BadgeSize;
  /** Numeric counter — overrides children if provided */
  count?: number;
  /** Optional leading icon (lucide-react node) */
  leadingIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

// Tailwind color classes mapped from real Wasl DS hex values
const FILLS: Record<BadgeVariant, Record<BadgeAppearance, string>> = {
  primary: {
    info: 'bg-info-bg text-info-ink dark:bg-info-bg-dark dark:text-info-ink-dark',
    success: 'bg-ok-bg text-ok-ink dark:bg-ok-bg-dark dark:text-ok-ink-dark',
    warning: 'bg-warn-bg text-warn-ink dark:bg-warn-bg-dark dark:text-warn-ink-dark',
    danger: 'bg-danger-bg text-danger-ink dark:bg-danger-bg-dark dark:text-danger-ink-dark',
    neutral: 'bg-app-subtle text-app-ink dark:bg-app-subtle-dark dark:text-app-ink-dark',
  },
  secondary: {
    info: 'bg-info-ink text-white',
    success: 'bg-ok-ink text-white',
    warning: 'bg-warn-ink text-white',
    danger: 'bg-danger-ink text-white',
    neutral: 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-bg-dark',
  },
};

const DOT_FILLS: Record<BadgeAppearance, string> = {
  info: 'bg-info-ink',
  success: 'bg-ok-ink',
  warning: 'bg-warn-ink',
  danger: 'bg-danger-ink',
  neutral: 'bg-app-mute dark:bg-app-mute-dark',
};

export const Badge = ({
  dot = false,
  variant = 'primary',
  appearance = 'neutral',
  size = 'medium',
  count,
  leadingIcon,
  children,
  className = '',
}: BadgeProps) => {
  // Dot variant — Figma spec: 6×6, fully round, white 1px stroke
  if (dot) {
    const dotSize = size === 'small' ? 'size-1.5' : 'size-2';
    return (
      <span
        className={[
          'inline-block rounded-full ring-1 ring-white dark:ring-app-card-dark',
          dotSize,
          DOT_FILLS[appearance],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />
    );
  }

  // Pill variant
  const sizeCls =
    size === 'small'
      ? 'h-4 min-w-4 px-1 text-[10px] leading-none'
      : 'h-5 min-w-5 px-1.5 text-11 leading-none';

  return (
    <span
      className={[
        'inline-flex items-center justify-center gap-1 rounded-full font-medium tabular-nums',
        sizeCls,
        FILLS[variant][appearance],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {leadingIcon}
      {count !== undefined ? count : children}
    </span>
  );
};
