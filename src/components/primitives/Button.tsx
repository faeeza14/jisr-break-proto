import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const variantMap: Record<Variant, string> = {
  primary:
    'bg-app-ink text-white hover:opacity-90 dark:bg-app-ink-dark dark:text-app-ink disabled:opacity-40',
  secondary:
    'bg-white dark:bg-app-card-dark hairline text-app-ink dark:text-app-ink-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark disabled:opacity-40',
  ghost:
    'bg-transparent text-app-mute dark:text-app-mute-dark hover:text-app-ink dark:hover:text-app-ink-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark',
  danger:
    'bg-danger-ink text-white hover:opacity-90 disabled:opacity-40',
};

const sizeMap: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-11',
  md: 'h-9 px-3.5 text-13',
};

export const Button = ({ variant = 'secondary', size = 'md', className = '', children, ...rest }: Props) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition focus-ring ${variantMap[variant]} ${sizeMap[size]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
