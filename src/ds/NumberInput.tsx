/**
 * DS shim — mirrors @jisr-hr/ds-web NumberInput API.
 * Storybook: molecules-numberinput--docs
 * Stories: default-number-input, number-input-with-addons, without-step-controls,
 *          formatter-and-parser
 */
import type { ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  showStepControls?: boolean;
  startAddon?: ReactNode;
  endAddon?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  formatter?: (v: number) => string;
  parser?: (s: string) => number;
}

export const NumberInput = ({
  value = 0,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  readOnly = false,
  placeholder,
  showStepControls = true,
  startAddon,
  endAddon,
  size = 'md',
  className = '',
  formatter,
  parser,
}: NumberInputProps) => {
  const canDec = min === undefined || value - step >= min;
  const canInc = max === undefined || value + step <= max;

  const decrement = () => {
    if (!disabled && !readOnly && canDec) onChange?.(value - step);
  };
  const increment = () => {
    if (!disabled && !readOnly && canInc) onChange?.(value + step);
  };

  const display = formatter ? formatter(value) : String(value);
  const h = size === 'sm' ? 'h-7' : 'h-9';
  const textSize = size === 'sm' ? 'text-11' : 'text-13';

  return (
    <div
      className={[
        'inline-flex items-center rounded-lg hairline bg-white dark:bg-app-card-dark overflow-hidden focus-within:ring-2 focus-within:ring-app-ink',
        disabled ? 'opacity-40' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {startAddon && (
        <span className="px-2.5 text-app-faint dark:text-app-faint-dark border-r border-app-line dark:border-app-line-dark h-full flex items-center text-13">
          {startAddon}
        </span>
      )}
      {showStepControls && (
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || !canDec}
          className="flex items-center justify-center px-2 text-app-mute hover:text-app-ink dark:hover:text-app-ink-dark disabled:opacity-30 transition"
        >
          <Minus className="size-3.5" />
        </button>
      )}
      <input
        type="text"
        value={display}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        onChange={(e) => {
          const parsed = parser ? parser(e.target.value) : parseFloat(e.target.value);
          if (!isNaN(parsed)) onChange?.(parsed);
        }}
        className={[
          'flex-1 min-w-0 bg-transparent outline-none text-center text-app-ink dark:text-app-ink-dark placeholder:text-app-faint',
          h,
          textSize,
          showStepControls ? 'w-16' : 'px-3 w-full text-left',
        ].join(' ')}
      />
      {showStepControls && (
        <button
          type="button"
          onClick={increment}
          disabled={disabled || !canInc}
          className="flex items-center justify-center px-2 text-app-mute hover:text-app-ink dark:hover:text-app-ink-dark disabled:opacity-30 transition"
        >
          <Plus className="size-3.5" />
        </button>
      )}
      {endAddon && (
        <span className="px-2.5 text-app-faint dark:text-app-faint-dark border-l border-app-line dark:border-app-line-dark h-full flex items-center text-13">
          {endAddon}
        </span>
      )}
    </div>
  );
};
