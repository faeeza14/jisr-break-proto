import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'danger';
};

export const Card = ({ children, className = '', tone = 'default' }: Props) => {
  const toneClass =
    tone === 'danger'
      ? 'bg-danger-bg/40 dark:bg-danger-bg-dark/30 border-danger-line/60'
      : 'bg-white dark:bg-app-card-dark hairline';
  return (
    <section className={`${toneClass} rounded-card p-4 sm:p-[18px] ${className}`}>{children}</section>
  );
};

export const CardSectionLabel = ({ children }: { children: ReactNode }) => (
  <div className="label-caps mb-3">{children}</div>
);
