import type { BreakInstance, BreakScheduleType } from '../types';
import { fmtDuration } from '../lib/time';

const dotClass = (t: BreakScheduleType) =>
  t === 'fixed'
    ? 'bg-info-ink dark:bg-info-ink-dark'
    : t === 'flexible'
      ? 'bg-transparent border-[1.5px] border-info-ink dark:border-info-ink-dark'
      : 'bg-gradient-to-r from-info-ink dark:from-info-ink-dark from-50% to-transparent to-50% border-[1.5px] border-info-ink dark:border-info-ink-dark';

const Dot = ({ t }: { t: BreakScheduleType }) => (
  <span aria-hidden className={`inline-block size-[7px] rounded-full ${dotClass(t)}`} />
);

const HollowGray = () => (
  <span
    aria-hidden
    className="inline-block size-[7px] rounded-full bg-transparent border-[1.5px] border-app-faint dark:border-app-faint-dark"
  />
);

type Props = {
  breaks: BreakInstance[];
  /** Kept for API compatibility with the vision proto; ignored in R1 */
  breakPolicies?: unknown;
  compact?: boolean;
};

const orderedTypes = (breaks: BreakInstance[]): BreakScheduleType[] => {
  const order: BreakScheduleType[] = ['fixed', 'flexible', 'anchored'];
  const present = new Set(breaks.map((b) => b.scheduleType));
  return order.filter((t) => present.has(t)).slice(0, 3);
};

const paidLabel = (p: BreakInstance['paid']): string =>
  p === 'paid' ? 'Paid' : p === 'unpaid' ? 'Unpaid' : 'Mixed';

const tooltipFor = (breaks: BreakInstance[]): string => {
  if (breaks.length === 0) return 'No breaks configured';
  return breaks
    .map((b) => `${b.name} · ${fmtDuration(b.durationMinutes)} · ${paidLabel(b.paid)}`)
    .join('\n');
};

export const BreakIndicator = ({ breaks, compact = false }: Props) => {
  const tooltip = tooltipFor(breaks);

  if (breaks.length === 0) {
    if (compact) {
      return (
        <span title={tooltip} className="inline-flex">
          <HollowGray />
        </span>
      );
    }
    return (
      <span className="italic text-11 text-app-faint dark:text-app-faint-dark" title={tooltip}>
        No breaks configured
      </span>
    );
  }

  if (breaks.length === 1) {
    const b = breaks[0];
    if (compact) {
      return (
        <span title={tooltip} className="inline-flex">
          <Dot t={b.scheduleType} />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 min-w-0" title={tooltip}>
        <Dot t={b.scheduleType} />
        <span className="min-w-0">
          <span className="block text-13 truncate">
            {b.name} · {fmtDuration(b.durationMinutes)}
          </span>
          <span className="block text-11 text-app-mute dark:text-app-mute-dark truncate">
            {paidLabel(b.paid)}
          </span>
        </span>
      </span>
    );
  }

  const types = orderedTypes(breaks);
  const totalMin = breaks.reduce((acc, b) => acc + b.durationMinutes, 0);
  const paidKinds = new Set(breaks.map((b) => b.paid));
  const summary =
    paidKinds.size === 1
      ? paidLabel(breaks[0].paid)
      : 'Mixed paid / unpaid';

  if (compact) {
    return (
      <span title={tooltip} className="inline-flex items-center gap-[3px]">
        {types.map((t) => (
          <Dot key={t} t={t} />
        ))}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 min-w-0" title={tooltip}>
      <span className="inline-flex items-center gap-[3px] shrink-0">
        {types.map((t) => (
          <Dot key={t} t={t} />
        ))}
      </span>
      <span className="min-w-0">
        <span className="block text-13 truncate">
          {breaks.length} breaks · {fmtDuration(totalMin)}
        </span>
        <span className="block text-11 text-app-mute dark:text-app-mute-dark truncate">
          {summary}
        </span>
      </span>
    </span>
  );
};

export const BreakIndicatorLegend = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-11 text-app-faint dark:text-app-faint-dark px-4 py-3 border-t-hair border-app-line dark:border-app-line-dark">
    <span className="inline-flex items-center gap-1.5">
      <Dot t="fixed" /> Fixed time
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Dot t="flexible" /> Flexible window
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Dot t="anchored" /> Anchored to clock-in
    </span>
  </div>
);

export const totalBreakMinutes = (breaks: BreakInstance[]): number =>
  breaks.reduce((acc, b) => acc + b.durationMinutes, 0);
