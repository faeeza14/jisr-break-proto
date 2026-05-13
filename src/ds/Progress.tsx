/**
 * DS shim — mirrors @jisr-hr/ds-web ProgressBar API.
 * Source: Figma — Wasl DS / Atoms / Progress (canvas 5121:2)
 *
 * Spec from Figma: treated as MVP — linear bar pattern.
 *
 * API:
 *   <Progress value={42} max={100} appearance="default" />
 *   <Progress value={42} showLabel />
 *   <Progress indeterminate />
 */
type ProgressAppearance = 'default' | 'success' | 'warning' | 'danger';
type ProgressSize = 'sm' | 'md';

interface ProgressProps {
  /** Current value (0..max). Ignored when indeterminate. */
  value?: number;
  /** Maximum value, default 100 */
  max?: number;
  appearance?: ProgressAppearance;
  size?: ProgressSize;
  /** Show percentage label at the right */
  showLabel?: boolean;
  /** Indeterminate animation (no value) */
  indeterminate?: boolean;
  className?: string;
  label?: string;
}

const FILL: Record<ProgressAppearance, string> = {
  default: 'bg-app-ink dark:bg-app-ink-dark',
  success: 'bg-ok-line',
  warning: 'bg-warn-line',
  danger: 'bg-danger-line',
};

export const Progress = ({
  value = 0,
  max = 100,
  appearance = 'default',
  size = 'md',
  showLabel = false,
  indeterminate = false,
  className = '',
  label,
}: ProgressProps) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const trackH = size === 'sm' ? 'h-1' : 'h-2';

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {(label || showLabel) && (
        <div className="flex items-center justify-between mb-1 text-11 text-app-mute dark:text-app-mute-dark">
          {label && <span>{label}</span>}
          {showLabel && !indeterminate && <span className="tabular-nums">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        className={[
          'w-full rounded-full bg-app-subtle dark:bg-app-subtle-dark overflow-hidden',
          trackH,
        ].join(' ')}
      >
        <div
          className={[
            'h-full rounded-full transition-[width] duration-300',
            FILL[appearance],
            indeterminate ? 'w-1/3 animate-[shimmer_1.4s_linear_infinite]' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
