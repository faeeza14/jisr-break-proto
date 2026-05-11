import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Breadcrumb } from '../components/PageHeader';
import { Card, CardSectionLabel } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { Field } from '../components/primitives/Field';
import { Chip } from '../components/primitives/Chip';
import { useAppStore } from '../store';
import type {
  BreakPolicy,
  BreakScheduleType,
  ClockWindowPolicy,
  ExcusePolicy,
  OvertimePolicy,
  PunchCorrectionPolicy,
} from '../types';

type PolicyKind = 'overtime' | 'break' | 'clock_window' | 'excuse' | 'punch_correction';

const labelFor = (k: PolicyKind) =>
  k === 'overtime'
    ? 'Overtime'
    : k === 'break'
      ? 'Break'
      : k === 'clock_window'
        ? 'Clock-in window'
        : k === 'excuse'
          ? 'Excuse'
          : 'Punch correction';

const tabUrlFor = (_k: PolicyKind) => '/settings/attendance/policies';

type Common = {
  name: string;
  description: string;
  groupIds: string[];
};

export const NewPolicyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialType = (params.get('type') as PolicyKind | null) ?? null;

  const {
    groups,
    createBreakPolicy,
    createClockWindowPolicy,
    createOvertimePolicy,
    createExcusePolicy,
    createPunchCorrectionPolicy,
  } = useAppStore();

  const [kind, setKind] = useState<PolicyKind | null>(initialType);
  const [common, setCommon] = useState<Common>({ name: '', description: '', groupIds: [] });
  const [overtime, setOvertime] = useState({
    paidRate: 1.5,
    holidayRate: 2.0,
    timeOffInLieuRate: 0.25,
    preApprovalRequired: false,
    autoOvertimeAfterMinutes: 60 as number | null,
  });
  const [breakP, setBreakP] = useState<{
    paid: BreakPolicy['paid'];
    defaultScheduleType: BreakPolicy['defaultScheduleType'];
    countTowardWorkHours: boolean;
    autoMandatePaidDuringHeatBan: boolean;
  }>({
    paid: 'unpaid',
    defaultScheduleType: 'flexible',
    countTowardWorkHours: false,
    autoMandatePaidDuringHeatBan: false,
  });
  const [cw, setCw] = useState({
    clockInWindowStart: '08:00',
    clockInWindowEnd: '10:00',
    clockOutWindowStart: '17:00',
    clockOutWindowEnd: '19:00',
    clockInGraceMinutes: 15,
    allowedShortageMinutes: 60,
    geofenceRequired: false,
    geofenceRadiusMeters: 100,
    ipRestricted: false,
  });
  const [excuse, setExcuse] = useState({ approvalRequired: true, maxPerMonth: 3 });
  const [punch, setPunch] = useState({ approvalRequired: true, maxPerMonth: 5 });

  useEffect(() => {
    if (initialType && kind === null) setKind(initialType);
  }, [initialType, kind]);

  const totalEmployees = useMemo(
    () =>
      common.groupIds.reduce(
        (acc, id) => acc + (groups.find((g) => g.id === id)?.employeeCount ?? 0),
        0,
      ),
    [common.groupIds, groups],
  );

  const toggleGroup = (gid: string) =>
    setCommon((c) => ({
      ...c,
      groupIds: c.groupIds.includes(gid)
        ? c.groupIds.filter((g) => g !== gid)
        : [...c.groupIds, gid],
    }));

  const onSave = () => {
    if (!kind || !common.name.trim()) return;
    const id = `${kind}-${nanoid(6)}`;
    const base = {
      id,
      name: common.name.trim(),
      description: common.description.trim() || undefined,
      appliesTo: { groupIds: common.groupIds, employeeCount: totalEmployees },
    };
    switch (kind) {
      case 'overtime':
        createOvertimePolicy({ ...base, type: 'overtime', ...overtime } as OvertimePolicy);
        break;
      case 'break':
        createBreakPolicy({ ...base, type: 'break', ...breakP } as BreakPolicy);
        break;
      case 'clock_window':
        createClockWindowPolicy({ ...base, type: 'clock_window', ...cw } as ClockWindowPolicy);
        break;
      case 'excuse':
        createExcusePolicy({ ...base, type: 'excuse', ...excuse } as ExcusePolicy);
        break;
      case 'punch_correction':
        createPunchCorrectionPolicy({
          ...base,
          type: 'punch_correction',
          ...punch,
        } as PunchCorrectionPolicy);
        break;
    }
    navigate(tabUrlFor(kind));
  };

  const canSave = kind !== null && common.name.trim().length > 0;

  return (
    <div className="pb-12">
      <div className="px-5 sm:px-6 pt-5 pb-3">
        <Breadcrumb
          items={[
            { label: 'Settings', to: '/settings' },
            { label: 'Attendance' },
            { label: 'Attendance policies', to: '/settings/attendance/policies' },
            { label: 'New policy' },
          ]}
        />
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-medium leading-tight">
              {kind ? `New ${labelFor(kind).toLowerCase()} policy` : 'New policy'}
            </h1>
            <p className="text-13 text-app-mute dark:text-app-mute-dark mt-0.5">
              Pick a policy type, then configure its rules and group assignment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/settings/attendance/policies"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg font-medium h-9 px-3.5 text-13 bg-white dark:bg-app-card-dark hairline hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
            >
              Discard
            </Link>
            <Button variant="primary" disabled={!canSave} onClick={onSave}>
              Create policy
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 max-w-3xl space-y-4">
        <Card>
          <CardSectionLabel>Policy type</CardSectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['overtime', 'break', 'clock_window', 'excuse', 'punch_correction'] as PolicyKind[]).map(
              (k) => {
                const isNew = k === 'break' || k === 'clock_window';
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`text-left p-3 rounded-md hairline transition ${
                      kind === k
                        ? 'ring-2 ring-app-ink dark:ring-app-ink-dark border-transparent bg-app-subtle/40 dark:bg-app-subtle-dark/40'
                        : 'bg-white dark:bg-app-card-dark hover:bg-app-subtle/40 dark:hover:bg-app-subtle-dark/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-13 font-medium">{labelFor(k)}</span>
                      {isNew && <Chip tone="info">New</Chip>}
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </Card>

        <Card>
          <CardSectionLabel>Basics</CardSectionLabel>
          <div className="space-y-3">
            <Field label="Name">
              <input
                className="field-input"
                value={common.name}
                onChange={(e) => setCommon((c) => ({ ...c, name: e.target.value }))}
                placeholder={kind ? `${labelFor(kind)} policy name` : 'Policy name'}
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                className="field-input"
                value={common.description}
                onChange={(e) => setCommon((c) => ({ ...c, description: e.target.value }))}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardSectionLabel>Apply to</CardSectionLabel>
          <div className="text-13 font-medium mb-1.5">Groups</div>
          <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
            {common.groupIds.length === 0 && (
              <span className="text-13 text-app-mute dark:text-app-mute-dark">
                No groups assigned.
              </span>
            )}
            {common.groupIds.map((gid) => {
              const g = groups.find((x) => x.id === gid);
              if (!g) return null;
              return (
                <Chip key={gid} tone="gray" className="pl-2 pr-1">
                  {g.name}
                  <button
                    type="button"
                    onClick={() => toggleGroup(gid)}
                    aria-label={`Remove ${g.name}`}
                    className="size-4 inline-flex items-center justify-center rounded hover:bg-app-line"
                  >
                    <X className="size-3" />
                  </button>
                </Chip>
              );
            })}
          </div>
          <div className="text-11 text-app-mute dark:text-app-mute-dark mb-1.5">Add groups</div>
          <div className="flex flex-wrap gap-1.5">
            {groups
              .filter((g) => !common.groupIds.includes(g.id))
              .map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGroup(g.id)}
                  className="inline-flex items-center gap-1 rounded-md hairline px-2 py-1 text-11 text-app-mute dark:text-app-mute-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
                >
                  + {g.name} ({g.employeeCount})
                </button>
              ))}
          </div>
          <p className="text-11 text-app-mute dark:text-app-mute-dark mt-3">
            Total employees:{' '}
            <span className="font-medium text-app-ink dark:text-app-ink-dark">{totalEmployees}</span>
          </p>
        </Card>

        {kind === 'overtime' && (
          <Card>
            <CardSectionLabel>Overtime rules</CardSectionLabel>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Standard rate (×)">
                <input
                  type="number"
                  step={0.1}
                  className="field-input"
                  value={overtime.paidRate}
                  onChange={(e) => setOvertime((o) => ({ ...o, paidRate: Number(e.target.value) }))}
                />
              </Field>
              <Field label="Holiday rate (×)">
                <input
                  type="number"
                  step={0.1}
                  className="field-input"
                  value={overtime.holidayRate}
                  onChange={(e) => setOvertime((o) => ({ ...o, holidayRate: Number(e.target.value) }))}
                />
              </Field>
              <Field label="Time off in lieu (×)">
                <input
                  type="number"
                  step={0.05}
                  className="field-input"
                  value={overtime.timeOffInLieuRate}
                  onChange={(e) =>
                    setOvertime((o) => ({ ...o, timeOffInLieuRate: Number(e.target.value) }))
                  }
                />
              </Field>
            </div>
            <Toggle
              className="mt-3"
              label="Pre-approval required"
              checked={overtime.preApprovalRequired}
              onChange={(v) => setOvertime((o) => ({ ...o, preApprovalRequired: v }))}
            />
            <Field label="Auto OT after (minutes)" className="mt-3">
              <input
                type="number"
                min={0}
                className="field-input"
                value={overtime.autoOvertimeAfterMinutes ?? 0}
                onChange={(e) =>
                  setOvertime((o) => ({
                    ...o,
                    autoOvertimeAfterMinutes: Number(e.target.value) || null,
                  }))
                }
              />
            </Field>
          </Card>
        )}

        {kind === 'break' && (
          <Card>
            <CardSectionLabel>Break rules</CardSectionLabel>
            <div className="text-13 font-medium mb-1.5">Paid</div>
            <div className="flex gap-2 flex-wrap mb-4">
              {(['paid', 'unpaid', 'mixed'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBreakP((b) => ({ ...b, paid: p }))}
                  className={`px-3 py-1.5 rounded-md text-13 hairline capitalize ${
                    breakP.paid === p
                      ? 'bg-app-ink text-white border-app-ink dark:bg-app-ink-dark dark:text-app-ink'
                      : 'bg-white dark:bg-app-card-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="text-13 font-medium mb-1.5">Schedule type</div>
            <div className="flex gap-2 flex-wrap mb-4">
              {(['fixed', 'flexible', 'anchored', 'mixed'] as Array<BreakScheduleType | 'mixed'>).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBreakP((b) => ({ ...b, defaultScheduleType: s }))}
                    className={`px-3 py-1.5 rounded-md text-13 hairline capitalize ${
                      breakP.defaultScheduleType === s
                        ? 'bg-app-ink text-white border-app-ink dark:bg-app-ink-dark dark:text-app-ink'
                        : 'bg-white dark:bg-app-card-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark'
                    }`}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
            <Toggle
              label="Counts toward work hours"
              checked={breakP.countTowardWorkHours}
              onChange={(v) => setBreakP((b) => ({ ...b, countTowardWorkHours: v }))}
            />
            <Toggle
              className="mt-2"
              label="Auto-mandate paid during heat ban"
              hint="When outdoor work overlaps the 12:00–15:00 heat ban window, this break becomes paid and mandatory."
              checked={breakP.autoMandatePaidDuringHeatBan}
              onChange={(v) => setBreakP((b) => ({ ...b, autoMandatePaidDuringHeatBan: v }))}
            />
          </Card>
        )}

        {kind === 'clock_window' && (
          <Card>
            <CardSectionLabel>Clock-in window</CardSectionLabel>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Clock-in window starts">
                <input
                  type="time"
                  className="field-input"
                  value={cw.clockInWindowStart}
                  onChange={(e) => setCw((c) => ({ ...c, clockInWindowStart: e.target.value }))}
                />
              </Field>
              <Field label="Clock-in window ends">
                <input
                  type="time"
                  className="field-input"
                  value={cw.clockInWindowEnd}
                  onChange={(e) => setCw((c) => ({ ...c, clockInWindowEnd: e.target.value }))}
                />
              </Field>
              <Field label="Clock-out window starts">
                <input
                  type="time"
                  className="field-input"
                  value={cw.clockOutWindowStart}
                  onChange={(e) => setCw((c) => ({ ...c, clockOutWindowStart: e.target.value }))}
                />
              </Field>
              <Field label="Clock-out window ends">
                <input
                  type="time"
                  className="field-input"
                  value={cw.clockOutWindowEnd}
                  onChange={(e) => setCw((c) => ({ ...c, clockOutWindowEnd: e.target.value }))}
                />
              </Field>
              <Field label="Grace minutes">
                <input
                  type="number"
                  min={0}
                  className="field-input"
                  value={cw.clockInGraceMinutes}
                  onChange={(e) =>
                    setCw((c) => ({ ...c, clockInGraceMinutes: Number(e.target.value) }))
                  }
                />
              </Field>
              <Field label="Allowed shortage (minutes)">
                <input
                  type="number"
                  min={0}
                  className="field-input"
                  value={cw.allowedShortageMinutes}
                  onChange={(e) =>
                    setCw((c) => ({ ...c, allowedShortageMinutes: Number(e.target.value) }))
                  }
                />
              </Field>
            </div>
            <Toggle
              className="mt-3"
              label="Geofence required"
              checked={cw.geofenceRequired}
              onChange={(v) => setCw((c) => ({ ...c, geofenceRequired: v }))}
            />
            {cw.geofenceRequired && (
              <Field label="Geofence radius (m)" className="mt-2">
                <input
                  type="number"
                  min={20}
                  className="field-input"
                  value={cw.geofenceRadiusMeters}
                  onChange={(e) =>
                    setCw((c) => ({ ...c, geofenceRadiusMeters: Number(e.target.value) }))
                  }
                />
              </Field>
            )}
            <Toggle
              className="mt-2"
              label="Restrict to office IP ranges"
              checked={cw.ipRestricted}
              onChange={(v) => setCw((c) => ({ ...c, ipRestricted: v }))}
            />
          </Card>
        )}

        {kind === 'excuse' && (
          <Card>
            <CardSectionLabel>Excuse rules</CardSectionLabel>
            <Toggle
              label="Approval required"
              checked={excuse.approvalRequired}
              onChange={(v) => setExcuse((e) => ({ ...e, approvalRequired: v }))}
            />
            <Field label="Max per month" className="mt-3">
              <input
                type="number"
                min={0}
                className="field-input"
                value={excuse.maxPerMonth}
                onChange={(e) => setExcuse((s) => ({ ...s, maxPerMonth: Number(e.target.value) }))}
              />
            </Field>
          </Card>
        )}

        {kind === 'punch_correction' && (
          <Card>
            <CardSectionLabel>Punch correction rules</CardSectionLabel>
            <Toggle
              label="Approval required"
              checked={punch.approvalRequired}
              onChange={(v) => setPunch((p) => ({ ...p, approvalRequired: v }))}
            />
            <Field label="Max per month" className="mt-3">
              <input
                type="number"
                min={0}
                className="field-input"
                value={punch.maxPerMonth}
                onChange={(e) => setPunch((s) => ({ ...s, maxPerMonth: Number(e.target.value) }))}
              />
            </Field>
          </Card>
        )}
      </div>
    </div>
  );
};

const Toggle = ({
  label,
  hint,
  checked,
  onChange,
  className = '',
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) => (
  <label className={`flex items-start justify-between gap-3 ${className}`}>
    <span className="min-w-0">
      <span className="block text-13 font-medium">{label}</span>
      {hint && (
        <span className="block text-11 text-app-mute dark:text-app-mute-dark mt-0.5">{hint}</span>
      )}
    </span>
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition ${
        checked
          ? 'bg-app-ink dark:bg-app-ink-dark'
          : 'bg-app-subtle dark:bg-app-subtle-dark hairline'
      }`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow-sm transition ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </span>
  </label>
);
