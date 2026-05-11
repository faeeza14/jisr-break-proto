import type { BreakInstance, BreakPolicy, ShiftPreset } from '../types';
import { parseHHMM } from './time';

export type TrackSegment = {
  kind: 'work' | 'break';
  start: number;
  end: number;
  label?: string;
  breakId?: string;
  paid?: boolean;
};

export type DerivedSchedule = {
  startMin: number;
  endMin: number;
  totalWorkMin: number;
  totalBreakMin: number;
  presenceMin: number;
  segments: TrackSegment[];
  breakInstants: Array<{ b: BreakInstance; start: number; end: number; counts: boolean; paid: boolean }>;
};

const breakAnchorMin = (b: BreakInstance, shiftStartMin: number): number | null => {
  if (b.scheduleType === 'fixed' && b.fixedTime) return parseHHMM(b.fixedTime);
  if (b.scheduleType === 'flexible' && b.flexibleWindow) {
    return parseHHMM(b.flexibleWindow.start);
  }
  if (b.scheduleType === 'anchored' && b.anchoredOffsetMinutes != null) {
    return shiftStartMin + b.anchoredOffsetMinutes;
  }
  return null;
};

export const deriveSchedule = (p: ShiftPreset, breakPolicies: BreakPolicy[]): DerivedSchedule => {
  const startMin = parseHHMM(p.startTime);
  const policyMap = Object.fromEntries(breakPolicies.map((bp) => [bp.id, bp]));

  const fixedBreaks = p.breaks
    .filter((b) => b.scheduleType !== 'flexible')
    .map((b) => {
      const policy = policyMap[b.breakPolicyId];
      const counts = policy?.countTowardWorkHours ?? false;
      const paid = b.paidOverride ?? policy?.paid === 'paid';
      const anchor = breakAnchorMin(b, startMin) ?? startMin;
      return { b, anchor, duration: b.durationMinutes, counts, paid };
    })
    .filter((fb) => fb.anchor >= startMin)
    .sort((a, b) => a.anchor - b.anchor);

  const flexibleBreaks = p.breaks
    .filter((b) => b.scheduleType === 'flexible')
    .map((b) => {
      const policy = policyMap[b.breakPolicyId];
      const counts = policy?.countTowardWorkHours ?? false;
      const paid = b.paidOverride ?? policy?.paid === 'paid';
      return { b, counts, paid };
    });

  const segments: TrackSegment[] = [];
  const breakInstants: DerivedSchedule['breakInstants'] = [];
  let cursor = startMin;
  let workConsumed = 0;
  const totalWork = p.workDurationMinutes;

  for (const fb of fixedBreaks) {
    const breakStart = Math.max(fb.anchor, cursor);
    const workChunk = breakStart - cursor;
    if (workChunk > 0) {
      const cap = Math.max(0, totalWork - workConsumed);
      const chunkWork = Math.min(workChunk, cap);
      if (chunkWork > 0) {
        segments.push({ kind: 'work', start: cursor, end: cursor + chunkWork });
        workConsumed += chunkWork;
        cursor += chunkWork;
      }
      if (workChunk > chunkWork) {
        cursor += workChunk - chunkWork;
      }
    }
    const breakEnd = breakStart + fb.duration;
    segments.push({
      kind: 'break',
      start: breakStart,
      end: breakEnd,
      breakId: fb.b.id,
      paid: fb.paid,
      label: fb.b.name,
    });
    breakInstants.push({ b: fb.b, start: breakStart, end: breakEnd, counts: fb.counts, paid: fb.paid });
    if (fb.counts) workConsumed += fb.duration;
    cursor = breakEnd;
  }

  if (workConsumed < totalWork) {
    const tail = totalWork - workConsumed;
    segments.push({ kind: 'work', start: cursor, end: cursor + tail });
    cursor += tail;
  }

  for (const fl of flexibleBreaks) {
    breakInstants.push({
      b: fl.b,
      start: fl.b.flexibleWindow ? parseHHMM(fl.b.flexibleWindow.start) : startMin,
      end: fl.b.flexibleWindow ? parseHHMM(fl.b.flexibleWindow.end) : startMin,
      counts: fl.counts,
      paid: fl.paid,
    });
  }

  const endMin = cursor;
  const totalBreakMin = breakInstants
    .filter((bi) => bi.b.scheduleType !== 'flexible')
    .reduce((acc, bi) => acc + (bi.end - bi.start), 0);
  return {
    startMin,
    endMin,
    totalWorkMin: totalWork,
    totalBreakMin,
    presenceMin: endMin - startMin,
    segments,
    breakInstants,
  };
};
