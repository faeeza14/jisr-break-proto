import type { Span } from '../../lib/time';

export type TimelineWindow = { startMin: number; endMin: number };

export const minToPct = (min: number, w: TimelineWindow): number =>
  ((min - w.startMin) / (w.endMin - w.startMin)) * 100;

export const widthPct = (start: number, end: number, w: TimelineWindow): number =>
  ((end - start) / (w.endMin - w.startMin)) * 100;

export const clampSpan = (s: Span, w: TimelineWindow): Span | null => {
  const start = Math.max(s.start, w.startMin);
  const end = Math.min(s.end, w.endMin);
  return end > start ? { start, end } : null;
};

/**
 * Compute the visible timeline window. Defaults to a 6am–6pm canvas padded
 * by 30 min on each side, then extended to fit:
 *   - the shift body (presetStart..presetEnd)
 *   - optional clocking bounds (so clock-in window before shift, clock-out
 *     window after shift, and grace period don't get clipped — important
 *     for night-shift presets)
 */
export const computeWindow = (
  presetStart: number,
  presetEnd: number,
  clockingBounds?: { earliestMin: number; latestMin: number },
): TimelineWindow => {
  const candidatesStart = [presetStart, 6 * 60];
  const candidatesEnd = [presetEnd, 18 * 60];
  if (clockingBounds) {
    candidatesStart.push(clockingBounds.earliestMin);
    candidatesEnd.push(clockingBounds.latestMin);
  }
  const startMin = Math.min(...candidatesStart) - 30;
  const endMin = Math.max(...candidatesEnd) + 30;
  return { startMin, endMin };
};
