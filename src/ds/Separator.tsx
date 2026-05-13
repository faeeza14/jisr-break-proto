/**
 * DS shim — mirrors @jisr-hr/ds-web Separator API.
 * Storybook: atoms-separator--docs
 * Stories: horizontal-separator, vertical-separator
 */

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator = ({
  orientation = 'horizontal',
  className = '',
}: SeparatorProps) => (
  <div
    role="separator"
    aria-orientation={orientation}
    className={[
      orientation === 'horizontal'
        ? 'w-full border-t border-app-line dark:border-app-line-dark'
        : 'h-full border-l border-app-line dark:border-app-line-dark self-stretch',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  />
);
