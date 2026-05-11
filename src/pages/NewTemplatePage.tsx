import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Breadcrumb } from '../components/PageHeader';
import { Card, CardSectionLabel } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { Field } from '../components/primitives/Field';
import { StepIndicator } from '../components/StepIndicator';
import { PresetPickerCard } from '../components/PresetPickerCard';
import { ComplianceSummaryCard } from '../components/ComplianceSummaryCard';
import { useAppStore } from '../store';
import { DAY_NAMES, addDays, eachDayInWeek, isoDay, parseIsoLocal, startOfSundayWeek } from '../lib/weekly';
import { deriveSchedule } from '../lib/segments';
import type { ShiftPreset, ShiftTemplate, TemplateType } from '../types';

const TODAY_ISO = '2026-08-15';

const stepDefs = [
  { id: 'type', label: 'Type' },
  { id: 'details', label: 'Details' },
  { id: 'compose', label: 'Compose' },
];

type Draft = {
  type: TemplateType | null;
  name: string;
  daysOfWeek: number[];
  dayPresetId?: string;
  weekDays: (string | null)[];
  rotationCycleWeeks: number;
  rotationStartDate: string;
  rotationWeeks: { dayPresetIds: (string | null)[] }[];
};

const blankDraft = (): Draft => ({
  type: null,
  name: '',
  daysOfWeek: [0, 1, 2, 3, 4],
  dayPresetId: undefined,
  weekDays: [null, null, null, null, null, null, null],
  rotationCycleWeeks: 2,
  rotationStartDate: '2026-08-16',
  rotationWeeks: [
    { dayPresetIds: [null, null, null, null, null, null, null] },
    { dayPresetIds: [null, null, null, null, null, null, null] },
  ],
});

export const NewTemplatePage = () => {
  const navigate = useNavigate();
  const { presets, breakPolicies, createTemplate } = useAppStore();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [activeWeekDay, setActiveWeekDay] = useState<number | null>(null);
  const [activeRotationCell, setActiveRotationCell] = useState<{ week: number; day: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const presetList = useMemo(() => Object.values(presets), [presets]);
  const weekStart = startOfSundayWeek(parseIsoLocal(TODAY_ISO));

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const setRotationLength = (n: number) => {
    setDraft((d) => {
      const cur = d.rotationWeeks;
      const next = Array.from(
        { length: n },
        (_, i) => cur[i] ?? { dayPresetIds: [null, null, null, null, null, null, null] },
      );
      return { ...d, rotationCycleWeeks: n, rotationWeeks: next };
    });
  };

  const toggleWorkday = (n: number) =>
    update({
      daysOfWeek: draft.daysOfWeek.includes(n)
        ? draft.daysOfWeek.filter((x) => x !== n)
        : [...draft.daysOfWeek, n].sort(),
    });

  const canContinue =
    step === 0
      ? draft.type !== null
      : step === 1
        ? draft.name.trim().length > 0 && draft.daysOfWeek.length > 0
        : true;

  const onSave = () => {
    if (!draft.type) return;
    const id = `tpl-${nanoid(6)}`;
    const tpl: ShiftTemplate = {
      id,
      name: draft.name.trim(),
      type: draft.type,
      daysOfWeek: draft.daysOfWeek,
      ...(draft.type === 'day' ? { dayPresetId: draft.dayPresetId } : {}),
      ...(draft.type === 'week' ? { weekDays: draft.weekDays } : {}),
      ...(draft.type === 'rotation'
        ? {
            rotationStartDate: draft.rotationStartDate,
            rotationWeeks: draft.rotationWeeks,
          }
        : {}),
    };
    createTemplate(tpl);
    setToast(`Template '${tpl.name}' created`);
    setTimeout(() => navigate('/settings/attendance/shifts/settings'), 600);
  };

  const summarySlots = useMemo(() => {
    const days = eachDayInWeek(weekStart);
    if (draft.type === 'day' && draft.dayPresetId) {
      const p = presets[draft.dayPresetId] ?? null;
      return days.map((d, i) => ({ date: d, preset: draft.daysOfWeek.includes(i) ? p : null }));
    }
    if (draft.type === 'week') {
      return days.map((d, i) => ({ date: d, preset: draft.weekDays[i] ? presets[draft.weekDays[i]!] : null }));
    }
    if (draft.type === 'rotation') {
      const w = draft.rotationWeeks[0];
      if (!w) return [];
      return days.map((d, i) => ({
        date: d,
        preset: w.dayPresetIds[i] ? presets[w.dayPresetIds[i]!] : null,
      }));
    }
    return [];
  }, [draft, presets, weekStart]);

  return (
    <div className="pb-12">
      <div className="px-5 sm:px-6 pt-5 pb-3">
        <Breadcrumb
          items={[
            { label: 'Settings', to: '/settings' },
            { label: 'Attendance' },
            { label: 'Shifts & scheduling', to: '/settings/attendance/shifts' },
            { label: 'Templates', to: '/settings/attendance/shifts/settings' },
            { label: 'New template' },
          ]}
        />
        <h1 className="mt-2 text-[18px] font-medium">New template</h1>
        <p className="text-13 text-app-mute dark:text-app-mute-dark">
          Compose a weekly or rotating pattern of shift presets.
        </p>
      </div>

      <div className="px-5 sm:px-6 max-w-3xl space-y-4">
        <Card>
          <StepIndicator steps={stepDefs} current={step} />
        </Card>

        {step === 0 && (
          <Card>
            <CardSectionLabel>Pick a template type</CardSectionLabel>
            <div className="grid sm:grid-cols-3 gap-3">
              <TypeCard
                title="Day template"
                description="One preset that repeats on the chosen workdays."
                example="Office staff on Sun–Thu, all running 09:00–17:00."
                selected={draft.type === 'day'}
                onClick={() => update({ type: 'day' })}
              />
              <TypeCard
                title="Week template"
                description="Different presets on different weekdays."
                example="Reception runs early shift Sun–Wed, late shift Thu."
                selected={draft.type === 'week'}
                onClick={() => update({ type: 'week' })}
              />
              <TypeCard
                title="Rotation template"
                description="Multi-week cycle, e.g. 4-on-3-off or alternating shifts."
                example="Maintenance crew rotates day/night every 2 weeks."
                selected={draft.type === 'rotation'}
                onClick={() => update({ type: 'rotation' })}
              />
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardSectionLabel>Details</CardSectionLabel>
            <div className="space-y-3">
              <Field label="Template name">
                <input
                  className="field-input"
                  value={draft.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Office Sun–Thu"
                  autoFocus
                />
              </Field>
              <Field label="Type">
                <div className="text-13 text-app-mute dark:text-app-mute-dark">
                  {draft.type === 'day' ? 'Day template' : draft.type === 'week' ? 'Week template' : 'Rotation template'}
                </div>
              </Field>
              {(draft.type === 'day' || draft.type === 'week') && (
                <Field label="Workdays" hint="Days marked off skip automatically.">
                  <div className="flex gap-1.5 flex-wrap">
                    {DAY_NAMES.map((name, i) => {
                      const on = draft.daysOfWeek.includes(i);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleWorkday(i)}
                          className={`px-3 py-1.5 rounded-md text-13 hairline ${
                            on
                              ? 'bg-app-ink text-white border-app-ink dark:bg-app-ink-dark dark:text-app-ink'
                              : 'bg-white dark:bg-app-card-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
              {draft.type === 'rotation' && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Cycle length">
                    <select
                      className="field-input"
                      value={draft.rotationCycleWeeks}
                      onChange={(e) => setRotationLength(Number(e.target.value))}
                    >
                      {[2, 3, 4, 6, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} weeks
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Cycle starts on">
                    <input
                      type="date"
                      className="field-input"
                      value={draft.rotationStartDate}
                      onChange={(e) => update({ rotationStartDate: e.target.value })}
                    />
                  </Field>
                </div>
              )}
            </div>
          </Card>
        )}

        {step === 2 && draft.type === 'day' && (
          <>
            <Card>
              <CardSectionLabel>Pick the preset that runs on every selected workday</CardSectionLabel>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {presetList.map((p) => {
                  const sched = deriveSchedule(p, breakPolicies);
                  return (
                    <PresetPickerCard
                      key={p.id}
                      preset={p}
                      endMin={sched.endMin}
                      selected={draft.dayPresetId === p.id}
                      onClick={() => update({ dayPresetId: p.id })}
                    />
                  );
                })}
              </div>
              {draft.dayPresetId && (
                <div className="mt-4">
                  <div className="label-caps mb-2">Preview</div>
                  <WeekPreviewStrip
                    weekStart={weekStart}
                    daysOfWeek={draft.daysOfWeek}
                    presetIds={Array.from({ length: 7 }, (_, i) =>
                      draft.daysOfWeek.includes(i) ? draft.dayPresetId! : null,
                    )}
                    presets={presets}
                  />
                </div>
              )}
            </Card>
            <ComplianceSummaryCard
              weekStart={weekStart}
              slots={summarySlots}
              breakPolicies={breakPolicies}
            />
          </>
        )}

        {step === 2 && draft.type === 'week' && (
          <>
            <Card>
              <CardSectionLabel>Tap each workday to assign a preset. Days marked off skip.</CardSectionLabel>
              <WeekCompositionGrid
                weekStart={weekStart}
                daysOfWeek={draft.daysOfWeek}
                presetIds={draft.weekDays}
                presets={presets}
                activeIndex={activeWeekDay}
                onPickDay={(i) => setActiveWeekDay(i)}
              />
              {activeWeekDay !== null && draft.daysOfWeek.includes(activeWeekDay) && (
                <div className="mt-3 hairline rounded-md p-3 flex flex-wrap items-center gap-2">
                  <span className="label-caps mr-1">Assign</span>
                  {presetList.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        const next = [...draft.weekDays];
                        next[activeWeekDay] = p.id;
                        update({ weekDays: next });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md hairline px-2 py-1 text-13 hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.nameEn}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...draft.weekDays];
                      next[activeWeekDay] = null;
                      update({ weekDays: next });
                    }}
                    className="inline-flex items-center rounded-md px-2 py-1 text-11 text-app-mute dark:text-app-mute-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
                  >
                    Clear
                  </button>
                </div>
              )}
            </Card>
            <ComplianceSummaryCard
              weekStart={weekStart}
              slots={summarySlots}
              breakPolicies={breakPolicies}
            />
          </>
        )}

        {step === 2 && draft.type === 'rotation' && (
          <>
            <Card>
              <CardSectionLabel>
                {draft.rotationCycleWeeks}-week cycle. Configure each week's pattern.
              </CardSectionLabel>
              <div className="space-y-4">
                {draft.rotationWeeks.map((wk, wi) => (
                  <div key={wi}>
                    <div className="text-13 font-medium mb-2">Week {wi + 1}</div>
                    <WeekCompositionGrid
                      weekStart={addDays(parseIsoLocal(draft.rotationStartDate), wi * 7)}
                      daysOfWeek={draft.daysOfWeek}
                      presetIds={wk.dayPresetIds}
                      presets={presets}
                      activeIndex={activeRotationCell?.week === wi ? activeRotationCell.day : null}
                      onPickDay={(d) => setActiveRotationCell({ week: wi, day: d })}
                    />
                  </div>
                ))}
              </div>
              {activeRotationCell &&
                draft.daysOfWeek.includes(activeRotationCell.day) && (
                  <div className="mt-3 hairline rounded-md p-3 flex flex-wrap items-center gap-2">
                    <span className="label-caps mr-1">
                      Week {activeRotationCell.week + 1} · {DAY_NAMES[activeRotationCell.day]}
                    </span>
                    {presetList.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const next = draft.rotationWeeks.map((w, i) =>
                            i === activeRotationCell.week
                              ? {
                                  dayPresetIds: w.dayPresetIds.map((id, di) =>
                                    di === activeRotationCell.day ? p.id : id,
                                  ),
                                }
                              : w,
                          );
                          update({ rotationWeeks: next });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md hairline px-2 py-1 text-13 hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
                      >
                        <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.nameEn}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={() => {
                        const next = draft.rotationWeeks.map((w, i) =>
                          i === activeRotationCell.week
                            ? {
                                dayPresetIds: w.dayPresetIds.map((id, di) =>
                                  di === activeRotationCell.day ? null : id,
                                ),
                              }
                            : w,
                        );
                        update({ rotationWeeks: next });
                      }}
                      className="inline-flex items-center rounded-md px-2 py-1 text-11 text-app-mute dark:text-app-mute-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
                    >
                      Clear
                    </button>
                  </div>
                )}
            </Card>
            <ComplianceSummaryCard
              weekStart={parseIsoLocal(draft.rotationStartDate)}
              slots={summarySlots}
              breakPolicies={breakPolicies}
            />
          </>
        )}

        <div className="flex justify-between gap-2 pt-1">
          <Link
            to="/settings/attendance/shifts/settings"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg font-medium h-9 px-3.5 text-13 bg-white dark:bg-app-card-dark hairline hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
          >
            Cancel
          </Link>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {step < 2 ? (
              <Button variant="primary" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button variant="primary" onClick={onSave}>
                {toast ?? 'Create template'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TypeCard = ({
  title,
  description,
  example,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  example: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left p-4 rounded-md hairline transition ${
      selected
        ? 'ring-2 ring-app-ink dark:ring-app-ink-dark bg-app-subtle/40 dark:bg-app-subtle-dark/40'
        : 'bg-white dark:bg-app-card-dark hover:bg-app-subtle/40 dark:hover:bg-app-subtle-dark/40'
    }`}
  >
    <div className="text-13 font-medium">{title}</div>
    <div className="mt-1 text-11 text-app-mute dark:text-app-mute-dark">{description}</div>
    <div className="mt-2 text-11 text-app-faint dark:text-app-faint-dark italic">{example}</div>
  </button>
);

const WeekPreviewStrip = ({
  weekStart,
  daysOfWeek,
  presetIds,
  presets,
}: {
  weekStart: Date;
  daysOfWeek: number[];
  presetIds: (string | null)[];
  presets: Record<string, ShiftPreset>;
}) => {
  const days = eachDayInWeek(weekStart);
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d, i) => {
        const pid = presetIds[i];
        const preset = pid ? presets[pid] : null;
        const off = !daysOfWeek.includes(i);
        return (
          <div key={isoDay(d)} className="text-center">
            <div className="text-11 text-app-faint dark:text-app-faint-dark">{DAY_NAMES[d.getDay()]}</div>
            <div className="text-11 mb-1">{d.getDate()}</div>
            {off ? (
              <div className="rounded-md hairline border-dashed h-8 inline-flex items-center justify-center w-full text-11 text-app-faint dark:text-app-faint-dark italic">
                Off
              </div>
            ) : preset ? (
              <div
                className="rounded-md h-8 inline-flex items-center justify-center w-full text-11 font-medium truncate px-1"
                style={{ borderLeft: `3px solid ${preset.color}`, backgroundColor: `${preset.color}22` }}
              >
                {preset.nameEn}
              </div>
            ) : (
              <div className="rounded-md hairline h-8 inline-flex items-center justify-center w-full text-11 text-app-faint dark:text-app-faint-dark">
                +
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const WeekCompositionGrid = ({
  weekStart,
  daysOfWeek,
  presetIds,
  presets,
  activeIndex,
  onPickDay,
}: {
  weekStart: Date;
  daysOfWeek: number[];
  presetIds: (string | null)[];
  presets: Record<string, ShiftPreset>;
  activeIndex: number | null;
  onPickDay: (i: number) => void;
}) => {
  const days = eachDayInWeek(weekStart);
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d, i) => {
        const pid = presetIds[i];
        const preset = pid ? presets[pid] : null;
        const off = !daysOfWeek.includes(i);
        const active = activeIndex === i;
        return (
          <button
            key={isoDay(d)}
            type="button"
            onClick={() => onPickDay(i)}
            disabled={off}
            className={`text-left h-24 rounded-md p-2 transition ${
              active ? 'outline outline-2 outline-info-ink dark:outline-info-ink-dark' : ''
            } ${
              off
                ? 'bg-app-subtle/40 dark:bg-app-subtle-dark/30 cursor-not-allowed'
                : preset
                  ? ''
                  : 'hairline border-dashed hover:bg-app-subtle/40 dark:hover:bg-app-subtle-dark/40'
            }`}
            style={preset ? { borderLeft: `3px solid ${preset.color}`, backgroundColor: `${preset.color}22` } : undefined}
          >
            <div className="text-11 text-app-faint dark:text-app-faint-dark">{DAY_NAMES[d.getDay()]} {d.getDate()}</div>
            {off ? (
              <div className="mt-2 text-11 italic text-app-faint dark:text-app-faint-dark">Off</div>
            ) : preset ? (
              <div className="mt-1.5">
                <div className="text-11 font-medium truncate">{preset.nameEn}</div>
                <div className="text-[10px] text-app-mute dark:text-app-mute-dark">
                  {preset.startTime}
                </div>
              </div>
            ) : (
              <div className="mt-2 text-13 text-app-faint dark:text-app-faint-dark">+</div>
            )}
          </button>
        );
      })}
    </div>
  );
};

