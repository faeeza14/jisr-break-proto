import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from './primitives/Button';
import { Field } from './primitives/Field';
import type { BreakInstance, BreakPolicy, BreakScheduleType } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (b: BreakInstance) => void;
  initial?: BreakInstance | null;
  breakPolicies: BreakPolicy[];
};

const blank = (): BreakInstance => ({
  id: `bk-${nanoid(6)}`,
  name: 'Break',
  breakPolicyId: 'bp2',
  scheduleType: 'flexible',
  flexibleWindow: { start: '09:00', end: '16:00' },
  durationMinutes: 15,
});

export const BreakSheet = ({ open, onClose, onSave, initial, breakPolicies }: Props) => {
  const [draft, setDraft] = useState<BreakInstance>(initial ?? blank());

  useEffect(() => {
    if (open) setDraft(initial ?? blank());
  }, [open, initial]);

  if (!open) return null;

  const update = (patch: Partial<BreakInstance>) => setDraft((d) => ({ ...d, ...patch }));

  const setSchedule = (kind: BreakScheduleType) => {
    if (kind === 'fixed') {
      update({ scheduleType: 'fixed', fixedTime: draft.fixedTime ?? '12:00', flexibleWindow: undefined, anchoredOffsetMinutes: undefined });
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

  return (
    <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'Edit break' : 'Add break'}
        className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white dark:bg-app-card-dark flex flex-col"
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

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Name">
            <input
              className="field-input"
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </Field>
          <Field label="Break policy" hint="Defines paid/unpaid behaviour and group assignment.">
            <select
              className="field-input"
              value={draft.breakPolicyId}
              onChange={(e) => update({ breakPolicyId: e.target.value })}
            >
              {breakPolicies.map((bp) => (
                <option key={bp.id} value={bp.id}>
                  {bp.name} · {bp.paid}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <div className="text-13 font-medium mb-1.5">Schedule</div>
            <div className="grid grid-cols-3 gap-2">
              {(['fixed', 'flexible', 'anchored'] as BreakScheduleType[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSchedule(k)}
                  className={`px-2 py-1.5 rounded-md text-13 hairline text-center capitalize ${
                    draft.scheduleType === k
                      ? 'bg-app-ink text-white border-app-ink dark:bg-app-ink-dark dark:text-app-ink'
                      : 'bg-white dark:bg-app-card-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <p className="text-11 text-app-mute dark:text-app-mute-dark mt-1.5">
              Fixed times happen at a set clock time. Flexible breaks can be taken any time within a window.
              Anchored breaks happen at an offset from clock-in.
            </p>
          </div>

          {draft.scheduleType === 'fixed' && (
            <Field label="Fixed time">
              <input
                type="time"
                className="field-input"
                value={draft.fixedTime ?? '12:00'}
                onChange={(e) => update({ fixedTime: e.target.value })}
              />
            </Field>
          )}
          {draft.scheduleType === 'flexible' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Window starts">
                <input
                  type="time"
                  className="field-input"
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
                <input
                  type="time"
                  className="field-input"
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
            <Field label="Minutes after clock-in">
              <input
                type="number"
                min={0}
                step={15}
                className="field-input"
                value={draft.anchoredOffsetMinutes ?? 240}
                onChange={(e) => update({ anchoredOffsetMinutes: Number(e.target.value) })}
              />
            </Field>
          )}

          <Field label="Duration (minutes)">
            <input
              type="number"
              min={5}
              step={5}
              className="field-input"
              value={draft.durationMinutes}
              onChange={(e) => update({ durationMinutes: Number(e.target.value) })}
            />
          </Field>

          <label className="flex items-center justify-between gap-3 px-3 py-2 hairline rounded-md">
            <div>
              <div className="text-13 font-medium">Paid override</div>
              <div className="text-11 text-app-mute dark:text-app-mute-dark">
                Force this break to be paid regardless of policy default.
              </div>
            </div>
            <input
              type="checkbox"
              className="size-4 accent-app-ink"
              checked={!!draft.paidOverride}
              onChange={(e) => update({ paidOverride: e.target.checked })}
            />
          </label>
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
