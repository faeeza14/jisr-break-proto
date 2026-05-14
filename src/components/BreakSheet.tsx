/**
 * R1 BreakSheet — fully inline break editor with a live mini-preview
 * of the parent shift at the top, so the user can see exactly where
 * the in-progress break lands as they edit duration / schedule.
 */
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button, Field, Input, NumberInput, Switch, Separator } from '@jisr-hr/ds-web';
import type { BreakInstance, BreakScheduleType, ShiftPreset } from '../types';
import { deriveSchedule } from '../lib/segments';
import { Timeline } from './timeline/Timeline';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (b: BreakInstance) => void;
  initial?: BreakInstance | null;
  /** Parent preset — fuels the mini live preview at the top of the drawer */
  preset: ShiftPreset;
};

const blank = (): BreakInstance => ({
  id: `bk-${nanoid(6)}`,
  name: 'Break',
  scheduleType: 'flexible',
  flexibleWindow: { start: '09:00', end: '16:00' },
  durationMinutes: 15,
  paid: 'unpaid',
  countTowardWorkHours: false,
  autoMandatePaidDuringHeatBan: false,
  forceBreakAfter5h: true,
});

const PAID_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'mixed', label: 'Mixed' },
] as const;

const SCHEDULE_OPTIONS = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'anchored', label: 'Anchored' },
] as const;

export const BreakSheet = ({ open, onClose, onSave, initial, preset }: Props) => {
  const [draft, setDraft] = useState<BreakInstance>(initial ?? blank());

  useEffect(() => {
    if (open) setDraft(initial ?? blank());
  }, [open, initial]);

  // Build a temp preset that has the draft break swapped in / appended,
  // so the mini timeline can render exactly the shape the user is editing.
  const tempPreset = useMemo<ShiftPreset>(() => {
    const others = preset.breaks.filter((b) => b.id !== draft.id);
    return { ...preset, breaks: [...others, draft] };
  }, [preset, draft]);

  const sched = useMemo(() => deriveSchedule(tempPreset), [tempPreset]);
  const flexFromDraft = useMemo(
    () =>
      sched.breakInstants
        .filter((bi) => bi.b.scheduleType === 'flexible')
        .map((bi) => ({ b: bi.b, start: bi.start, end: bi.end })),
    [sched],
  );

  if (!open) return null;

  const update = (patch: Partial<BreakInstance>) => setDraft((d) => ({ ...d, ...patch }));

  const setSchedule = (kind: BreakScheduleType) => {
    if (kind === 'fixed') {
      update({
        scheduleType: 'fixed',
        fixedTime: draft.fixedTime ?? '12:00',
        flexibleWindow: undefined,
        anchoredOffsetMinutes: undefined,
      });
    } else if (kind === 'flexible') {
      update({
        scheduleType: 'flexible',
        flexibleWindow: draft.flexibleWindow ?? { start: '09:00', end: '16:00' },
        fixedTime: undefined,
        anchoredOffsetMinutes: undefined,
      });
    } else {
      update({
        scheduleType: 'anchored',
        anchoredOffsetMinutes: draft.anchoredOffsetMinutes ?? 240,
        fixedTime: undefined,
        flexibleWindow: undefined,
      });
    }
  };

  // Small inline segmented picker — keeps the file self-contained
  const Seg = <T extends string>({
    value,
    onChange,
    options,
  }: {
    value: T;
    onChange: (v: T) => void;
    options: readonly { value: T; label: string }[];
  }) => (
    <div className="inline-flex rounded-lg hairline p-0.5 bg-white dark:bg-app-card-dark">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={[
              'px-3 h-8 text-13 rounded-md transition-colors',
              active
                ? 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-bg-dark'
                : 'text-app-mute dark:text-app-mute-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark',
            ].join(' ')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'Edit break' : 'Add break'}
        className="absolute right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white dark:bg-app-card-dark flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-3.5 border-b-hair border-app-line dark:border-app-line-dark flex items-center justify-between">
          <div>
            <div className="text-13 font-medium">{initial ? 'Edit break' : 'Add break'}</div>
            <div className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
              Configure how this break is scheduled and paid.
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
        </header>

        {/* Mini live preview — the draft break is highlighted as the user edits */}
        <div className="px-5 py-3 border-b-hair border-app-line dark:border-app-line-dark bg-app-bg dark:bg-app-card-dark/40">
          <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium mb-2">
            Live preview
          </p>
          <Timeline
            schedule={sched}
            showHeatBan={false}
            showViolations={false}
            flexibleBreaks={flexFromDraft}
            clocking={{
              clockInWindowStart: preset.clockInWindowStart,
              clockInWindowEnd: preset.clockInWindowEnd,
              clockOutWindowStart: preset.clockOutWindowStart,
              clockOutWindowEnd: preset.clockOutWindowEnd,
              clockInGraceMinutes: preset.clockInGraceMinutes,
            }}
            highlightBreakId={draft.id}
            compact
          />
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Name" required>
            <Input
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g. Lunch"
            />
          </Field>

          <Field
            label="Paid"
            description="Whether this break counts toward payroll."
          >
            <Seg
              value={draft.paid}
              onChange={(v) => update({ paid: v })}
              options={PAID_OPTIONS}
            />
          </Field>

          <Field label="Schedule">
            <Seg
              value={draft.scheduleType}
              onChange={(v) => setSchedule(v)}
              options={SCHEDULE_OPTIONS}
            />
          </Field>

          {draft.scheduleType === 'fixed' && (
            <Field label="Fixed time">
              <Input
                type="time"
                value={draft.fixedTime ?? '12:00'}
                onChange={(e) => update({ fixedTime: e.target.value })}
              />
            </Field>
          )}
          {draft.scheduleType === 'flexible' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Window starts">
                <Input
                  type="time"
                  value={draft.flexibleWindow?.start ?? '09:00'}
                  onChange={(e) =>
                    update({
                      flexibleWindow: {
                        start: e.target.value,
                        end: draft.flexibleWindow?.end ?? '16:00',
                      },
                    })
                  }
                />
              </Field>
              <Field label="Window ends">
                <Input
                  type="time"
                  value={draft.flexibleWindow?.end ?? '16:00'}
                  onChange={(e) =>
                    update({
                      flexibleWindow: {
                        start: draft.flexibleWindow?.start ?? '09:00',
                        end: e.target.value,
                      },
                    })
                  }
                />
              </Field>
            </div>
          )}
          {draft.scheduleType === 'anchored' && (
            <Field label="Minutes after clock-in" description="Offset from the start of the shift.">
              <NumberInput
                value={draft.anchoredOffsetMinutes ?? 240}
                onChange={(v) => update({ anchoredOffsetMinutes: v })}
                min={0}
                max={600}
                step={15}
                endAddon="min"
              />
            </Field>
          )}

          <Field label="Duration">
            <NumberInput
              value={draft.durationMinutes}
              onChange={(v) => update({ durationMinutes: v })}
              min={5}
              max={120}
              step={5}
              endAddon="min"
            />
          </Field>

          <Separator />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                Counts toward work hours
              </p>
              <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
                Break duration included in the daily work cap.
              </p>
            </div>
            <Switch
              checked={draft.countTowardWorkHours}
              onCheckedChange={(v) => update({ countTowardWorkHours: v })}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                Force break after 5 hours
              </p>
              <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
                KSA Labour Law Art. 101 — mandatory for compliance.
              </p>
            </div>
            <Switch
              checked={draft.forceBreakAfter5h}
              onCheckedChange={(v) => update({ forceBreakAfter5h: v })}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                Auto-mandate paid during heat ban
              </p>
              <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
                Outdoor work overlapping 12:00–15:00 triggers a paid mandatory break.
              </p>
            </div>
            <Switch
              checked={draft.autoMandatePaidDuringHeatBan}
              onCheckedChange={(v) => update({ autoMandatePaidDuringHeatBan: v })}
            />
          </div>
        </div>

        <footer className="px-5 py-3 border-t-hair border-app-line dark:border-app-line-dark flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onSave(draft)}>
            Save break
          </Button>
        </footer>
      </div>
    </div>
  );
};
