import type { ComplianceContext, ComplianceResult, ShiftPreset, Violation } from '../types';
import { fmtHHMM, heatBanSpan, intersect, isHeatBanDate } from './time';
import { isRamadanDate } from '../data/ramadan';
import { deriveSchedule } from './segments';
import { ensureBreakAfter5hFix, heatBanFix } from './fixers';

// R1 — break behaviour is read off BreakInstance directly, so the `breakPolicies`
// argument is no longer required. Kept as optional in the type for now so existing
// call sites don't need updating in lock-step.
export type ComplianceArgs = {
  preset: ShiftPreset;
  breakPolicies?: unknown;
  context: ComplianceContext;
};

type Rule = (args: ComplianceArgs) => Violation[];

const heatBanRule: Rule = ({ preset, context }) => {
  if (preset.workEnvironment === 'indoor') return [];
  if (!isHeatBanDate(context.currentDate)) return [];
  const sched = deriveSchedule(preset);
  const violations: Violation[] = [];
  for (const seg of sched.segments) {
    if (seg.kind !== 'work') continue;
    const overlap = intersect(seg, heatBanSpan);
    if (!overlap) continue;
    violations.push({
      ruleId: 'ksa.heat_ban',
      severity: 'hard',
      message: `Outdoor work scheduled ${fmtHHMM(overlap.start)}–${fmtHHMM(overlap.end)} during the summer heat ban.`,
      citation: 'Ministerial Decision 3337 — outdoor work prohibited 12:00–15:00 from June 15 to September 15.',
      affectedTimeRange: { start: fmtHHMM(overlap.start), end: fmtHHMM(overlap.end) },
      suggestedFix: heatBanFix(preset),
    });
  }
  return violations;
};

const mandatoryBreak5hRule: Rule = ({ preset }) => {
  const sched = deriveSchedule(preset);
  const FIVE_H = 5 * 60;
  const QUALIFYING_BREAK = 30;

  // No breaks at all is handled by the soft breakNotConfiguredRule. The hard 5h rule
  // only fires when break(s) exist but aren't timed to satisfy the constraint.
  if (preset.breaks.length === 0) return [];

  // Flexible breaks aren't materialized in segments. If there is one with adequate
  // duration whose window overlaps the work envelope, assume employees will time it
  // sensibly and skip the rule.
  const hasFlexibleCover = preset.breaks.some(
    (b) => b.scheduleType === 'flexible' && b.durationMinutes >= QUALIFYING_BREAK,
  );
  if (hasFlexibleCover) return [];

  const violations: Violation[] = [];
  type Block = { start: number; end: number; followedByBreakMin: number };
  const blocks: Block[] = [];
  let cur: Block | null = null;
  for (let i = 0; i < sched.segments.length; i++) {
    const seg = sched.segments[i];
    if (seg.kind === 'work') {
      if (!cur) cur = { start: seg.start, end: seg.end, followedByBreakMin: 0 };
      else cur.end = seg.end;
    } else {
      if (cur) {
        cur.followedByBreakMin = seg.end - seg.start;
        blocks.push(cur);
        cur = null;
      }
    }
  }
  if (cur) blocks.push(cur);

  for (const b of blocks) {
    const len = b.end - b.start;
    if (len > FIVE_H && b.followedByBreakMin < QUALIFYING_BREAK) {
      violations.push({
        ruleId: 'ksa.consecutive_5h',
        severity: 'hard',
        message: `Work runs ${Math.round((len / 60) * 10) / 10}h continuously without a break.`,
        citation: 'Saudi Labour Law Art. 101 — work cannot exceed 5 consecutive hours without a break of at least 30 minutes.',
        affectedTimeRange: { start: fmtHHMM(b.start), end: fmtHHMM(b.end) },
        suggestedFix: ensureBreakAfter5hFix(preset),
      });
      break;
    }
  }
  return violations;
};

const breakNotConfiguredRule: Rule = ({ preset }) => {
  if (preset.breaks.length > 0) return [];
  if (preset.workDurationMinutes <= 5 * 60) return [];
  return [
    {
      ruleId: 'ksa.break_not_configured',
      severity: 'soft',
      message: 'Mandatory break after 5 hours not configured.',
      citation: 'Saudi Labour Law Art. 101 — work cannot exceed 5 consecutive hours without a break.',
    },
  ];
};

const dailyWorkCapRule: Rule = ({ preset }) => {
  if (preset.workDurationMinutes <= 8 * 60) return [];
  return [
    {
      ruleId: 'ksa.daily_8h',
      severity: 'soft',
      message: `Daily work duration is ${(preset.workDurationMinutes / 60).toFixed(1)}h — exceeds the 8h standard.`,
      citation: 'Saudi Labour Law Art. 98 — standard working day is 8 hours.',
    },
  ];
};

const dailyPresenceCapRule: Rule = ({ preset }) => {
  const sched = deriveSchedule(preset);
  if (sched.presenceMin <= 12 * 60) return [];
  return [
    {
      ruleId: 'ksa.presence_12h',
      severity: 'hard',
      message: `Total presence is ${(sched.presenceMin / 60).toFixed(1)}h — exceeds the 12h cap.`,
      citation: 'Saudi Labour Law — total presence (including breaks) cannot exceed 12 hours per day.',
    },
  ];
};

const weeklyCapRule: Rule = ({ preset }) => {
  const weekly = preset.workDurationMinutes * 6;
  if (weekly <= 48 * 60) return [];
  return [
    {
      ruleId: 'ksa.weekly_48h',
      severity: 'soft',
      message: `Projected weekly hours ${Math.round(weekly / 60)}h on a 6-day week — exceeds the 48h cap.`,
      citation: 'Saudi Labour Law Art. 98 — weekly work cannot exceed 48 hours / 6 days.',
    },
  ];
};

const ramadanRule: Rule = ({ preset, context }) => {
  if (!context.employeeProfile?.observesRamadan) return [];
  if (!isRamadanDate(context.currentDate)) return [];
  if (preset.workDurationMinutes <= 6 * 60) return [];
  return [
    {
      ruleId: 'ksa.ramadan_6h',
      severity: 'hard',
      message: `Muslim employees are limited to 6h/day during Ramadan; this preset schedules ${(preset.workDurationMinutes / 60).toFixed(1)}h.`,
      citation: 'Saudi Labour Law Art. 98 — Muslim workers limited to 6h/day, 36h/week during Ramadan.',
    },
  ];
};

const fridayRestRule: Rule = ({ context }) => {
  if (context.currentDate.getDay() !== 5) return [];
  return [
    {
      ruleId: 'ksa.friday_rest',
      severity: 'soft',
      message: 'Friday is the default weekly rest day. Confirm employees are not scheduled.',
      citation: 'Saudi Labour Law Art. 104 — Friday is the default weekly rest day.',
    },
  ];
};

const rules: Rule[] = [
  heatBanRule,
  mandatoryBreak5hRule,
  breakNotConfiguredRule,
  dailyWorkCapRule,
  dailyPresenceCapRule,
  weeklyCapRule,
  ramadanRule,
  fridayRestRule,
];

export const evaluateCompliance = (args: ComplianceArgs): ComplianceResult => {
  const violations = rules.flatMap((r) => r(args));
  const status = violations.some((v) => v.severity === 'hard')
    ? 'red'
    : violations.length
      ? 'amber'
      : 'green';
  return { violations, status };
};
