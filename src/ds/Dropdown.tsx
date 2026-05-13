/**
 * DS shim — mirrors @jisr-hr/ds-web DropdownMenu API.
 * Source: Figma — Wasl DS / Molecules / Dropdown (componentSet 3020:4610)
 *
 * Spec from Figma:
 *   Variants: side=bottom | top (positioning)
 *   Boolean props: label, arrow, group 2/3/4 (group toggles)
 *   Content: bg #FFFFFF, stroke #E8E8F0 1px, radius 8px, padding 4px,
 *            shadow 0 0 24px rgba(0,0,0,0.08), min-width 200px
 *
 * API mirrors Radix DropdownMenu:
 *   <DropdownMenu>
 *     <DropdownMenuTrigger>Open</DropdownMenuTrigger>
 *     <DropdownMenuContent side="bottom">
 *       <DropdownMenuItem onSelect={...}>One</DropdownMenuItem>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem disabled>Two</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
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

type Side = 'bottom' | 'top';

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdown = () => {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('DropdownMenu* must be used within <DropdownMenu>');
  return ctx;
};

interface DropdownMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: ReactNode;
}

export const DropdownMenu = ({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: DropdownMenuProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <span className="relative inline-block">{children}</span>
    </DropdownContext.Provider>
  );
};

interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean; // Not actually wired — kept for API parity
  children: ReactNode;
}

export const DropdownMenuTrigger = ({
  children,
  className = '',
  ...rest
}: DropdownMenuTriggerProps) => {
  const { open, setOpen, triggerRef } = useDropdown();
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={() => setOpen(!open)}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
};

interface DropdownMenuContentProps {
  side?: Side;
  align?: 'start' | 'center' | 'end';
  className?: string;
  children: ReactNode;
}

export const DropdownMenuContent = ({
  side = 'bottom',
  align = 'start',
  className = '',
  children,
}: DropdownMenuContentProps) => {
  const { open, setOpen, triggerRef } = useDropdown();
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

  const sideCls = side === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1';
  const alignCls =
    align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2';

  return (
    <div
      ref={contentRef}
      role="menu"
      className={[
        // Spec: bg white, stroke #E8E8F0 1px, radius 8px, padding 4px, shadow
        'absolute z-50 min-w-[200px] rounded-lg p-1',
        'bg-white dark:bg-app-card-dark',
        'border border-app-line dark:border-app-line-dark',
        'shadow-popover',
        sideCls,
        alignCls,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

interface DropdownMenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  disabled?: boolean;
  destructive?: boolean;
  /** Triggered on click. Closes the menu after fire. */
  onSelect?: () => void;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Optional secondary line under the primary label */
  description?: string;
  children?: ReactNode;
}

/**
 * Mirrors the Item component states (15923:59645):
 *   default → transparent, hover → #F9F9FC, pressed → #F3F3F8
 *   borderRadius 8px, gap 8px, padding 8px
 */
export const DropdownMenuItem = ({
  disabled = false,
  destructive = false,
  onSelect,
  leadingIcon,
  trailingIcon,
  description,
  children,
  className = '',
  ...rest
}: DropdownMenuItemProps) => {
  const { setOpen } = useDropdown();
  return (
    <div
      role="menuitem"
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (disabled) return;
        onSelect?.();
        setOpen(false);
      }}
      className={[
        'flex items-center gap-2 rounded-lg px-2 py-2 text-13 select-none transition-colors',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : destructive
            ? 'text-danger-ink hover:bg-danger-bg dark:hover:bg-danger-bg-dark cursor-pointer'
            : 'text-app-ink dark:text-app-ink-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark active:bg-app-subtle dark:active:bg-app-subtle-dark cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {leadingIcon && (
        <span className="shrink-0 inline-flex size-4 items-center justify-center">{leadingIcon}</span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block truncate">{children}</span>
        {description && (
          <span className="block text-11 text-app-mute dark:text-app-mute-dark truncate">
            {description}
          </span>
        )}
      </span>
      {trailingIcon && (
        <span className="shrink-0 inline-flex size-4 items-center justify-center text-app-mute">
          {trailingIcon}
        </span>
      )}
    </div>
  );
};

export const DropdownMenuSeparator = () => (
  <div
    role="separator"
    className="my-1 h-px bg-app-line dark:bg-app-line-dark"
  />
);

interface DropdownMenuLabelProps {
  children: ReactNode;
  className?: string;
}

export const DropdownMenuLabel = ({ children, className = '' }: DropdownMenuLabelProps) => (
  <div
    className={[
      'px-2 py-1.5 text-11 font-medium uppercase tracking-[0.08em] text-app-faint dark:text-app-faint-dark',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </div>
);
