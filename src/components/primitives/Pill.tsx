import type { ReactNode } from 'react';

type Tone = 'green' | 'amber' | 'red' | 'blue' | 'neutral';

const toneMap: Record<Tone, string> = {
  green: 'bg-ok-bg dark:bg-ok-bg-dark text-ok-ink dark:text-ok-ink-dark',
  amber: 'bg-warn-bg dark:bg-warn-bg-dark text-warn-ink dark:text-warn-ink-dark',
  red: 'bg-danger-bg dark:bg-danger-bg-dark text-danger-ink dark:text-danger-ink-dark',
  blue: 'bg-info-bg dark:bg-info-bg-dark text-info-ink dark:text-info-ink-dark',
  neutral: 'bg-app-subtle dark:bg-app-subtle-dark text-app-mute dark:text-app-mute-dark',
};

export const Pill = ({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-11 font-medium ${toneMap[tone]} ${className}`}
  >
    {children}
  </span>
);
