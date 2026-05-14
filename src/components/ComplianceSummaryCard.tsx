import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { evaluateCompliance } from '../lib/compliance';
import type { ShiftPreset } from '../types';
import { Card, CardSectionLabel } from './primitives/Card';
import { DAY_NAMES_FULL, fmtMonShort } from '../lib/weekly';

type Slot = { date: Date; preset: ShiftPreset | null };

export const ComplianceSummaryCard = ({
  weekStart,
  slots,
}: {
  weekStart: Date;
  slots: Slot[];
  /** Kept for API compatibility with the vision proto; ignored in R1 */
  breakPolicies?: unknown;
}) => {
  const filled = slots.filter((s) => !!s.preset);
  if (filled.length === 0) return null;

  const issues: { day: string; message: string }[] = [];
  for (const s of filled) {
    if (!s.preset) continue;
    const r = evaluateCompliance({
      preset: s.preset,
      context: { currentDate: s.date, country: 'SA' },
    });
    for (const v of r.violations) {
      if (v.severity === 'hard') {
        issues.push({
          day: `${DAY_NAMES_FULL[s.date.getDay()]} ${fmtMonShort(s.date)} ${s.date.getDate()}`,
          message: v.message,
        });
      }
    }
  }

  return (
    <Card tone={issues.length ? 'danger' : 'default'}>
      <CardSectionLabel>Compliance summary</CardSectionLabel>
      <div className="text-11 text-app-mute dark:text-app-mute-dark mb-2">
        Evaluated against the week of {fmtMonShort(weekStart)} {weekStart.getDate()}, {weekStart.getFullYear()}
      </div>
      {issues.length === 0 ? (
        <div className="flex items-center gap-2 text-13 text-ok-ink dark:text-ok-ink-dark">
          <CheckCircle2 className="size-4" />
          No compliance violations detected.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {issues.map((it, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-13 text-danger-ink dark:text-danger-ink-dark"
            >
              <ShieldAlert className="size-4 mt-0.5 shrink-0" />
              <span>
                <span className="font-medium">{it.day}</span> · {it.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
