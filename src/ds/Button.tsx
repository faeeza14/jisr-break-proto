/**
 * DS shim — mirrors @jisr-hr/ds-web Button API.
 * Storybook: atoms-button--docs
 * Variants confirmed from story names:
 *   default-button, small-secondary-button, danger-dashed-button,
 *   loading-tertiary-button, button-with-leading-icon, button-with-trailing-icon
 */
import type { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  asChild?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-app-ink text-white hover:opacity-90 dark:bg-app-ink-dark dark:text-app-bg active:scale-[0.98]',
  secondary:
    'bg-white dark:bg-app-card-dark hairline text-app-ink dark:text-app-ink-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark active:scale-[0.98]',
  tertiary:
    'bg-app-subtle dark:bg-app-subtle-dark text-app-ink dark:text-app-ink-dark hover:bg-app-line hover:dark:bg-app-subtle-dark active:scale-[0.98]',
  ghost:
    'bg-transparent text-app-mute dark:text-app-mute-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark active:scale-[0.98]',
  danger:
    'bg-danger-bg dark:bg-danger-bg-dark text-danger-ink dark:text-danger-ink-dark hover:opacity-90 hairline border-danger-line active:scale-[0.98]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-11 gap-1 rounded-md',
  md: 'h-9 px-3.5 text-13 gap-1.5 rounded-lg',
  lg: 'h-10 px-4 text-13 gap-1.5 rounded-lg',
};

export const Button = ({
  variant = 'primary',
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
      className={[
        'inline-flex items-center justify-center font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        leadingIcon && <span className="shrink-0 size-4 flex items-center justify-center">{leadingIcon}</span>
      )}
      {children}
      {trailingIcon && !loading && (
        <span className="shrink-0 size-4 flex items-center justify-center">{trailingIcon}</span>
      )}
    </button>
  );
};
