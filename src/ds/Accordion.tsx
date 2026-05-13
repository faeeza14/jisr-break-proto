/**
 * DS shim — mirrors @jisr-hr/ds-web Accordion API.
 * Storybook: molecules-accordion--docs
 * Stories: default-accordion, small/large accordion, multiple-accordion,
 *          controlled-single-accordion, borderless-accordion
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type AccordionSize = 'xs' | 'sm' | 'md' | 'lg';
type AccordionType = 'single' | 'multiple';

interface AccordionContextValue {
  open: Set<string>;
  toggle: (value: string) => void;
  type: AccordionType;
  size: AccordionSize;
  borderless: boolean;
}

const AccordionCtx = createContext<AccordionContextValue>({
  open: new Set(),
  toggle: () => {},
  type: 'single',
  size: 'md',
  borderless: false,
});

interface AccordionProps {
  type?: AccordionType;
  size?: AccordionSize;
  borderless?: boolean;
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (v: string | string[]) => void;
  children: ReactNode;
  className?: string;
}

export const Accordion = ({
  type = 'single',
  size = 'md',
  borderless = false,
  collapsible = true,
  defaultValue,
  children,
  className = '',
}: AccordionProps) => {
  const initSet = new Set(
    defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : [],
  );
  const [open, setOpen] = useState<Set<string>>(initSet);

  const toggle = (value: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        if (collapsible) next.delete(value);
      } else {
        if (type === 'single') next.clear();
        next.add(value);
      }
      return next;
    });
  };

  return (
    <AccordionCtx.Provider value={{ open, toggle, type, size, borderless }}>
      <div className={['divide-y divide-app-line dark:divide-app-line-dark', borderless ? '' : 'rounded-lg hairline overflow-hidden', className].filter(Boolean).join(' ')}>
        {children}
      </div>
    </AccordionCtx.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const AccordionItem = ({ value, children, disabled = false, className = '' }: AccordionItemProps) => (
  <div data-accordion-item={value} className={[disabled ? 'opacity-40' : '', className].filter(Boolean).join(' ')}>
    {children}
  </div>
);

const sizeClasses: Record<AccordionSize, string> = {
  xs: 'px-3 py-1.5 text-11',
  sm: 'px-3 py-2 text-11',
  md: 'px-4 py-3 text-13',
  lg: 'px-4 py-4 text-13',
};

interface AccordionTriggerProps {
  value: string;
  children: ReactNode;
  badge?: ReactNode;
  leadingAvatar?: ReactNode;
  className?: string;
}

export const AccordionTrigger = ({ value, children, badge, leadingAvatar, className = '' }: AccordionTriggerProps) => {
  const { open, toggle, size } = useContext(AccordionCtx);
  const isOpen = open.has(value);

  return (
    <button
      type="button"
      onClick={() => toggle(value)}
      aria-expanded={isOpen}
      className={[
        'w-full flex items-center justify-between gap-2 font-medium text-app-ink dark:text-app-ink-dark hover:bg-app-subtle/50 dark:hover:bg-app-subtle-dark transition-colors',
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="flex items-center gap-2 min-w-0">
        {leadingAvatar}
        <span className="truncate">{children}</span>
        {badge}
      </span>
      <ChevronDown
        className={['size-4 shrink-0 text-app-mute transition-transform', isOpen ? 'rotate-180' : ''].join(' ')}
      />
    </button>
  );
};

interface AccordionContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const AccordionContent = ({ value, children, className = '' }: AccordionContentProps) => {
  const { open, size } = useContext(AccordionCtx);
  if (!open.has(value)) return null;
  return (
    <div className={[sizeClasses[size], 'pt-0 text-app-mute dark:text-app-mute-dark border-t border-app-line dark:border-app-line-dark', className].join(' ')}>
      {children}
    </div>
  );
};
