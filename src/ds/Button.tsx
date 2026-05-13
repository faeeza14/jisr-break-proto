/**
 * DS shim — mirrors @jisr-hr/ds-web Button API.
 * Source: Figma — Wasl DS / Atoms / Button (canvas 105:4)
 *
 * Real DS variant matrix (extracted from Figma variants):
 *   variant:    primary | secondary | tertiary | dashed
 *   appearance: default | danger
 *   size:       small | medium
 *   state:      default | hovered | pressed     (driven by :hover / :active)
 *   disabled:   false | true
 *   loading:    false | true
 *
 * Real DS state fills (default appearance):
 *   primary    default #101014 | hover #18181C | pressed #000000   (white text)
 *   secondary  default #FFFFFF + stroke | hover #F9F9FC | pressed #F3F3F8
 *   tertiary   default transparent       | hover #F9F9FC | pressed #F3F3F8
 *   dashed     default transparent dashed stroke | hover #F9F9FC | pressed #F3F3F8
 *
 * Danger appearance fills:
 *   primary    #F04437 (red), white text
 *   secondary  white bg + danger-line stroke, danger-ink text
 *   tertiary   transparent + danger-ink text
 *   dashed     transparent + dashed danger stroke + danger-ink text
 *
 * Note: the previous `ghost` variant and `lg` size are NOT in the real DS.
 * `appearance="danger"` replaces what was previously `variant="danger"`.
 */
import type { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'dashed';
type ButtonAppearance = 'default' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  /** Render as the only child element. Not actually wired — kept for API parity */
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * Each variant returns the appearance-specific class string with
 * default / hover / active / disabled tokens mapped to Tailwind utilities
 * that resolve to the real Wasl DS hex values.
 */
const variantClasses = (
  variant: ButtonVariant,
  appearance: ButtonAppearance,
): string => {
  if (appearance === 'danger') {
    switch (variant) {
      case 'primary':
        // #F04437 default, darker on hover/press
        return 'bg-danger-line text-white hover:bg-danger-ink active:bg-[#B42318] border border-danger-line';
      case 'secondary':
        return 'bg-white dark:bg-app-card-dark border border-danger-line text-danger-ink hover:bg-app-surface active:bg-app-bg dark:hover:bg-app-subtle-dark';
      case 'tertiary':
        return 'bg-transparent text-danger-ink hover:bg-app-surface active:bg-app-bg dark:hover:bg-app-subtle-dark dark:active:bg-app-subtle-dark';
      case 'dashed':
        return 'bg-transparent border border-dashed border-danger-line text-danger-ink hover:bg-app-surface active:bg-app-bg dark:hover:bg-app-subtle-dark';
    }
  }

  // appearance === 'default'
  switch (variant) {
    case 'primary':
      // #101014 default → #18181C hover → #000000 pressed
      return 'bg-app-ink text-white hover:bg-app-ink-hover active:bg-black border border-app-ink dark:bg-app-ink-dark dark:text-app-bg-dark dark:hover:bg-white';
    case 'secondary':
      return 'bg-white dark:bg-app-card-dark hairline text-app-ink dark:text-app-ink-dark hover:bg-app-surface active:bg-app-bg dark:hover:bg-app-subtle-dark dark:active:bg-app-subtle-dark';
    case 'tertiary':
      return 'bg-transparent text-app-ink dark:text-app-ink-dark hover:bg-app-surface active:bg-app-bg dark:hover:bg-app-subtle-dark dark:active:bg-app-subtle-dark';
    case 'dashed':
      return 'bg-transparent border border-dashed border-app-line dark:border-app-line-dark text-app-ink dark:text-app-ink-dark hover:bg-app-surface active:bg-app-bg dark:hover:bg-app-subtle-dark';
  }
};

const sizeClasses: Record<ButtonSize, string> = {
  // Real DS sizes: small (32px) / medium (40px). Padding from Figma: small 10px h, medium 16px h.
  sm: 'h-8 px-2.5 text-13 gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-13 gap-1.5 rounded-lg',
};

export const Button = ({
  variant = 'primary',
  appearance = 'default',
  size = 'md',
  leadingIcon,
  trailingIcon,
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <button
      type="button"
      disabled={isDisabled}
      data-state={loading ? 'loading' : isDisabled ? 'disabled' : undefined}
      className={[
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg',
        variantClasses(variant, appearance),
        sizeClasses[size],
        isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <span
          className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden="true"
        />
      ) : (
        leadingIcon && (
          <span className="shrink-0 size-4 flex items-center justify-center">{leadingIcon}</span>
        )
      )}
      {children}
      {trailingIcon && !loading && (
        <span className="shrink-0 size-4 flex items-center justify-center">{trailingIcon}</span>
      )}
    </button>
  );
};
