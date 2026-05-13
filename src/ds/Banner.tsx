/**
 * DS shim — mirrors @jisr-hr/ds-web Banner API.
 * Storybook: molecules-banner--docs
 * Stories: info-mid-emphasis, warning-high-emphasis, danger-high-emphasis,
 *          with-actions, closeable
 */
import type { ReactNode } from 'react';
import { X, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

type BannerAppearance = 'info' | 'success' | 'warning' | 'danger';
type BannerEmphasis = 'low' | 'mid' | 'high';

interface BannerProps {
  appearance?: BannerAppearance;
  emphasis?: BannerEmphasis;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const configs: Record<BannerAppearance, { icon: ReactNode; bg: string; text: string; border: string }> = {
  info: {
    icon: <Info className="size-4 shrink-0 mt-0.5" />,
    bg: 'bg-info-bg dark:bg-info-bg-dark',
    text: 'text-info-ink dark:text-info-ink-dark',
    border: 'border-info-ink/20',
  },
  success: {
    icon: <CheckCircle2 className="size-4 shrink-0 mt-0.5" />,
    bg: 'bg-ok-bg dark:bg-ok-bg-dark',
    text: 'text-ok-ink dark:text-ok-ink-dark',
    border: 'border-ok-ink/20',
  },
  warning: {
    icon: <AlertTriangle className="size-4 shrink-0 mt-0.5" />,
    bg: 'bg-warn-bg dark:bg-warn-bg-dark',
    text: 'text-warn-ink dark:text-warn-ink-dark',
    border: 'border-warn-line/40',
  },
  danger: {
    icon: <AlertCircle className="size-4 shrink-0 mt-0.5" />,
    bg: 'bg-danger-bg dark:bg-danger-bg-dark',
    text: 'text-danger-ink dark:text-danger-ink-dark',
    border: 'border-danger-line/40',
  },
};

export const Banner = ({
  appearance = 'info',
  emphasis = 'mid',
  title,
  children,
  actions,
  onDismiss,
  className = '',
}: BannerProps) => {
  const cfg = configs[appearance];
  return (
    <div
      role="alert"
      className={[
        'flex gap-3 rounded-lg border p-3',
        cfg.bg,
        cfg.text,
        cfg.border,
        emphasis === 'high' ? 'p-4' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {cfg.icon}
      <div className="flex-1 min-w-0">
        {title && <p className="text-13 font-medium leading-tight">{title}</p>}
        {children && <p className="text-13 mt-0.5 opacity-90">{children}</p>}
        {actions && <div className="mt-2 flex gap-2">{actions}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 size-5 inline-flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 transition"
          aria-label="Dismiss"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
};
