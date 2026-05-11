import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useAppStore } from '../store';
import {
  DAY_NAMES,
  DAY_NAMES_FULL,
  addDays,
  eachDayInWeek,
  fmtWeekRange,
  isWeekend,
  isoDay,
  parseIsoLocal,
  startOfSundayWeek,
} from '../lib/weekly';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { Pill } from '../components/primitives/Pill';
import { PresetPickerCard } from '../components/PresetPickerCard';
import { evaluateCompliance } from '../lib/compliance';
import { deriveSchedule } from '../lib/segments';
import type { Assignment, BreakPolicy, Employee, ShiftPreset } from '../types';

const TODAY_ISO = '2026-08-15';

type SelectedCell = { employeeId: string; date: string } | null;

const hardViolationsOn = (
  preset: ShiftPreset | undefined,
  date: Date,
  breakPolicies: BreakPolicy[],
  employee?: Employee,
) => {
  if (!preset) return [];
  const r = evaluateCompliance({
    preset,
    breakPolicies,
    context: {
      currentDate: date,
      country: 'SA',
      employeeProfile: employee
        ? { id: employee.id, name: employee.name, groupId: employee.groupId, observesRamadan: employee.observesRamadan }
        : undefined,
    },
  });
  return r.violations.filter((v) => v.severity === 'hard');
};

const violatesOn = (
  preset: ShiftPreset | undefined,
  date: Date,
  breakPolicies: BreakPolicy[],
  employee?: Employee,
): boolean => hardViolationsOn(preset, date, breakPolicies, employee).length > 0;

const violationLabel = (ruleId: string): string => {
  if (ruleId === 'ksa.heat_ban') return 'Heat ban';
  if (ruleId === 'ksa.consecutive_5h') return '5h limit';
  if (ruleId === 'ksa.presence_12h') return '12h cap';
  if (ruleId === 'ksa.ramadan_6h') return 'Ramadan';
  return 'Violation';
};

export const SchedulerPage = () => {
  const {
    employees,
    presets,
    assignments,
    breakPolicies,
    groups,
    upsertAssignment,
    removeAssignment,
    swapAssignments,
    applyPresetToWeek,
  } = useAppStore();
  const [params, setParams] = useSearchParams();

  const initialWeekIso = params.get('weekStart');
  const [weekStart, setWeekStart] = useState<Date>(() => {
    if (initialWeekIso) return parseIsoLocal(initialWeekIso);
    return startOfSundayWeek(parseIsoLocal(TODAY_ISO));
  });

  useEffect(() => {
    const iso = isoDay(weekStart);
    if (params.get('weekStart') !== iso) {
      const next = new URLSearchParams(params);
      next.set('weekStart', iso);
      setParams(next, { replace: true });
    }
  }, [weekStart, params, setParams]);

  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [selected, setSelected] = useState<SelectedCell>(null);
  const [drag, setDrag] = useState<SelectedCell>(null);

  const days = eachDayInWeek(weekStart);
  const todayDate = parseIsoLocal(TODAY_ISO);
  const todayIso = isoDay(todayDate);

  const filteredEmployees = useMemo(
    () => (groupFilter === 'all' ? employees : employees.filter((e) => e.groupId === groupFilter)),
    [employees, groupFilter],
  );

  const assignmentMap = useMemo(() => {
    const m: Record<string, Assignment> = {};
    for (const a of assignments) m[`${a.employeeId}|${a.date}`] = a;
    return m;
  }, [assignments]);

  const lookup = (empId: string, date: string): Assignment | undefined =>
    assignmentMap[`${empId}|${date}`];

  const visibleAssignments = useMemo(() => {
    const dayIsos = days.map(isoDay);
    return filteredEmployees.flatMap((e) =>
      dayIsos.map((d) => assignmentMap[`${e.id}|${d}`]).filter(Boolean) as Assignment[],
    );
  }, [filteredEmployees, days, assignmentMap]);

  const shiftCount = visibleAssignments.filter((a) => a.presetId).length;
  const violationCount = visibleAssignments.filter((a) => {
    if (!a.presetId) return false;
    const emp = employees.find((e) => e.id === a.employeeId);
    return violatesOn(presets[a.presetId], parseIsoLocal(a.date), breakPolicies, emp);
  }).length;

  const isEmpty = visibleAssignments.length === 0;

  const onAssign = (presetId: string | null) => {
    if (!selected) return;
    upsertAssignment({
      employeeId: selected.employeeId,
      date: selected.date,
      presetId,
      source: 'manual',
    });
  };

  const onClear = () => {
    if (!selected) return;
    removeAssignment(selected.employeeId, selected.date);
  };

  const onApplyToWeek = (presetId: string | null) => {
    if (!selected) return;
    applyPresetToWeek(selected.employeeId, isoDay(weekStart), presetId);
  };

  const onCellDrop = (target: SelectedCell, source: SelectedCell) => {
    if (!target || !source) return;
    if (source.employeeId === target.employeeId && source.date === target.date) return;
    if (source.employeeId === target.employeeId) {
      const sourceA = lookup(source.employeeId, source.date);
      upsertAssignment({
        employeeId: target.employeeId,
        date: target.date,
        presetId: sourceA?.presetId ?? null,
        source: 'manual',
      });
      removeAssignment(source.employeeId, source.date);
    } else {
      const sourcePreset = lookup(source.employeeId, source.date)?.presetId ?? null;
      const targetEmp = employees.find((e) => e.id === target.employeeId);
      const willViolate = sourcePreset
        ? violatesOn(presets[sourcePreset], parseIsoLocal(target.date), breakPolicies, targetEmp)
        : false;
      if (willViolate && !window.confirm(`This creates a heat ban violation on ${target.date}. Continue?`)) {
        return;
      }
      swapAssignments(
        { employeeId: source.employeeId, date: source.date },
        { employeeId: target.employeeId, date: target.date },
      );
    }
  };

  return (
    <div className="pb-12">
      <div className="px-5 sm:px-6 pt-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center hairline rounded-md overflow-hidden bg-white dark:bg-app-card-dark">
            <button
              type="button"
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              aria-label="Previous week"
              className="size-8 inline-flex items-center justify-center hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-3 text-13 font-medium">{fmtWeekRange(weekStart)}</span>
            <button
              type="button"
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              aria-label="Next week"
              className="size-8 inline-flex items-center justify-center hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setWeekStart(startOfSundayWeek(todayDate))}>
            Today
          </Button>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="field-input h-8 max-w-[220px]"
            aria-label="Filter by group"
          >
            <option value="all">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <div className="flex-1" />
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const first = filteredEmployees[0];
              if (first) setSelected({ employeeId: first.id, date: todayIso });
            }}
          >
            <Plus className="size-3.5" /> Assign
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Employees" value={String(filteredEmployees.length)} />
          <StatCard label="Shifts this week" value={String(shiftCount)} />
          <StatCard
            label="Violations"
            value={String(violationCount)}
            tone={violationCount > 0 ? 'red' : 'green'}
          />
        </div>

        {isEmpty && (
          <div className="rounded-md hairline bg-app-subtle/40 dark:bg-app-subtle-dark/40 p-3 text-13 text-app-mute dark:text-app-mute-dark">
            No shifts scheduled this week. Click any cell to assign, or use Templates to bulk-assign.
          </div>
        )}

        <div className="overflow-x-auto rounded-card bg-white dark:bg-app-card-dark hairline">
          <div
            className="grid min-w-[800px]"
            style={{ gridTemplateColumns: '180px repeat(7, minmax(80px, 1fr))' }}
          >
            <div className="px-3 py-2 label-caps border-b-hair border-app-line dark:border-app-line-dark">
              Employee
            </div>
            {days.map((d) => {
              const iso = isoDay(d);
              const isToday = iso === todayIso;
              return (
                <div
                  key={iso}
                  className={`px-2 py-2 text-center border-b-hair border-app-line dark:border-app-line-dark ${
                    isWeekend(d) ? 'bg-app-subtle/40 dark:bg-app-subtle-dark/30' : ''
                  }`}
                >
                  <div className="text-11 text-app-faint dark:text-app-faint-dark">{DAY_NAMES[d.getDay()]}</div>
                  <div
                    className={`text-13 ${
                      isToday
                        ? 'text-info-ink dark:text-info-ink-dark font-medium'
                        : 'text-app-ink dark:text-app-ink-dark'
                    }`}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="contents"
              >
                <div className="px-3 py-2.5 border-b-hair border-app-line dark:border-app-line-dark">
                  <div className="text-13 font-medium truncate">{emp.name}</div>
                  <div className="text-11 text-app-faint dark:text-app-faint-dark truncate">
                    {emp.role}
                  </div>
                </div>
                {days.map((d) => {
                  const iso = isoDay(d);
                  const a = lookup(emp.id, iso);
                  const preset = a?.presetId ? presets[a.presetId] : undefined;
                  const violates = preset ? violatesOn(preset, d, breakPolicies, emp) : false;
                  const isSelected =
                    selected?.employeeId === emp.id && selected.date === iso;
                  const weekend = isWeekend(d);
                  return (
                    <Cell
                      key={iso}
                      preset={preset}
                      isOff={!a || a.presetId === null}
                      explicitOff={a?.presetId === null}
                      weekend={weekend}
                      violates={violates}
                      selected={isSelected}
                      onClick={() => setSelected({ employeeId: emp.id, date: iso })}
                      draggable={!!preset}
                      onDragStart={() => setDrag({ employeeId: emp.id, date: iso })}
                      onDrop={() => onCellDrop({ employeeId: emp.id, date: iso }, drag)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-11 text-app-faint dark:text-app-faint-dark">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm border-l-[3px]" style={{ borderColor: '#2F9C95', backgroundColor: '#2F9C9522' }} />
            Assigned shift
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm border border-dashed border-app-faint" />
            Empty workday
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-app-subtle dark:bg-app-subtle-dark" />
            Off
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm ring-[1.5px] ring-danger-ink" />
            Violation
          </span>
        </div>

        {selected && (
          <AssignmentPanel
            selected={selected}
            employee={employees.find((e) => e.id === selected.employeeId)!}
            currentPresetId={lookup(selected.employeeId, selected.date)?.presetId ?? null}
            presets={Object.values(presets)}
            breakPolicies={breakPolicies}
            onPick={onAssign}
            onClear={onClear}
            onMarkOff={() => onAssign(null)}
            onApplyToWeek={(pid) => onApplyToWeek(pid)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'green' | 'red';
}) => (
  <div className="rounded-md bg-app-subtle/60 dark:bg-app-subtle-dark/60 px-4 py-3">
    <div className="label-caps">{label}</div>
    <div
      className={`mt-1 text-[18px] font-medium ${
        tone === 'red'
          ? 'text-danger-ink dark:text-danger-ink-dark'
          : tone === 'green'
            ? 'text-ok-ink dark:text-ok-ink-dark'
            : ''
      }`}
    >
      {value}
    </div>
  </div>
);

type CellProps = {
  preset?: ShiftPreset;
  isOff: boolean;
  explicitOff: boolean;
  weekend: boolean;
  violates: boolean;
  selected: boolean;
  draggable: boolean;
  onClick: () => void;
  onDragStart: () => void;
  onDrop: () => void;
};

const Cell = ({
  preset,
  isOff,
  explicitOff,
  weekend,
  violates,
  selected,
  draggable,
  onClick,
  onDragStart,
  onDrop,
}: CellProps) => {
  const empty = isOff && !preset;
  const baseBorder = 'border-b-hair border-app-line dark:border-app-line-dark';
  const ring = selected
    ? 'outline outline-2 outline-offset-[-2px] outline-info-ink dark:outline-info-ink-dark'
    : violates
      ? 'outline outline-[1.5px] outline-offset-[-2px] outline-danger-ink'
      : '';
  if (empty && (weekend || explicitOff)) {
    return (
      <button
        type="button"
        onClick={onClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`min-h-[56px] px-2 py-2 text-left ${baseBorder} ${weekend ? 'bg-app-subtle/30 dark:bg-app-subtle-dark/20' : ''} ${ring} hover:bg-app-subtle/50 dark:hover:bg-app-subtle-dark/40`}
      >
        <span className="block text-11 text-app-faint dark:text-app-faint-dark italic">Off</span>
      </button>
    );
  }
  if (empty) {
    return (
      <button
        type="button"
        onClick={onClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`min-h-[56px] px-2 py-2 ${baseBorder} ${ring} bg-app-subtle/30 dark:bg-app-subtle-dark/20 border-l border-l-dashed hover:bg-app-subtle/60 dark:hover:bg-app-subtle-dark/50`}
      >
        <span className="block text-app-faint dark:text-app-faint-dark text-13">+</span>
      </button>
    );
  }
  if (preset) {
    const colorAlpha = `${preset.color}22`;
    return (
      <button
        type="button"
        onClick={onClick}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`min-h-[56px] px-2 py-2 text-left ${baseBorder} ${ring} cursor-grab active:cursor-grabbing transition-colors`}
        style={{ borderLeft: `3px solid ${preset.color}`, backgroundColor: colorAlpha }}
      >
        <div className="text-11 font-medium leading-tight truncate">{preset.nameEn}</div>
        <div className="text-[10px] text-app-mute dark:text-app-mute-dark mt-0.5">
          {preset.startTime} · {Math.round(preset.workDurationMinutes / 60 * 10) / 10}h
        </div>
      </button>
    );
  }
  return null;
};

type PanelProps = {
  selected: SelectedCell;
  employee: Employee;
  currentPresetId: string | null;
  presets: ShiftPreset[];
  breakPolicies: BreakPolicy[];
  onPick: (presetId: string | null) => void;
  onClear: () => void;
  onMarkOff: () => void;
  onApplyToWeek: (presetId: string | null) => void;
  onClose: () => void;
};

const AssignmentPanel = ({
  selected,
  employee,
  currentPresetId,
  presets,
  breakPolicies,
  onPick,
  onClear,
  onMarkOff,
  onApplyToWeek,
  onClose,
}: PanelProps) => {
  if (!selected) return null;
  const date = parseIsoLocal(selected.date);
  const dayName = DAY_NAMES_FULL[date.getDay()];
  const isAssigned = currentPresetId !== null;

  return (
    <Card className="!p-4 mt-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-13 font-medium">
            {employee.name} · {dayName}, {date.toLocaleString('en-US', { month: 'short' })}{' '}
            {date.getDate()}
          </div>
          <div className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
            {currentPresetId
              ? `Currently assigned: ${presets.find((p) => p.id === currentPresetId)?.nameEn ?? '—'}`
              : 'No shift assigned'}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="size-7 inline-flex items-center justify-center rounded-md hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="label-caps mt-4 mb-2">Pick a shift preset</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {presets.map((p) => {
          const sched = deriveSchedule(p, breakPolicies);
          const hards = hardViolationsOn(p, date, breakPolicies, employee);
          const warning = hards[0] ? violationLabel(hards[0].ruleId) : undefined;
          return (
            <PresetPickerCard
              key={p.id}
              preset={p}
              endMin={sched.endMin}
              selected={p.id === currentPresetId}
              warning={warning}
              onClick={() => onPick(p.id)}
            />
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {isAssigned && (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear assignment
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={onMarkOff}>
          Mark as day off
        </Button>
        {currentPresetId && (
          <Button variant="secondary" size="sm" onClick={() => onApplyToWeek(currentPresetId)}>
            Apply to whole week
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="mt-3 hidden sm:block">
        <Pill tone="neutral">Tip · drag any assigned cell to move it; drop on another employee&apos;s cell to swap.</Pill>
      </div>
    </Card>
  );
};
