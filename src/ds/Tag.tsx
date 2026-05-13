/**
 * DS shim — mirrors @jisr-hr/ds-web Tag API.
 * Storybook: atoms-tag--docs
 * Stories: default, with-count, with-avatar, with-icon, with-close-button,
 *          with-disabled, all-variants-and-states
 *
 * Tag replaces both the custom Chip and Pill components.
 */
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type TagAppearance = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
type TagSize = 'sm' | 'md';

interface TagProps {
  children?: ReactNode;
  appearance?: TagAppearance;
  size?: TagSize;
  leadingIcon?: ReactNode;
  avatar?: ReactNode;
  count?: number;
  onDismiss?: () => void;
  disabled?: boolean;
  className?: string;
}

const appearanceClasses: Record<TagAppearance, string> = {
  neutral: 'bg-app-subtle dark:bg-app-subtle-dark text-app-mute dark:text-app-mute-dark',
  info: 'bg-info-bg dark:bg-info-bg-dark text-info-ink dark:text-info-ink-dark',
  success: 'bg-ok-bg dark:bg-ok-bg-dark text-ok-ink dark:text-ok-ink-dark',
  warning: 'bg-warn-bg dark:bg-warn-bg-dark text-warn-ink dark:text-warn-ink-dark',
  danger: 'bg-danger-bg dark:bg-danger-bg-dark text-danger-ink dark:text-danger-ink-dark',
};

const sizeClasses: Record<TagSize, string> = {
  sm: 'px-1.5 py-0.5 text-11 gap-1 rounded-md',
  md: 'px-2 py-1 text-13 gap-1.5 rounded-md',
};

export const Tag = ({
  children,
  appearance = 'neutral',
  size = 'sm',
  leadingIcon,
  avatar,
  count,
  onDismiss,
  disabled = false,
  className = '',
}: TagProps) => (
  <span
    className={[
      'inline-flex items-center font-medium',
      appearanceClasses[appearance],
      sizeClasses[size],
      disabled ? 'opacity-40' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {avatar && <span className="shrink-0">{avatar}</span>}
    {leadingIcon && <span className="shrink-0 size-3.5">{leadingIcon}</span>}
    {children}
    {count !== undefined && (
      <span className="ml-0.5 opacity-60">{count}</span>
    )}
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        disabled={disabled}
        className="ml-0.5 shrink-0 size-3.5 inline-flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 transition"
        aria-label="Remove"
      >
        <X className="size-2.5" />
      </button>
    )}
  </span>
);
