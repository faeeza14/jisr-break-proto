/**
 * DS shim — mirrors @jisr-hr/ds-web InputGroup API.
 * Source: Figma — Wasl DS / Molecules / InputGroup (canvas 9758:82176)
 *
 * Spec from Figma:
 *   Subcomponent: _InputSlot (9594:2715) — addon slot bg #ECFDF3
 *   InputGroup composes multiple Input parts with addons (e.g. currency,
 *   units) sharing one outer chrome. Different from Input's own
 *   startAddon/endAddon which live inside the Input border.
 *
 * Pattern: Single border wraps all parts; visual separators between
 * adjacent inputs/addons; first/last children get matching corner rounding.
 *
 * Usage:
 *   <InputGroup>
 *     <InputGroupAddon>https://</InputGroupAddon>
 *     <InputGroupInput value={v} onChange={...} placeholder="example.com" />
 *     <InputGroupAddon>.com</InputGroupAddon>
 *   </InputGroup>
 *
 *   <InputGroup>
 *     <InputGroupInput value={min} onChange={...} placeholder="Min" />
 *     <InputGroupAddon>—</InputGroupAddon>
 *     <InputGroupInput value={max} onChange={...} placeholder="Max" />
 *   </InputGroup>
 */
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';

interface InputGroupProps {
  children: ReactNode;
  size?: 'sm' | 'md';
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const InputGroup = ({
  children,
  size = 'md',
  disabled = false,
  error = false,
  className = '',
}: InputGroupProps) => (
  <div
    role="group"
    data-disabled={disabled || undefined}
    className={[
      'inline-flex items-stretch w-full rounded-lg hairline overflow-hidden bg-white dark:bg-app-card-dark',
      'divide-x divide-app-line dark:divide-app-line-dark',
      // Focus-within ring uses error color when in error state
      error
        ? 'border-danger-line focus-within:ring-2 focus-within:ring-danger-line/30'
        : 'focus-within:ring-2 focus-within:ring-app-ink/10 dark:focus-within:ring-app-ink-dark/20',
      size === 'sm' ? 'text-13 h-8' : 'text-13 h-9',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </div>
);

interface InputGroupAddonProps {
  children: ReactNode;
  /** Position hint — only affects subtle styling like text alignment */
  position?: 'leading' | 'trailing' | 'center';
  className?: string;
  /** Render as a button (use for prefix/suffix actions like clear) */
  asButton?: boolean;
  onClick?: () => void;
}

export const InputGroupAddon = ({
  children,
  position = 'center',
  className = '',
  asButton = false,
  onClick,
}: InputGroupAddonProps) => {
  const cls = [
    'inline-flex items-center justify-center px-2.5 text-13 select-none whitespace-nowrap',
    'bg-app-surface dark:bg-app-subtle-dark text-app-mute dark:text-app-mute-dark',
    asButton ? 'hover:bg-app-subtle dark:hover:bg-app-subtle-dark cursor-pointer' : '',
    position === 'leading' ? 'pr-2' : position === 'trailing' ? 'pl-2' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (asButton) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }
  return <span className={cls}>{children}</span>;
};

interface InputGroupInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** controlled value */
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const InputGroupInput = ({
  value,
  onChange,
  className = '',
  ...rest
}: InputGroupInputProps) => (
  <input
    value={value}
    onChange={onChange}
    className={[
      'flex-1 min-w-0 bg-transparent px-3 text-app-ink dark:text-app-ink-dark placeholder:text-app-faint focus:outline-none',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);
