/**
 * DS shim — mirrors @jisr-hr/ds-web Switch API.
 * Storybook: atoms-switch--docs
 * Stories: default-switch, checked-switch, disabled-switch, checked-disabled-switch
 */
import type { HTMLAttributes } from 'react';

interface SwitchProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Switch = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  size = 'md',
  ...rest
}: SwitchProps) => {
  const trackW = size === 'sm' ? 'w-7' : 'w-9';
  const trackH = size === 'sm' ? 'h-4' : 'h-5';
  const thumbSize = size === 'sm' ? 'size-3' : 'size-4';
  const translateOn = size === 'sm' ? 'translate-x-3' : 'translate-x-4';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={[
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2',
        trackW,
        trackH,
        checked
          ? 'bg-app-ink dark:bg-app-ink-dark'
          : 'bg-app-subtle dark:bg-app-subtle-dark hairline',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <span
        className={[
          'inline-block rounded-full bg-white shadow-sm transition-transform',
          thumbSize,
          checked ? translateOn : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
};
