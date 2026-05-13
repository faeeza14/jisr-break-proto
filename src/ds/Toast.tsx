/**
 * DS shim — mirrors @jisr-hr/ds-web Toast API.
 * Storybook: molecules-toast--docs
 * Stories: success-toast, error-toast, warning-toast, info-toast, direct-toast-api
 *
 * Minimal shim — real DS uses Sonner or similar under the hood.
 * This shim uses a simple store + rendered portal.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { nanoid } from 'nanoid';

type ToastAppearance = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  appearance: ToastAppearance;
  title?: string;
  description?: string;
}

interface ToastContextValue {
  add: (item: Omit<ToastItem, 'id'>) => void;
}

const ToastCtx = createContext<ToastContextValue>({ add: () => {} });

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = nanoid(6);
    setToasts((t) => [...t, { ...item, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const icons: Record<ToastAppearance, ReactNode> = {
    success: <CheckCircle2 className="size-4 text-ok-ink" />,
    error: <AlertCircle className="size-4 text-danger-ink" />,
    warning: <AlertTriangle className="size-4 text-warn-ink" />,
    info: <Info className="size-4 text-info-ink" />,
  };

  return (
    <ToastCtx.Provider value={{ add }}>
      {children}
      {/* Toast portal */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="flex items-start gap-3 bg-white dark:bg-app-card-dark rounded-lg hairline shadow-lg px-4 py-3 animate-in slide-in-from-right-2"
          >
            <span className="shrink-0 mt-0.5">{icons[t.appearance]}</span>
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{t.title}</p>}
              {t.description && <p className="text-11 text-app-mute dark:text-app-mute-dark">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="shrink-0 size-5 inline-flex items-center justify-center rounded text-app-faint hover:text-app-mute transition"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

/** Direct toast API — matches DS usage: toast.success('Saved') */
export const useToast = () => {
  const ctx = useContext(ToastCtx);
  return {
    success: (title: string, description?: string) => ctx.add({ appearance: 'success', title, description }),
    error: (title: string, description?: string) => ctx.add({ appearance: 'error', title, description }),
    warning: (title: string, description?: string) => ctx.add({ appearance: 'warning', title, description }),
    info: (title: string, description?: string) => ctx.add({ appearance: 'info', title, description }),
  };
};
