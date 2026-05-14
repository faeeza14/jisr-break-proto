import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { ChevronDown } from 'lucide-react';
import {
  PageHeader,
  SmartBreadcrumb,
  Card,
  CardSection,
  Button,
  Field,
  Input,
  CalendarPopover,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  useToast,
} from '@jisr-hr/ds-web';
import { StepIndicator } from '../components/StepIndicator';
import { PresetPickerCard } from '../components/PresetPickerCard';
import { ComplianceSummaryCard } from '../components/ComplianceSummaryCard';
import { useAppStore } from '../store';
import { DAY_NAMES, addDays, eachDayInWeek, isoDay, parseIsoLocal, startOfSundayWeek } from '../lib/weekly';
// SelectDropdown helper defined at bottom
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
  const toast = useToast();
  const { presets, createTemplate } = useAppStore();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [activeWeekDay, setActiveWeekDay] = useState<number | null>(null);
  const [activeRotationCell, setActiveRotationCell] = useState<{ week: number; day: number } | null>(null);

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
    toast.success('Template created', `'${tpl.name}' is ready.`);
    setTimeout(() => navigate('/settings/attendance/shifts/settings'), 500);
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
      <PageHeader
        breadcrumb={
          <SmartBreadcrumb
            items={[
              { label: 'Settings', to: '/settings' },
              { label: 'Attendance' },
              { label: 'Shifts & scheduling', to: '/settings/attendance/shifts' },
              { label: 'Templates', to: '/settings/attendance/shifts/settings' },
              { label: 'New template' },
            ]}
          />
        }
        title="New template"
        description="Compose a weekly or rotating pattern of shift presets."
        border={false}
      />

      <div className="px-5 sm:px-6 max-w-3xl space-y-4">
        <Card>
          <StepIndicator steps={stepDefs} current={step} />
        </Card>

        {step === 0 && (
          <Card>
            <CardSection title="Pick a template type">
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
            </CardSection>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardSection title="Details">
              <div className="space-y-3">
                <Field label="Template name">
                  <Input
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
                  <Field label="Workdays" description="Days marked off skip automatically.">
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
                                ? 'bg-app-ink text-white border-app-ink dark:bg-app-ink-dark dark:text-app-bg'
                                : 'bg-white dark:bg-app-card-dark text-app-ink dark:text-app-ink-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark'
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
                      <SelectDropdown
                        value={String(draft.rotationCycleWeeks)}
                        options={[2, 3, 4, 6, 8].map((n) => ({
                          id: String(n),
                          label: `${n} weeks`,
                        }))}
                        onChange={(v) => setRotationLength(Number(v))}
                      />
                    </Field>
                    <Field label="Cycle starts on">
                      <CalendarPopover
                        value={parseIsoLocal(draft.rotationStartDate)}
                        onChange={(d) => d && update({ rotationStartDate: isoDay(d) })}
                      />
                    </Field>
                  </div>
                )}
              </div>
            </CardSection>
          </Card>
        )}

        {step === 2 && draft.type === 'day' && (
          <>
            <Card>
              <CardSection title="Pick the preset that runs on every selected workday">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {presetList.map((p) => {
                    const sched = deriveSchedule(p);
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
                    <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium mb-2">
                      Preview
                    </p>
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
              </CardSection>
            </Card>
            <ComplianceSummaryCard
              weekStart={weekStart}
              slots={summarySlots}
            />
          </>
        )}

        {step === 2 && draft.type === 'week' && (
          <>
            <Card>
              <CardSection title="Tap each workday to assign a preset. Days marked off skip.">
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
                    <span className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium mr-1">
                      Assign
                    </span>
                    {presetList.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const next = [...draft.weekDays];
                          next[activeWeekDay] = p.id;
                          update({ weekDays: next });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md hairline px-2 py-1 text-13 text-app-ink dark:text-app-ink-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark"
                      >
                        <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.nameEn}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => {
                        const next = [...draft.weekDays];
                        next[activeWeekDay] = null;
                        update({ weekDays: next });
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </CardSection>
            </Card>
            <ComplianceSummaryCard
              weekStart={weekStart}
              slots={summarySlots}
            />
          </>
        )}

        {step === 2 && draft.type === 'rotation' && (
          <>
            <Card>
              <CardSection title={`${draft.rotationCycleWeeks}-week cycle. Configure each week's pattern.`}>
                <div className="space-y-4">
                  {draft.rotationWeeks.map((wk, wi) => (
                    <div key={wi}>
                      <div className="text-13 font-medium mb-2 text-app-ink dark:text-app-ink-dark">Week {wi + 1}</div>
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
                      <span className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium mr-1">
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
                          className="inline-flex items-center gap-1.5 rounded-md hairline px-2 py-1 text-13 text-app-ink dark:text-app-ink-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark"
                        >
                          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.nameEn}
                        </button>
                      ))}
                      <div className="flex-1" />
                      <Button
                        variant="tertiary"
                        size="sm"
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
                      >
                        Clear
                      </Button>
                    </div>
                  )}
              </CardSection>
            </Card>
            <ComplianceSummaryCard
              weekStart={parseIsoLocal(draft.rotationStartDate)}
              slots={summarySlots}
            />
          </>
        )}

        <div className="flex justify-between gap-2 pt-1">
          <Button variant="secondary" onClick={() => navigate('/settings/attendance/shifts/settings')}>
            Cancel
          </Button>
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
                Create template
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
        : 'bg-white dark:bg-app-card-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark'
    }`}
  >
    <div className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{title}</div>
    <div className="mt-1 text-11 text-app-mute dark:text-app-mute-dark">{description}</div>
    <div className="mt-2 text-11 text-app-faint dark:text-app-faint-dark italic">{example}</div>
  </button>
);

const SelectDropdown = ({
  value,
  options,
  onChange,
  placeholder = 'Select…',
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const current = options.find((o) => o.id === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <Button
          variant="secondary"
          size="md"
          trailingIcon={<ChevronDown className="size-3.5" />}
          className="w-full justify-between"
        >
          <span className="truncate text-left flex-1">{current?.label ?? placeholder}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-trigger-width)]">
        {options.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={() => onChange(o.id)}>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
            <div className="text-11 mb-1 text-app-ink dark:text-app-ink-dark">{d.getDate()}</div>
            {off ? (
              <div className="rounded-md hairline border-dashed h-8 inline-flex items-center justify-center w-full text-11 text-app-faint dark:text-app-faint-dark italic">
                Off
              </div>
            ) : preset ? (
              <div
                className="rounded-md h-8 inline-flex items-center justify-center w-full text-11 font-medium truncate px-1 text-app-ink dark:text-app-ink-dark"
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
                  : 'hairline border-dashed hover:bg-app-surface dark:hover:bg-app-subtle-dark'
            }`}
            style={preset ? { borderLeft: `3px solid ${preset.color}`, backgroundColor: `${preset.color}22` } : undefined}
          >
            <div className="text-11 text-app-faint dark:text-app-faint-dark">{DAY_NAMES[d.getDay()]} {d.getDate()}</div>
            {off ? (
              <div className="mt-2 text-11 italic text-app-faint dark:text-app-faint-dark">Off</div>
            ) : preset ? (
              <div className="mt-1.5">
                <div className="text-11 font-medium truncate text-app-ink dark:text-app-ink-dark">{preset.nameEn}</div>
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
