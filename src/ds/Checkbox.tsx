/**
 * DS shim — mirrors @jisr-hr/ds-web Checkbox API.
 * Storybook: atoms-checkbox--docs
 * Stories: default-checkbox, indeterminate-checkbox, disabled-checkbox
 */
import type { HTMLAttributes } from 'react';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  appearance?: 'default' | 'danger';
  size?: 'sm' | 'md';
}

export const Checkbox = ({
  checked = false,
  indeterminate = false,
  onCheckedChange,
  disabled = false,
  appearance = 'default',
  size = 'md',
  ...rest
}: CheckboxProps) => {
  const boxSize = size === 'sm' ? 'size-3.5' : 'size-4';
  const iconSize = size === 'sm' ? 'size-2.5' : 'size-3';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={[
        'inline-flex items-center justify-center rounded transition focus:outline-none focus-visible:ring-2 focus-visible:ring-app-ink',
        boxSize,
        checked || indeterminate
          ? appearance === 'danger'
            ? 'bg-danger-ink border-0'
            : 'bg-app-ink dark:bg-app-ink-dark border-0'
          : appearance === 'danger'
            ? 'hairline border-danger-line bg-white dark:bg-app-card-dark'
            : 'hairline bg-white dark:bg-app-card-dark',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {indeterminate ? (
        <Minus className={[iconSize, 'text-white'].join(' ')} />
      ) : checked ? (
        <Check className={[iconSize, 'text-white'].join(' ')} />
      ) : null}
    </button>
  );
};
