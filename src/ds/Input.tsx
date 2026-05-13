/**
 * DS shim — mirrors @jisr-hr/ds-web Input API.
 * Source: Figma — Wasl DS / Atoms / Input (canvas 9594:517)
 *
 * Real DS variant matrix:
 *   variant:     borderless | outlined | underlined
 *   appearance:  default | danger | success
 *   size:        small (32px) | medium (40px)
 *   state:       default | hover | focused        (driven by :hover / :focus)
 *   disabled:    true | false
 *   readOnly:    true | false
 *   filled:      true | false                     (purely visual — whether a value is set)
 *
 * Sizes from Figma:
 *   small  → height 32px, horizontal padding 12px, text 13px
 *   medium → height 40px, horizontal padding 16px, text 13px
 *
 * Colors from Figma:
 *   border default       → app-subtle (#E8E8F0)
 *   border hover/focused → app-ink (#101014)
 *   border disabled      → #BDBDCA (rendered via opacity-40)
 *   border danger        → danger-line (#F04437)
 *   border success       → ok-line (#039754)
 *   text                 → app-ink (#101014)
 *   placeholder          → app-faint (#6B6B75)
 */
import type { InputHTMLAttributes, ReactNode } from 'react';

type InputVariant = 'borderless' | 'outlined' | 'underlined';
type InputAppearance = 'default' | 'danger' | 'success';
type InputSize = 'sm' | 'md';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  appearance?: InputAppearance;
  size?: InputSize;
  startAddon?: ReactNode;
  endAddon?: ReactNode;
}

/**
 * Builds the className set for variant × appearance.
 * Returns chrome (border/bg) classes only — sizes are layered separately.
 */
const chromeClasses = (variant: InputVariant, appearance: InputAppearance): string => {
  // border color picks
  const borderColor =
    appearance === 'danger'
      ? 'border-danger-line'
      : appearance === 'success'
        ? 'border-ok-line'
        : 'border-app-subtle dark:border-app-line-dark';

  const focusBorderColor =
    appearance === 'danger'
      ? 'focus:border-danger-ink'
      : appearance === 'success'
        ? 'focus:border-ok-ink'
        : 'focus:border-app-ink dark:focus:border-app-ink-dark';

  switch (variant) {
    case 'outlined':
      return `bg-transparent border ${borderColor} ${focusBorderColor} focus:outline-none`;
    case 'underlined':
      return `bg-transparent border-0 border-b ${borderColor} ${focusBorderColor} rounded-none focus:outline-none px-0`;
    case 'borderless':
    default:
      // borderless = filled-style: 1px hairline border + white card surface
      return `bg-white dark:bg-app-card-dark border ${borderColor} ${focusBorderColor} focus:outline-none`;
  }
};

const sizeClasses: Record<InputSize, string> = {
  // Real DS heights/paddings from Figma
  sm: 'h-8 px-3 text-13',
  md: 'h-10 px-4 text-13',
};

const sizeAddonOffset: Record<InputSize, { start: string; end: string }> = {
  sm: { start: 'pl-8', end: 'pr-8' },
  md: { start: 'pl-10', end: 'pr-10' },
};

export const Input = ({
  variant = 'borderless',
  appearance = 'default',
  size = 'md',
  startAddon,
  endAddon,
  className = '',
  disabled,
  readOnly,
  ...rest
}: InputProps) => {
  const baseChrome = chromeClasses(variant, appearance);
  const sizeCls = sizeClasses[size];
  const offsets = sizeAddonOffset[size];
  const commonCls = [
    'w-full rounded-lg transition-colors placeholder:text-app-faint dark:placeholder:text-app-faint-dark text-app-ink dark:text-app-ink-dark',
    baseChrome,
    sizeCls,
    disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-app-faint dark:hover:border-app-mute-dark',
    readOnly ? 'bg-app-surface dark:bg-app-subtle-dark cursor-default' : '',
    className,
  ];

  if (startAddon || endAddon) {
    return (
      <div className="relative flex items-center">
        {startAddon && (
          <span className="absolute left-3 text-app-faint dark:text-app-faint-dark pointer-events-none">
            {startAddon}
          </span>
        )}
        <input
          disabled={disabled}
          readOnly={readOnly}
          className={[...commonCls, startAddon ? offsets.start : '', endAddon ? offsets.end : '']
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {endAddon && (
          <span className="absolute right-3 text-app-faint dark:text-app-faint-dark">
            {endAddon}
          </span>
        )}
      </div>
    );
  }
  return (
    <input
      disabled={disabled}
      readOnly={readOnly}
      className={commonCls.filter(Boolean).join(' ')}
      {...rest}
    />
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: InputVariant;
  appearance?: InputAppearance;
  rows?: number;
}

export const Textarea = ({
  variant = 'borderless',
  appearance = 'default',
  className = '',
  disabled,
  readOnly,
  rows = 3,
  ...rest
}: TextareaProps) => (
  <textarea
    rows={rows}
    disabled={disabled}
    readOnly={readOnly}
    className={[
      'w-full rounded-lg transition-colors placeholder:text-app-faint dark:placeholder:text-app-faint-dark text-app-ink dark:text-app-ink-dark px-4 py-3 text-13 resize-y',
      chromeClasses(variant, appearance),
      disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-app-faint dark:hover:border-app-mute-dark',
      readOnly ? 'bg-app-surface dark:bg-app-subtle-dark cursor-default' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);
