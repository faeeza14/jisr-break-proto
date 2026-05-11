import { Fragment } from 'react';
import { fmtDuration, fmtHHMM, heatBanSpan, intersect } from '../../lib/time';
import type { DerivedSchedule, TrackSegment } from '../../lib/segments';
import type { BreakInstance } from '../../types';
import { clampSpan, computeWindow, minToPct, widthPct } from './scale';

type Props = {
  schedule: DerivedSchedule;
  showHeatBan: boolean;
  flexibleBreaks: Array<{ b: BreakInstance; start: number; end: number }>;
  showViolations: boolean;
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
}: {
  seg: TrackSegment;
  windowSpan: { startMin: number; endMin: number };
}) => {
  const left = minToPct(seg.start, windowSpan);
  const w = widthPct(seg.start, seg.end, windowSpan);
  if (seg.kind === 'work') {
    return (
      <div
        className="absolute top-2 bottom-2 rounded-md bg-info-bg dark:bg-info-bg-dark text-info-ink dark:text-info-ink-dark text-11 font-medium flex items-center justify-center px-2 transition-all duration-150"
        style={{ left: `${left}%`, width: `${w}%` }}
      >
        Work · {fmtDuration(seg.end - seg.start)}
      </div>
    );
  }
  return (
    <div
      className="absolute top-3 bottom-3 rounded bg-app-subtle dark:bg-app-subtle-dark hairline text-app-mute dark:text-app-mute-dark text-11 flex items-center justify-center px-1 transition-all duration-150"
      style={{ left: `${left}%`, width: `${w}%` }}
      title={`${seg.label ?? 'Break'} ${fmtHHMM(seg.start)}–${fmtHHMM(seg.end)}`}
    >
      {w > 6 ? fmtDuration(seg.end - seg.start) : ''}
    </div>
  );
};

export const Timeline = ({ schedule, showHeatBan, flexibleBreaks, showViolations }: Props) => {
  const window = computeWindow(schedule.startMin, schedule.endMin);
  const ticks = HOUR_TICKS(window.startMin, window.endMin);

  const heatClamped = showHeatBan ? clampSpan(heatBanSpan, window) : null;

  const violations = showViolations
    ? schedule.segments
        .filter((s) => s.kind === 'work')
        .map((s) => intersect(s, heatBanSpan))
        .filter((s): s is { start: number; end: number } => !!s)
    : [];

  return (
    <div className="select-none">
      {flexibleBreaks.length > 0 && (
        <div className="relative h-5 mb-1">
          {flexibleBreaks.map((fb) => {
            const left = minToPct(fb.start, window);
            const w = widthPct(fb.start, fb.end, window);
            return (
              <div
                key={fb.b.id}
                className="absolute top-0 bottom-0 rounded border border-dashed border-app-faint dark:border-app-faint-dark text-11 text-app-mute dark:text-app-mute-dark flex items-center justify-center px-1"
                style={{ left: `${left}%`, width: `${w}%` }}
                title={`${fb.b.name} · flexible window`}
              >
                {w > 8 ? `${fb.b.name} · ${fmtDuration(fb.b.durationMinutes)}` : ''}
              </div>
            );
          })}
        </div>
      )}

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
            style={{ left: `${(minToPct(heatClamped.start, window) + minToPct(heatClamped.end, window)) / 2}%` }}
          >
            Heat ban
          </div>
        )}
      </div>

      <div className="relative h-14 rounded-md bg-app-subtle dark:bg-app-subtle-dark overflow-hidden">
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
          <SegmentBar key={`${seg.kind}-${i}-${seg.start}`} seg={seg} windowSpan={window} />
        ))}
        {violations.map((v, i) => (
          <div
            key={`v-${i}-${v.start}`}
            className="absolute top-2 bottom-2 rounded-md bg-danger-bg dark:bg-danger-bg-dark text-danger-ink dark:text-danger-ink-dark text-11 font-medium flex items-center justify-center px-2 ring-1 ring-danger-line"
            style={{ left: `${minToPct(v.start, window)}%`, width: `${widthPct(v.start, v.end, window)}%` }}
          >
            Work · {fmtDuration(v.end - v.start)}
          </div>
        ))}
      </div>
    </div>
  );
};

export const TimelineLegend = ({ showHeatBan, showViolation }: { showHeatBan: boolean; showViolation: boolean }) => (
  <div className="flex flex-wrap gap-4 mt-3 text-11 text-app-mute dark:text-app-mute-dark">
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block w-3 h-3 rounded-sm bg-info-bg dark:bg-info-bg-dark" /> Work
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block w-3 h-3 rounded-sm bg-app-subtle dark:bg-app-subtle-dark hairline" /> Break
    </span>
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
