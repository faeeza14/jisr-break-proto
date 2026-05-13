/**
 * DS shim — mirrors @jisr-hr/ds-web Tabs API.
 * Storybook: molecules-tabs--docs
 * Stories: default, with-icons-only, controlled, with-overflow-horizontal
 *
 * API follows Radix UI Tabs pattern (same as real DS).
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

interface TabsContextValue {
  value: string;
  onValueChange: (v: string) => void;
}

const TabsCtx = createContext<TabsContextValue>({ value: '', onValueChange: () => {} });

interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}

export const Tabs = ({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  children,
  className = '',
}: TabsProps) => {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;
  const handleChange = (v: string) => {
    if (controlledValue === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsCtx.Provider value={{ value, onValueChange: handleChange }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList = ({ children, className = '' }: TabsListProps) => (
  <div
    role="tablist"
    className={[
      'flex items-center gap-x-1 border-b border-app-line dark:border-app-line-dark overflow-x-auto',
      className,
    ].join(' ')}
  >
    {children}
  </div>
);

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export const TabsTrigger = ({
  value,
  children,
  disabled = false,
  leadingIcon,
  badge,
  className = '',
}: TabsTriggerProps) => {
  const ctx = useContext(TabsCtx);
  const active = ctx.value === value;
  return (
    <button
      role="tab"
      type="button"
      aria-selected={active}
      disabled={disabled}
      onClick={() => !disabled && ctx.onValueChange(value)}
      className={[
        'relative inline-flex items-center gap-1.5 pb-2.5 pt-1 -mb-px border-b-2 text-13 whitespace-nowrap transition-colors focus:outline-none',
        active
          ? 'border-app-ink dark:border-app-ink-dark text-app-ink dark:text-app-ink-dark font-medium'
          : 'border-transparent text-app-mute dark:text-app-mute-dark hover:text-app-ink dark:hover:text-app-ink-dark',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {leadingIcon && <span className="shrink-0 size-4">{leadingIcon}</span>}
      {children}
      {badge}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent = ({ value, children, className = '' }: TabsContentProps) => {
  const ctx = useContext(TabsCtx);
  if (ctx.value !== value) return null;
  return <div role="tabpanel" className={className}>{children}</div>;
};
