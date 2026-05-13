/**
 * DS shim — mirrors @jisr-hr/ds-web Card API.
 * Storybook: molecules-card--docs
 * Stories: predefined-static-card, predefined-interactive-card, customised-card-content
 */
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  interactive?: boolean;
  disabled?: boolean;
}

export const Card = ({
  children,
  interactive = false,
  disabled = false,
  className = '',
  onClick,
  ...rest
}: CardProps) => (
  <div
    role={interactive ? 'button' : undefined}
    tabIndex={interactive && !disabled ? 0 : undefined}
    onClick={!disabled ? onClick : undefined}
    className={[
      'bg-white dark:bg-app-card-dark rounded-card hairline p-4 sm:p-[18px]',
      // State pattern from DS Item spec: default → white | hover → app-surface | pressed → app-bg
      interactive && !disabled
        ? 'cursor-pointer transition-colors hover:bg-app-surface active:bg-app-bg dark:hover:bg-app-subtle-dark dark:active:bg-app-subtle-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2'
        : '',
      disabled ? 'opacity-40 cursor-not-allowed' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  >
    {children}
  </div>
);

/** Section label inside a Card — matching DS CardSectionLabel convention */
export const CardSection = ({
  title,
  children,
  className = '',
}: {
  title?: string;
  children?: ReactNode;
  className?: string;
}) => (
  <div className={className}>
    {title && (
      <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium mb-3">
        {title}
      </p>
    )}
    {children}
  </div>
);
