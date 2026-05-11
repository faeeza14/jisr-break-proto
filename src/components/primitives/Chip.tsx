import type { ReactNode } from 'react';

type Tone = 'gray' | 'info' | 'warn' | 'ok' | 'danger';

const toneMap: Record<Tone, string> = {
  gray: 'bg-app-subtle dark:bg-app-subtle-dark text-app-ink dark:text-app-ink-dark',
  info: 'bg-info-bg dark:bg-info-bg-dark text-info-ink dark:text-info-ink-dark',
  warn: 'bg-warn-bg dark:bg-warn-bg-dark text-warn-ink dark:text-warn-ink-dark',
  ok: 'bg-ok-bg dark:bg-ok-bg-dark text-ok-ink dark:text-ok-ink-dark',
  danger: 'bg-danger-bg dark:bg-danger-bg-dark text-danger-ink dark:text-danger-ink-dark',
};

export const Chip = ({
  tone = 'gray',
  children,
  className = '',
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-11 font-medium ${toneMap[tone]} ${className}`}
  >
    {children}
  </span>
);
