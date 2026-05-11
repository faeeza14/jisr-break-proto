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

export const computeWindow = (presetStart: number, presetEnd: number): TimelineWindow => {
  const startMin = Math.min(presetStart, 6 * 60) - 30;
  const endMin = Math.max(presetEnd, 18 * 60) + 30;
  return { startMin, endMin };
};
