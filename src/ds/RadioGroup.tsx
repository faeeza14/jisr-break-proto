/**
 * DS shim — mirrors @jisr-hr/ds-web RadioGroup API.
 * Storybook: atoms-radiogroup--docs
 * Stories: default-radio-group, radio-group-with-label, vertical-radio-group,
 *          danger-radio-group, radio-cards
 */
import type { ReactNode } from 'react';

interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  appearance?: 'default' | 'danger';
  children: ReactNode;
  className?: string;
  name?: string;
}

interface RadioGroupItemProps {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
  label?: string;
  description?: string;
}

// Context-free implementation — RadioGroupItem reads from nearest RadioGroup via callback
// In real DS this uses Radix RadioGroup context
export const RadioGroup = ({
  value,
  onValueChange: _onValueChange,
  orientation = 'horizontal',
  disabled = false,
  children,
  className = '',
}: RadioGroupProps) => (
  <div
    role="radiogroup"
    className={[
      orientation === 'horizontal' ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2',
      disabled ? 'opacity-40' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    data-value={value}
    onClick={undefined}
  >
    {/* Pass value/onValueChange via DOM data attrs — shim limitation; real DS uses context */}
    {children}
  </div>
);

/** Pill-style radio button — matches DS radio-cards / segmented control pattern */
export const RadioGroupItem = ({
  value,
  disabled = false,
  children,
  label,
}: RadioGroupItemProps & {
  // Shim: parent must manage state and pass isSelected
  isSelected?: boolean;
  onSelect?: (v: string) => void;
}) => (
  <div data-radio-value={value} className={disabled ? 'opacity-40' : ''}>
    {children ?? label}
  </div>
);

/**
 * SegmentedControl — the typical DS radio pattern for type/schedule pickers.
 * Not a real DS component name but the visual pattern matching the radio-cards story.
 */
interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; description?: string }>;
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div className={['flex flex-wrap gap-2', className].join(' ')}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={[
              'inline-flex flex-col items-start px-3 py-2 rounded-lg hairline text-13 transition capitalize',
              active
                ? 'bg-app-ink text-white border-app-ink dark:bg-app-ink-dark dark:text-app-bg'
                : 'bg-white dark:bg-app-card-dark text-app-ink dark:text-app-ink-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark',
              disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="font-medium">{opt.label}</span>
            {opt.description && (
              <span
                className={[
                  'text-11 mt-0.5',
                  active ? 'text-white/70' : 'text-app-mute dark:text-app-mute-dark',
                ].join(' ')}
              >
                {opt.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
