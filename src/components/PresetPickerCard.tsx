import type { ShiftPreset } from '../types';
import { fmt12h, fmtDuration, parseHHMM } from '../lib/time';
import { Pill } from './primitives/Pill';

type Props = {
  preset: ShiftPreset;
  selected?: boolean;
  warning?: string;
  onClick?: () => void;
  endMin?: number;
  compact?: boolean;
};

export const PresetPickerCard = ({ preset, selected, warning, onClick, endMin, compact }: Props) => {
  const startMin = parseHHMM(preset.startTime);
  const colorAlpha = `${preset.color}22`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-3 rounded-md hairline transition w-full focus-ring ${
        selected ? 'ring-2 ring-app-ink dark:ring-app-ink-dark border-transparent' : 'hover:bg-app-subtle/40 dark:hover:bg-app-subtle-dark/40'
      }`}
      style={{ backgroundColor: selected ? colorAlpha : undefined }}
    >
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-sm shrink-0" style={{ backgroundColor: preset.color }} />
        <span className="text-13 font-medium truncate">{preset.nameEn}</span>
      </div>
      <div className={`mt-1 text-11 text-app-mute dark:text-app-mute-dark ${compact ? 'truncate' : ''}`}>
        {fmt12h(startMin)}{endMin != null ? ` – ${fmt12h(endMin)}` : ''} · {fmtDuration(preset.workDurationMinutes)}
      </div>
      {warning && (
        <div className="mt-2">
          <Pill tone="red">! {warning}</Pill>
        </div>
      )}
    </button>
  );
};
