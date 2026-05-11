import type { ReactNode } from 'react';

export const Field = ({
  label,
  hint,
  children,
  className = '',
  badge,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  badge?: ReactNode;
}) => (
  <label className={`block ${className}`}>
    <span className="flex items-center gap-2 mb-1.5">
      <span className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{label}</span>
      {badge}
    </span>
    {children}
    {hint ? (
      <span className="block text-11 text-app-mute dark:text-app-mute-dark mt-1.5">{hint}</span>
    ) : null}
  </label>
);
