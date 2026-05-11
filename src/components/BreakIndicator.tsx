import type { BreakInstance, BreakPolicy, BreakScheduleType } from '../types';
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
  breakPolicies: BreakPolicy[];
  compact?: boolean;
};

const orderedTypes = (breaks: BreakInstance[]): BreakScheduleType[] => {
  const order: BreakScheduleType[] = ['fixed', 'flexible', 'anchored'];
  const present = new Set(breaks.map((b) => b.scheduleType));
  return order.filter((t) => present.has(t)).slice(0, 3);
};

const tooltipFor = (breaks: BreakInstance[], breakPolicies: BreakPolicy[]): string => {
  if (breaks.length === 0) return 'No breaks configured';
  const policyMap = Object.fromEntries(breakPolicies.map((p) => [p.id, p]));
  return breaks
    .map((b) => {
      const policy = policyMap[b.breakPolicyId]?.name ?? '—';
      return `${b.name} · ${fmtDuration(b.durationMinutes)} · ${policy}`;
    })
    .join('\n');
};

export const BreakIndicator = ({ breaks, breakPolicies, compact = false }: Props) => {
  const policyMap = Object.fromEntries(breakPolicies.map((p) => [p.id, p]));
  const tooltip = tooltipFor(breaks, breakPolicies);

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
    const policy = policyMap[b.breakPolicyId];
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
            {policy?.name ?? '—'}
          </span>
        </span>
      </span>
    );
  }

  const types = orderedTypes(breaks);
  const totalMin = breaks.reduce((acc, b) => acc + b.durationMinutes, 0);
  const policyIds = new Set(breaks.map((b) => b.breakPolicyId));
  const policyLine =
    policyIds.size === 1
      ? policyMap[breaks[0].breakPolicyId]?.name ?? '—'
      : 'Mixed policies';

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
          {policyLine}
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
