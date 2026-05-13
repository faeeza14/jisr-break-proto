/**
 * DS shim — mirrors @jisr-hr/ds-web Popover API.
 * Source: Figma — Wasl DS / Molecules / Popover (componentSet 9497:972)
 *
 * Spec from Figma:
 *   widthMin: 160px, widthMax: 320px
 *   propertyDefinitions: close (bool — show X button), arrow (bool)
 *   Variants: side=bottom | top
 *   Header style: predefined for consistent text-style + spacing
 *
 * Different from DropdownMenu — Popover hosts arbitrary content, not menu items.
 * Different from Tooltip — Popover is interactive (focusable, clickable).
 *
 * API mirrors Radix Popover:
 *   <Popover>
 *     <PopoverTrigger>Open</PopoverTrigger>
 *     <PopoverContent>
 *       <PopoverHeader title="..." onClose={...} />
 *       …body…
 *     </PopoverContent>
 *   </Popover>
 */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';

type Side = 'bottom' | 'top';

interface PopoverContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

const usePopover = () => {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error('Popover* must be used within <Popover>');
  return ctx;
};

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: ReactNode;
}

export const Popover = ({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <span className="relative inline-block">{children}</span>
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export const PopoverTrigger = ({
  children,
  className = '',
  ...rest
}: PopoverTriggerProps) => {
  const { open, setOpen, triggerRef } = usePopover();
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={() => setOpen(!open)}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
};

interface PopoverContentProps {
  side?: Side;
  align?: 'start' | 'center' | 'end';
  className?: string;
  /** Spec: widthMin 160, widthMax 320 — caller can override */
  minWidth?: number;
  maxWidth?: number;
  children: ReactNode;
}

export const PopoverContent = ({
  side = 'bottom',
  align = 'start',
  className = '',
  minWidth = 160,
  maxWidth = 320,
  children,
}: PopoverContentProps) => {
  const { open, setOpen, triggerRef } = usePopover();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        contentRef.current && !contentRef.current.contains(t) &&
        triggerRef.current && !triggerRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  const sideCls = side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2';
  const alignCls =
    align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2';

  return (
    <div
      ref={contentRef}
      role="dialog"
      className={[
        // Same surface treatment as Dropdown: bg-white, hairline, 8px radius, soft shadow
        'absolute z-50 rounded-lg overflow-hidden',
        'bg-white dark:bg-app-card-dark',
        'border border-app-line dark:border-app-line-dark',
        'shadow-[0_0_24px_0_rgba(0,0,0,0.08)]',
        sideCls,
        alignCls,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ minWidth, maxWidth }}
    >
      {children}
    </div>
  );
};

interface PopoverHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** When set, renders a close button — calls this on click */
  onClose?: () => void;
  className?: string;
}

/**
 * PredefinedPopoverHeader pattern from Figma — title + optional close.
 * Use this for consistency rather than rolling your own header markup.
 */
export const PopoverHeader = ({
  title,
  description,
  onClose,
  className = '',
}: PopoverHeaderProps) => {
  const { setOpen } = usePopover();
  return (
    <div
      className={[
        'flex items-start gap-2 p-3 border-b border-app-line dark:border-app-line-dark',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex-1 min-w-0">
        <div className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{title}</div>
        {description && (
          <div className="mt-0.5 text-11 text-app-mute dark:text-app-mute-dark">{description}</div>
        )}
      </div>
      {onClose !== undefined && (
        <button
          type="button"
          onClick={() => {
            onClose?.();
            setOpen(false);
          }}
          className="shrink-0 size-6 inline-flex items-center justify-center rounded-md text-app-mute hover:bg-app-surface dark:hover:bg-app-subtle-dark transition"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
};

export const PopoverBody = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={['p-3 text-13 text-app-ink dark:text-app-ink-dark', className]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </div>
);

export const PopoverFooter = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={[
      'flex items-center justify-end gap-2 p-3 border-t border-app-line dark:border-app-line-dark',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </div>
);
