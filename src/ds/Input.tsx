/**
 * DS shim — mirrors @jisr-hr/ds-web Input API.
 * Storybook: atoms-input--docs
 * Stories: default-input, outlined-variant, danger-appearance, success-appearance,
 *          small-size, disabled-state, read-only-state, search-input
 */
import type { InputHTMLAttributes } from 'react';

type InputAppearance = 'default' | 'outlined' | 'danger' | 'success' | 'underlined';
type InputSize = 'sm' | 'md';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  appearance?: InputAppearance;
  size?: InputSize;
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
}

const appearanceClasses: Record<InputAppearance, string> = {
  default:
    'bg-white dark:bg-app-card-dark hairline focus:ring-2 focus:ring-app-ink focus:border-transparent',
  outlined:
    'bg-transparent border-2 border-app-line dark:border-app-line-dark focus:border-app-ink dark:focus:border-app-ink-dark focus:ring-0',
  danger:
    'bg-white dark:bg-app-card-dark border border-danger-line focus:ring-2 focus:ring-danger-ink focus:border-transparent',
  success:
    'bg-white dark:bg-app-card-dark border border-ok-ink/40 focus:ring-2 focus:ring-ok-ink focus:border-transparent',
  underlined:
    'bg-transparent border-0 border-b border-app-line dark:border-app-line-dark rounded-none focus:border-app-ink dark:focus:border-app-ink-dark focus:ring-0 px-0',
};

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-7 px-2.5 text-11',
  md: 'h-9 px-3 text-13',
};

export const Input = ({
  appearance = 'default',
  size = 'md',
  startAddon,
  endAddon,
  className = '',
  disabled,
  readOnly,
  ...rest
}: InputProps) => {
  if (startAddon || endAddon) {
    return (
      <div className="relative flex items-center">
        {startAddon && (
          <span className="absolute left-3 text-app-faint dark:text-app-faint-dark">{startAddon}</span>
        )}
        <input
          disabled={disabled}
          readOnly={readOnly}
          className={[
            'w-full rounded-lg outline-none transition placeholder:text-app-faint dark:placeholder:text-app-faint-dark text-app-ink dark:text-app-ink-dark',
            appearanceClasses[appearance],
            sizeClasses[size],
            startAddon ? 'pl-9' : '',
            endAddon ? 'pr-9' : '',
            disabled || readOnly ? 'opacity-50 cursor-not-allowed' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {endAddon && (
          <span className="absolute right-3 text-app-faint dark:text-app-faint-dark">{endAddon}</span>
        )}
      </div>
    );
  }
  return (
    <input
      disabled={disabled}
      readOnly={readOnly}
      className={[
        'w-full rounded-lg outline-none transition placeholder:text-app-faint dark:placeholder:text-app-faint-dark text-app-ink dark:text-app-ink-dark',
        appearanceClasses[appearance],
        sizeClasses[size],
        disabled || readOnly ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
};

export const Textarea = ({
  appearance = 'default',
  className = '',
  disabled,
  readOnly,
  rows = 3,
  ...rest
}: Omit<InputProps, 'size' | 'startAddon' | 'endAddon'> & {
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    rows={rows}
    disabled={disabled}
    readOnly={readOnly}
    className={[
      'w-full rounded-lg outline-none transition placeholder:text-app-faint dark:placeholder:text-app-faint-dark text-app-ink dark:text-app-ink-dark px-3 py-2 text-13 resize-y',
      appearanceClasses[appearance],
      disabled || readOnly ? 'opacity-50 cursor-not-allowed' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);
