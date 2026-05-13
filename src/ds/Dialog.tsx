/**
 * DS shim — mirrors @jisr-hr/ds-web Dialog API.
 * Storybook: molecules-dialog--docs
 * Stories: default, with-form, controlled, custom-width, nonclosable-alert-dialog
 *
 * API follows Radix UI Dialog pattern (same as real DS).
 */
import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  );
};

interface DialogContentProps {
  children: ReactNode;
  className?: string;
  width?: string;
  closable?: boolean;
  onClose?: () => void;
}

export const DialogContent = ({
  children,
  className = '',
  width = 'max-w-lg',
  closable = true,
  onClose,
}: DialogContentProps) => (
  <div
    className={[
      'relative z-10 w-full bg-white dark:bg-app-card-dark rounded-card hairline shadow-2xl flex flex-col max-h-[90vh]',
      width,
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {closable && onClose && (
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3.5 right-4 size-7 inline-flex items-center justify-center rounded-md text-app-mute hover:bg-app-subtle dark:hover:bg-app-subtle-dark transition"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>
    )}
    {children}
  </div>
);

export const DialogHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={['px-5 py-3.5 border-b border-app-line dark:border-app-line-dark', className].join(' ')}>
    {children}
  </div>
);

export const DialogTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{children}</h2>
);

export const DialogDescription = ({ children }: { children: ReactNode }) => (
  <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">{children}</p>
);

export const DialogBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={['px-5 py-4 flex-1 overflow-y-auto', className].join(' ')}>
    {children}
  </div>
);

export const DialogFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div
    className={[
      'px-5 py-3 border-t border-app-line dark:border-app-line-dark flex items-center justify-end gap-2',
      className,
    ].join(' ')}
  >
    {children}
  </div>
);
