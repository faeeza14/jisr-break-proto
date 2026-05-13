/**
 * DS shim — mirrors @jisr-hr/ds-web Item API.
 * Source: Figma — Wasl DS / Molecules / Item (componentSet 15923:59645)
 *
 * Spec from Figma:
 *   propertyDefinitions: focusRing, description, media, actions (all boolean slots)
 *   Variants: state (default | hover | pressed) × disabled (true|false) × interactive (true|false)
 *   State fills:
 *     default     #FFFFFF or transparent
 *     hover       #F9F9FC
 *     pressed     #F3F3F8
 *   borderRadius 8px, gap 8px, padding 8px (interactive) / 8px 0px (non-interactive)
 *
 * Usage:
 *   <Item interactive onClick={...}
 *         media={<Avatar />}
 *         actions={<Button size="sm">⋯</Button>}
 *         description="Secondary text">
 *     Primary label
 *   </Item>
 */
import type { ReactNode, HTMLAttributes } from 'react';

interface ItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  interactive?: boolean;
  disabled?: boolean;
  /** Optional leading slot — Avatar, icon, color swatch */
  media?: ReactNode;
  /** Secondary line under the primary label */
  description?: ReactNode;
  /** Trailing slot — Button, IconButton, Tag, Badge */
  actions?: ReactNode;
  children: ReactNode;
}

export const Item = ({
  interactive = false,
  disabled = false,
  media,
  description,
  actions,
  children,
  className = '',
  onClick,
  ...rest
}: ItemProps) => {
  const cls = [
    'flex items-center gap-2 rounded-lg text-13',
    // Padding: 8px interactive, 8px 0 non-interactive (per Figma spec)
    interactive ? 'px-2 py-2' : 'py-2',
    // State backgrounds
    interactive && !disabled
      ? 'bg-transparent hover:bg-app-surface active:bg-app-subtle dark:hover:bg-app-subtle-dark dark:active:bg-app-subtle-dark cursor-pointer transition-colors'
      : '',
    disabled ? 'opacity-40 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {media && <span className="shrink-0 inline-flex items-center">{media}</span>}
      <span className="flex-1 min-w-0">
        <span className="block truncate text-app-ink dark:text-app-ink-dark">{children}</span>
        {description && (
          <span className="block truncate text-11 text-app-mute dark:text-app-mute-dark">
            {description}
          </span>
        )}
      </span>
      {actions && <span className="shrink-0 inline-flex items-center gap-1">{actions}</span>}
    </div>
  );
};
