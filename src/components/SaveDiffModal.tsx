import { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from './primitives/Button';
import { Pill } from './primitives/Pill';
import type { ShiftPreset } from '../types';
import { fmtDuration } from '../lib/time';

export type FieldDiff = { field: string; before: string; after: string };

const baseDiff = (a: ShiftPreset, b: ShiftPreset): FieldDiff[] => {
  const out: FieldDiff[] = [];
  if (a.nameEn !== b.nameEn) out.push({ field: 'Name (English)', before: a.nameEn, after: b.nameEn });
  if (a.nameAr !== b.nameAr) out.push({ field: 'Name (Arabic)', before: a.nameAr, after: b.nameAr });
  if (a.color !== b.color) out.push({ field: 'Color', before: a.color, after: b.color });
  if (a.workEnvironment !== b.workEnvironment)
    out.push({ field: 'Work environment', before: a.workEnvironment, after: b.workEnvironment });
  if (a.startTime !== b.startTime)
    out.push({ field: 'Start time', before: a.startTime, after: b.startTime });
  if (a.workDurationMinutes !== b.workDurationMinutes)
    out.push({
      field: 'Work duration',
      before: fmtDuration(a.workDurationMinutes),
      after: fmtDuration(b.workDurationMinutes),
    });
  // R1 — clocking is inline on the preset
  if (a.clockInWindowStart !== b.clockInWindowStart || a.clockInWindowEnd !== b.clockInWindowEnd)
    out.push({
      field: 'Clock-in window',
      before: `${a.clockInWindowStart}–${a.clockInWindowEnd}`,
      after: `${b.clockInWindowStart}–${b.clockInWindowEnd}`,
    });
  if (a.clockOutWindowStart !== b.clockOutWindowStart || a.clockOutWindowEnd !== b.clockOutWindowEnd)
    out.push({
      field: 'Clock-out window',
      before: `${a.clockOutWindowStart}–${a.clockOutWindowEnd}`,
      after: `${b.clockOutWindowStart}–${b.clockOutWindowEnd}`,
    });
  if (a.clockInGraceMinutes !== b.clockInGraceMinutes)
    out.push({
      field: 'Grace minutes',
      before: String(a.clockInGraceMinutes),
      after: String(b.clockInGraceMinutes),
    });
  if (a.geofenceRequired !== b.geofenceRequired)
    out.push({
      field: 'Geofence required',
      before: a.geofenceRequired ? 'Yes' : 'No',
      after: b.geofenceRequired ? 'Yes' : 'No',
    });
  if (a.overtimePolicyId !== b.overtimePolicyId)
    out.push({ field: 'Overtime policy', before: a.overtimePolicyId, after: b.overtimePolicyId });
  return out;
};

const breakDiff = (a: ShiftPreset, b: ShiftPreset): { added: string[]; removed: string[] } => {
  const aIds = new Map(a.breaks.map((x) => [x.id, x]));
  const bIds = new Map(b.breaks.map((x) => [x.id, x]));
  const added = b.breaks.filter((x) => !aIds.has(x.id)).map((x) => x.name);
  const removed = a.breaks.filter((x) => !bIds.has(x.id)).map((x) => x.name);
  return { added, removed };
};

type Props = {
  open: boolean;
  onClose: () => void;
  before: ShiftPreset | null;
  after: ShiftPreset;
  templatesAffected: number;
  cellsAffected: number;
  hardBefore: number;
  hardAfter: number;
  reasonRequired: boolean;
  onConfirm: (reason: string | null) => void;
};

export const SaveDiffModal = ({
  open,
  onClose,
  before,
  after,
  templatesAffected,
  cellsAffected,
  hardBefore,
  hardAfter,
  reasonRequired,
  onConfirm,
}: Props) => {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (!open) setReason('');
  }, [open]);
  if (!open) return null;
  if (!before) return null;
  const fields = baseDiff(before, after);
  const breaks = breakDiff(before, after);
  const reasonOk = !reasonRequired || reason.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm preset changes"
        className="w-full max-w-xl bg-white dark:bg-app-card-dark rounded-card hairline overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b-hair border-app-line dark:border-app-line-dark flex items-start justify-between gap-3">
          <div>
            <div className="text-13 font-medium">
              {reasonRequired ? 'This change introduces compliance violations' : 'Confirm preset changes'}
            </div>
            <div className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
              Review what changes and how it affects scheduled shifts.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-7 inline-flex items-center justify-center rounded-md hover:bg-app-surface dark:hover:bg-app-subtle-dark"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <section>
            <div className="label-caps mb-2">Field-level diff</div>
            {fields.length === 0 && breaks.added.length === 0 && breaks.removed.length === 0 ? (
              <div className="text-13 text-app-mute dark:text-app-mute-dark">No field changes.</div>
            ) : (
              <ul className="space-y-1.5 text-13">
                {fields.map((f) => (
                  <li key={f.field} className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{f.field}:</span>
                    <span className="text-app-mute dark:text-app-mute-dark line-through">{f.before}</span>
                    <ArrowRight className="size-3 text-app-faint" />
                    <span>{f.after}</span>
                  </li>
                ))}
                {breaks.added.length > 0 && (
                  <li>
                    <span className="font-medium">Breaks: </span>
                    <span className="text-ok-ink dark:text-ok-ink-dark">+ {breaks.added.join(', ')}</span>
                  </li>
                )}
                {breaks.removed.length > 0 && (
                  <li>
                    <span className="font-medium">Breaks: </span>
                    <span className="text-danger-ink dark:text-danger-ink-dark">
                      − {breaks.removed.join(', ')}
                    </span>
                  </li>
                )}
              </ul>
            )}
          </section>

          <section className="rounded-md hairline bg-app-subtle/40 dark:bg-app-subtle-dark/30 px-3 py-2.5">
            <div className="label-caps mb-1.5">Impact</div>
            <ul className="space-y-1 text-13 text-app-mute dark:text-app-mute-dark">
              <li>Affects {templatesAffected} template{templatesAffected === 1 ? '' : 's'}</li>
              <li>{cellsAffected} scheduled shift{cellsAffected === 1 ? '' : 's'} use this preset in the next 30 days</li>
            </ul>
          </section>

          <section className="rounded-md hairline px-3 py-2.5 flex items-center gap-3">
            <div className="label-caps">Compliance preview</div>
            <Pill tone={hardBefore > 0 ? 'red' : 'green'}>
              Before · {hardBefore} hard
            </Pill>
            <ArrowRight className="size-3 text-app-faint" />
            <Pill tone={hardAfter > 0 ? 'red' : 'green'}>
              After · {hardAfter} hard
            </Pill>
          </section>

          {reasonRequired && (
            <section>
              <label className="block">
                <span className="text-13 font-medium">Reason for override</span>
                <textarea
                  className="mt-1.5 field-input"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this change being made despite the violations?"
                />
                <span className="text-11 text-app-mute dark:text-app-mute-dark mt-1 block">
                  Required (10+ characters). Captured to the audit trail.
                </span>
              </label>
            </section>
          )}
        </div>

        <div className="px-5 py-3 border-t-hair border-app-line dark:border-app-line-dark flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {reasonRequired ? (
            <Button variant="danger" disabled={!reasonOk} onClick={() => onConfirm(reason.trim())}>
              Override · audit logged
            </Button>
          ) : (
            <Button variant="primary" onClick={() => onConfirm(null)}>
              Save and recompute
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
