/**
 * DS shim — mirrors @jisr-hr/ds-web Slider API.
 * Source: Figma — Wasl DS / Atoms / Slider (canvas 5262:2)
 *
 * Treated as MVP in Figma — single-thumb range slider.
 *
 * API:
 *   <Slider value={50} onChange={setValue} min={0} max={100} step={1} />
 *   <Slider value={50} onChange={setValue} showValue valueFormat={(v) => `${v}%`} />
 */
import type { ChangeEvent } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  label?: string;
  className?: string;
  'aria-label'?: string;
}

export const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  valueFormat,
  label,
  className = '',
  'aria-label': ariaLabel,
}: SliderProps) => {
  const pct = ((value - min) / (max - min)) * 100;
  const formatted = valueFormat ? valueFormat(value) : String(value);

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1 text-11 text-app-mute dark:text-app-mute-dark">
          {label && <span>{label}</span>}
          {showValue && <span className="tabular-nums">{formatted}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel ?? label ?? 'Slider'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        className={[
          // Custom thumb via accent-color + minimum sizing
          'w-full h-2 appearance-none cursor-pointer rounded-full bg-app-subtle dark:bg-app-subtle-dark',
          'accent-app-ink dark:accent-app-ink-dark',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-app-ink dark:[&::-webkit-slider-thumb]:bg-app-ink-dark [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-webkit-slider-thumb]:shadow-sm',
          '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-app-ink dark:[&::-moz-range-thumb]:bg-app-ink-dark [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white',
          disabled ? 'opacity-40 cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          // Gradient fill for the played portion of the track
          background: disabled
            ? undefined
            : `linear-gradient(to right, var(--tw-color-app-ink, #101014) 0%, var(--tw-color-app-ink, #101014) ${pct}%, transparent ${pct}%, transparent 100%)`,
        }}
      />
    </div>
  );
};
