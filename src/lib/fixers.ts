import { nanoid } from 'nanoid';
import type { ShiftPreset } from '../types';
import { fmtHHMM, parseHHMM } from './time';

const HEAT_BAN_START = 12 * 60;
const HEAT_BAN_END = 15 * 60;
const HEAT_BAN_DURATION = HEAT_BAN_END - HEAT_BAN_START;

export const heatBanFix = (p: ShiftPreset): ShiftPreset => {
  const totalWork = p.workDurationMinutes;
  const preBanCap = HEAT_BAN_START - 6 * 60;
  const work1 = Math.min(preBanCap, totalWork);
  const newStartMin = HEAT_BAN_START - work1;

  return {
    ...p,
    startTime: fmtHHMM(newStartMin),
    breaks: [
      {
        id: `bk-fix-${nanoid(6)}`,
        name: 'Heat ban mandated paid break',
        breakPolicyId: p.breaks[0]?.breakPolicyId ?? 'bp1',
        scheduleType: 'fixed',
        fixedTime: '12:00',
        durationMinutes: HEAT_BAN_DURATION,
        paidOverride: true,
      },
    ],
  };
};

export const ensureBreakAfter5hFix = (p: ShiftPreset): ShiftPreset => {
  const startMin = parseHHMM(p.startTime);
  const splitAt = startMin + 5 * 60 - 30;
  return {
    ...p,
    breaks: [
      ...p.breaks.filter((b) => b.scheduleType !== 'fixed' || (b.fixedTime && parseHHMM(b.fixedTime) !== splitAt)),
      {
        id: `bk-fix-${nanoid(6)}`,
        name: 'Mandatory rest',
        breakPolicyId: p.breaks[0]?.breakPolicyId ?? 'bp1',
        scheduleType: 'fixed',
        fixedTime: fmtHHMM(splitAt),
        durationMinutes: 30,
      },
    ],
  };
};
