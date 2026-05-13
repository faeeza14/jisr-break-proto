/**
 * DS shim — mirrors @jisr-hr/ds-web Drawer API.
 * Storybook: molecules-drawer--docs
 * Stories: default, controlled, with-form
 *
 * Right-side sliding panel, same API shape as real DS Drawer.
 */
import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export const Drawer = ({ open = false, onOpenChange, children }: DrawerProps) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/50 transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => onOpenChange?.(false)}
      />
      {/* Panel */}
      <div
        className={[
          'fixed inset-y-0 right-0 z-40 flex flex-col w-full sm:w-[420px] bg-white dark:bg-app-card-dark hairline border-r-0 transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  );
};

export const DrawerHeader = ({
  children,
  onClose,
  className = '',
}: {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}) => (
  <div
    className={[
      'flex items-center justify-between px-5 py-3.5 border-b border-app-line dark:border-app-line-dark shrink-0',
      className,
    ].join(' ')}
  >
    <div>{children}</div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="size-7 inline-flex items-center justify-center rounded-md text-app-mute hover:bg-app-subtle dark:hover:bg-app-subtle-dark transition"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>
    )}
  </div>
);

export const DrawerTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{children}</h2>
);

export const DrawerBody = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={['flex-1 overflow-y-auto px-5 py-4 space-y-4', className].join(' ')}>
    {children}
  </div>
);

export const DrawerFooter = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={[
      'shrink-0 px-5 py-3 border-t border-app-line dark:border-app-line-dark flex items-center justify-end gap-2',
      className,
    ].join(' ')}
  >
    {children}
  </div>
);
