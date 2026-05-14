import { Fragment } from 'react';
import { fmtDuration, fmtHHMM, heatBanSpan, intersect, parseHHMM } from '../../lib/time';
import type { DerivedSchedule, TrackSegment } from '../../lib/segments';
import type { BreakInstance } from '../../types';
import { clampSpan, computeWindow, minToPct, widthPct } from './scale';

/**
 * Clocking-rule fields surfaced on the timeline.
 * Mirrors the inline clocking fields on ShiftPreset (R1 data model).
 */
export type ClockingPreview = {
  clockInWindowStart: string;
  clockInWindowEnd: string;
  clockOutWindowStart: string;
  clockOutWindowEnd: string;
  clockInGraceMinutes: number;
};

type Props = {
  schedule: DerivedSchedule;
  showHeatBan: boolean;
  flexibleBreaks: Array<{ b: BreakInstance; start: number; end: number }>;
  showViolations: boolean;
  /** When supplied, a clocking-windows row renders above the work row */
  clocking?: ClockingPreview;
  /** When supplied, the matching break renders with a ring so it stands out */
  highlightBreakId?: string;
  /** Compact mode for the BreakSheet drawer — thinner rows, hides labels */
  compact?: boolean;
};

const HOUR_TICKS = (startMin: number, endMin: number) => {
  const ticks: number[] = [];
  const startH = Math.ceil(startMin / 60);
  const endH = Math.floor(endMin / 60);
  for (let h = startH; h <= endH; h += 2) ticks.push(h * 60);
  return ticks;
};

const SegmentBar = ({
  seg,
  windowSpan,
  highlight,
  compact,
}: {
  seg: TrackSegment;
  windowSpan: { startMin: number; endMin: number };
  highlight: boolean;
  compact: boolean;
}) => {
  const left = minToPct(seg.start, windowSpan);
  const w = widthPct(seg.start, seg.end, windowSpan);
  if (seg.kind === 'work') {
    return (
      <div
        className={[
          'absolute rounded-md bg-info-bg dark:bg-info-bg-dark text-info-ink dark:text-info-ink-dark text-11 font-medium flex items-center justify-center px-2 transition-all duration-150',
          compact ? 'top-1 bottom-1' : 'top-2 bottom-2',
        ].join(' ')}
        style={{ left: `${left}%`, width: `${w}%` }}
      >
        {compact ? '' : `Work · ${fmtDuration(seg.end - seg.start)}`}
      </div>
    );
  }
  return (
    <div
      className={[
        'absolute rounded bg-app-subtle dark:bg-app-subtle-dark hairline text-app-mute dark:text-app-mute-dark text-11 flex items-center justify-center px-1 transition-all duration-150',
        compact ? 'top-2 bottom-2' : 'top-3 bottom-3',
        highlight ? 'ring-2 ring-app-ink dark:ring-app-ink-dark bg-app-bg dark:bg-app-bg-dark' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={`${seg.label ?? 'Break'} ${fmtHHMM(seg.start)}–${fmtHHMM(seg.end)}`}
    >
      {!compact && w > 6 ? fmtDuration(seg.end - seg.start) : ''}
    </div>
  );
};

export const Timeline = ({
  schedule,
  showHeatBan,
  flexibleBreaks,
  showViolations,
  clocking,
  highlightBreakId,
  compact = false,
}: Props) => {
  // Compute clocking time bounds (minutes from midnight) for the axis
  const clockingBounds = clocking
    ? {
        earliestMin: Math.min(
          parseHHMM(clocking.clockInWindowStart),
          parseHHMM(clocking.clockOutWindowStart),
        ),
        latestMin: Math.max(
          parseHHMM(clocking.clockInWindowEnd) + clocking.clockInGraceMinutes,
          parseHHMM(clocking.clockOutWindowEnd),
        ),
      }
    : undefined;

  const window = computeWindow(schedule.startMin, schedule.endMin, clockingBounds);
  const ticks = HOUR_TICKS(window.startMin, window.endMin);
  const heatClamped = showHeatBan ? clampSpan(heatBanSpan, window) : null;

  const violations = showViolations
    ? schedule.segments
        .filter((s) => s.kind === 'work')
        .map((s) => intersect(s, heatBanSpan))
        .filter((s): s is { start: number; end: number } => !!s)
    : [];

  // ── Clocking row geometry ──────────────────────────────
  let clockIn: { start: number; end: number } | null = null;
  let clockInGrace: { start: number; end: number } | null = null;
  let clockOut: { start: number; end: number } | null = null;
  if (clocking) {
    const ciStart = parseHHMM(clocking.clockInWindowStart);
    const ciEnd = parseHHMM(clocking.clockInWindowEnd);
    const coStart = parseHHMM(clocking.clockOutWindowStart);
    const coEnd = parseHHMM(clocking.clockOutWindowEnd);
    if (ciEnd > ciStart) clockIn = { start: ciStart, end: ciEnd };
    if (clocking.clockInGraceMinutes > 0)
      clockInGrace = { start: ciEnd, end: ciEnd + clocking.clockInGraceMinutes };
    if (coEnd > coStart) clockOut = { start: coStart, end: coEnd };
  }

  const clockingRowHeight = compact ? 'h-4' : 'h-6';
  const workRowHeight = compact ? 'h-8' : 'h-14';

  return (
    <div className="select-none">
      {/* Hour tick row */}
      <div className="relative h-4 mb-1">
        {ticks.map((t) => (
          <Fragment key={t}>
            <div
              className="absolute top-2 bottom-0 w-px bg-app-line dark:bg-app-line-dark"
              style={{ left: `${minToPct(t, window)}%` }}
            />
            <div
              className="absolute top-0 -translate-x-1/2 text-11 text-app-faint dark:text-app-faint-dark"
              style={{ left: `${minToPct(t, window)}%` }}
            >
              {fmtHHMM(t)}
            </div>
          </Fragment>
        ))}
        {heatClamped && (
          <div
            className="absolute top-0 -translate-x-1/2 text-11 text-warn-ink dark:text-warn-ink-dark font-medium"
            style={{
              left: `${(minToPct(heatClamped.start, window) + minToPct(heatClamped.end, window)) / 2}%`,
            }}
          >
            Heat ban
          </div>
        )}
      </div>

      {/* Clocking row — only when `clocking` prop is supplied */}
      {clocking && (
        <div className={['relative mb-1 rounded bg-app-surface dark:bg-app-subtle-dark/40', clockingRowHeight].join(' ')}>
          {clockIn && (
            <div
              className="absolute top-0 bottom-0 rounded-l bg-info-bg/60 dark:bg-info-bg-dark/40 border border-info-line/60 text-info-ink dark:text-info-ink-dark text-11 flex items-center px-1.5 truncate"
              style={{
                left: `${minToPct(clockIn.start, window)}%`,
                width: `${widthPct(clockIn.start, clockIn.end, window)}%`,
              }}
              title={`Clock-in window ${fmtHHMM(clockIn.start)}–${fmtHHMM(clockIn.end)}`}
            >
              {!compact && widthPct(clockIn.start, clockIn.end, window) > 10
                ? `Clock-in ${fmtHHMM(clockIn.start)}–${fmtHHMM(clockIn.end)}`
                : ''}
            </div>
          )}
          {clockInGrace && (
            <div
              className="absolute top-0 bottom-0 border-y border-r border-dashed border-info-line/60 bg-info-bg/20 dark:bg-info-bg-dark/15 text-info-ink dark:text-info-ink-dark text-11 flex items-center px-1 truncate"
              style={{
                left: `${minToPct(clockInGrace.start, window)}%`,
                width: `${widthPct(clockInGrace.start, clockInGrace.end, window)}%`,
              }}
              title={`Grace · +${clocking.clockInGraceMinutes}m after clock-in window`}
            >
              {!compact && widthPct(clockInGrace.start, clockInGrace.end, window) > 5
                ? `+${clocking.clockInGraceMinutes}m`
                : ''}
            </div>
          )}
          {clockOut && (
            <div
              className="absolute top-0 bottom-0 rounded-r bg-info-bg/60 dark:bg-info-bg-dark/40 border border-info-line/60 text-info-ink dark:text-info-ink-dark text-11 flex items-center px-1.5 truncate"
              style={{
                left: `${minToPct(clockOut.start, window)}%`,
                width: `${widthPct(clockOut.start, clockOut.end, window)}%`,
              }}
              title={`Clock-out window ${fmtHHMM(clockOut.start)}–${fmtHHMM(clockOut.end)}`}
            >
              {!compact && widthPct(clockOut.start, clockOut.end, window) > 10
                ? `Clock-out ${fmtHHMM(clockOut.start)}–${fmtHHMM(clockOut.end)}`
                : ''}
            </div>
          )}
        </div>
      )}

      {/* Flexible breaks strip — hidden in compact mode */}
      {!compact && flexibleBreaks.length > 0 && (
        <div className="relative h-5 mb-1">
          {flexibleBreaks.map((fb) => {
            const left = minToPct(fb.start, window);
            const w = widthPct(fb.start, fb.end, window);
            const isHighlighted = highlightBreakId === fb.b.id;
            return (
              <div
                key={fb.b.id}
                className={[
                  'absolute top-0 bottom-0 rounded border border-dashed text-11 flex items-center justify-center px-1',
                  isHighlighted
                    ? 'border-app-ink dark:border-app-ink-dark ring-1 ring-app-ink/40 text-app-ink dark:text-app-ink-dark font-medium'
                    : 'border-app-faint dark:border-app-faint-dark text-app-mute dark:text-app-mute-dark',
                ].join(' ')}
                style={{ left: `${left}%`, width: `${w}%` }}
                title={`${fb.b.name} · flexible window`}
              >
                {w > 8 ? `${fb.b.name} · ${fmtDuration(fb.b.durationMinutes)}` : ''}
              </div>
            );
          })}
        </div>
      )}

      {/* Work row (existing) */}
      <div className={['relative rounded-md bg-app-subtle dark:bg-app-subtle-dark overflow-hidden', workRowHeight].join(' ')}>
        {heatClamped && (
          <div
            className="absolute top-0 bottom-0 bg-warn-bg/70 dark:bg-warn-bg-dark/70 border-l border-r border-dashed border-warn-line"
            style={{
              left: `${minToPct(heatClamped.start, window)}%`,
              width: `${widthPct(heatClamped.start, heatClamped.end, window)}%`,
            }}
          />
        )}
        {schedule.segments.map((seg, i) => (
          <SegmentBar
            key={`${seg.kind}-${i}-${seg.start}`}
            seg={seg}
            windowSpan={window}
            highlight={!!seg.breakId && seg.breakId === highlightBreakId}
            compact={compact}
          />
        ))}
        {violations.map((v, i) => (
          <div
            key={`v-${i}-${v.start}`}
            className={[
              'absolute rounded-md bg-danger-bg dark:bg-danger-bg-dark text-danger-ink dark:text-danger-ink-dark text-11 font-medium flex items-center justify-center px-2 ring-1 ring-danger-line',
              compact ? 'top-1 bottom-1' : 'top-2 bottom-2',
            ].join(' ')}
            style={{ left: `${minToPct(v.start, window)}%`, width: `${widthPct(v.start, v.end, window)}%` }}
          >
            {compact ? '' : `Work · ${fmtDuration(v.end - v.start)}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export const TimelineLegend = ({
  showHeatBan,
  showViolation,
  showClocking = false,
}: {
  showHeatBan: boolean;
  showViolation: boolean;
  showClocking?: boolean;
}) => (
  <div className="flex flex-wrap gap-4 mt-3 text-11 text-app-mute dark:text-app-mute-dark">
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block w-3 h-3 rounded-sm bg-info-bg dark:bg-info-bg-dark" /> Work
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block w-3 h-3 rounded-sm bg-app-subtle dark:bg-app-subtle-dark hairline" /> Break
    </span>
    {showClocking && (
      <>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-info-bg/60 dark:bg-info-bg-dark/40 border border-info-line/60" />{' '}
          Clock-in / out window
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm border border-dashed border-info-line/60" /> Grace
        </span>
      </>
    )}
    {showHeatBan && (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm bg-warn-bg dark:bg-warn-bg-dark" /> Heat ban zone
      </span>
    )}
    {showViolation && (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm bg-danger-bg dark:bg-danger-bg-dark ring-1 ring-danger-line" />{' '}
        Violation
      </span>
    )}
  </div>
);
