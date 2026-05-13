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
      interactive && !disabled
        ? 'cursor-pointer hover:bg-app-subtle/40 dark:hover:bg-app-subtle-dark/40 transition-colors'
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
