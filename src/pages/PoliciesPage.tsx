import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Breadcrumb } from '../components/PageHeader';
import { Card } from '../components/primitives/Card';
import { Chip } from '../components/primitives/Chip';
import { useAppStore } from '../store';
import type {
  BreakPolicy,
  ClockWindowPolicy,
  ExcusePolicy,
  OvertimePolicy,
  PunchCorrectionPolicy,
} from '../types';

type TabId = 'overtime' | 'break' | 'clock_window' | 'excuse' | 'punch_correction';

export const PoliciesPage = () => {
  const {
    overtimePolicies,
    breakPolicies,
    clockWindowPolicies,
    excusePolicies,
    punchCorrectionPolicies,
  } = useAppStore();

  const [tab, setTab] = useState<TabId>('overtime');

  const counts: Record<TabId, number> = {
    overtime: overtimePolicies.length,
    break: breakPolicies.length,
    clock_window: clockWindowPolicies.length,
    excuse: excusePolicies.length,
    punch_correction: punchCorrectionPolicies.length,
  };

  const labels: Array<{ id: TabId; label: string; isNew?: boolean }> = [
    { id: 'overtime', label: 'Overtime' },
    { id: 'break', label: 'Break', isNew: true },
    { id: 'clock_window', label: 'Clock-in window', isNew: true },
    { id: 'excuse', label: 'Excuse' },
    { id: 'punch_correction', label: 'Punch correction' },
  ];

  const tabName = labels.find((l) => l.id === tab)!.label;

  return (
    <div className="pb-12">
      <div className="px-5 sm:px-6 pt-5 pb-3">
        <Breadcrumb
          items={[
            { label: 'Settings', to: '/settings' },
            { label: 'Attendance' },
            { label: 'Attendance policies' },
          ]}
        />
        <h1 className="mt-2 text-[18px] font-medium">Attendance policies</h1>
        <p className="text-13 text-app-mute dark:text-app-mute-dark">
          Reusable rules linked to shift presets and groups.
        </p>
      </div>

      <div className="px-5 sm:px-6 space-y-4">
        <Card>
          <div className="flex flex-wrap items-center gap-x-5 border-b-hair border-app-line dark:border-app-line-dark -mx-1 px-1">
            {labels.map((l) => {
              const active = tab === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setTab(l.id)}
                  className={`relative inline-flex items-center gap-2 pb-2.5 -mb-px border-b-2 text-13 ${
                    active
                      ? 'border-app-ink dark:border-app-ink-dark text-app-ink dark:text-app-ink-dark font-medium'
                      : 'border-transparent text-app-mute dark:text-app-mute-dark hover:text-app-ink'
                  }`}
                >
                  {l.label}
                  <Chip tone="gray">{counts[l.id]}</Chip>
                  {l.isNew && <Chip tone="info">New</Chip>}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-3">
            <Link
              to={`/settings/attendance/policies/new?type=${tab}`}
              className="inline-flex items-center gap-1.5 rounded-lg font-medium h-9 px-3.5 text-13 bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-ink hover:opacity-90 focus-ring"
            >
              <Plus className="size-3.5" /> New {tabName.toLowerCase()} policy
            </Link>
          </div>

          <div className="mt-3">
            {tab === 'overtime' && <OvertimeTable rows={overtimePolicies} />}
            {tab === 'break' && <BreakTable rows={breakPolicies} />}
            {tab === 'clock_window' && <ClockWindowTable rows={clockWindowPolicies} />}
            {tab === 'excuse' && <ExcuseTable rows={excusePolicies} />}
            {tab === 'punch_correction' && <PunchCorrectionTable rows={punchCorrectionPolicies} />}
          </div>
        </Card>

        <RelatedSettings tab={tab} />
      </div>
    </div>
  );
};

const HeaderRow = ({ cols, gridCols }: { cols: string[]; gridCols: string }) => (
  <div
    className={`grid ${gridCols} gap-3 px-3 py-2 label-caps border-b-hair border-app-line dark:border-app-line-dark`}
  >
    {cols.map((c) => (
      <span key={c}>{c}</span>
    ))}
  </div>
);

const OvertimeTable = ({ rows }: { rows: OvertimePolicy[] }) => {
  const grid = 'grid-cols-[1.4fr_1.2fr_0.8fr_1fr_1.2fr]';
  return (
    <div className="rounded-md hairline overflow-hidden">
      <HeaderRow gridCols={grid} cols={['Name', 'Apply for', 'Total employees', 'Limited to', 'Rate']} />
      {rows.map((r) => (
        <div
          key={r.id}
          className={`grid ${grid} gap-3 px-3 py-3 items-center text-13 border-b-hair border-app-line dark:border-app-line-dark last:border-b-0`}
        >
          <span className="font-medium">{r.name}</span>
          <span className="text-app-mute dark:text-app-mute-dark">
            {r.appliesTo.groupIds.length} group{r.appliesTo.groupIds.length === 1 ? '' : 's'}
          </span>
          <span className="text-app-mute dark:text-app-mute-dark">{r.appliesTo.employeeCount}</span>
          <span className="text-app-mute dark:text-app-mute-dark">
            {r.preApprovalRequired ? 'Pre-approval' : 'Auto-approve'}
          </span>
          <span className="flex flex-wrap gap-1.5">
            <Chip tone="gray">Paid OT {r.paidRate}×</Chip>
            <Chip tone="gray">TOIL {r.timeOffInLieuRate}×</Chip>
          </span>
        </div>
      ))}
    </div>
  );
};

const BreakTable = ({ rows }: { rows: BreakPolicy[] }) => {
  const grid = 'grid-cols-[1.4fr_1.2fr_0.8fr_1fr_1fr]';
  return (
    <div className="rounded-md hairline overflow-hidden">
      <HeaderRow gridCols={grid} cols={['Name', 'Apply for', 'Total employees', 'Type', 'Schedule']} />
      {rows.map((r) => (
        <Link
          key={r.id}
          to={`/settings/attendance/policies/break/${r.id}`}
          className={`grid ${grid} gap-3 px-3 py-3 items-center text-13 border-b-hair border-app-line dark:border-app-line-dark last:border-b-0 hover:bg-app-subtle/50 dark:hover:bg-app-subtle-dark/50 transition-colors`}
        >
          <span className="font-medium">{r.name}</span>
          <span className="text-app-mute dark:text-app-mute-dark">
            {r.appliesTo.groupIds.length} group{r.appliesTo.groupIds.length === 1 ? '' : 's'}
          </span>
          <span className="text-app-mute dark:text-app-mute-dark">{r.appliesTo.employeeCount}</span>
          <span>
            <Chip tone={r.paid === 'paid' ? 'ok' : r.paid === 'unpaid' ? 'warn' : 'info'}>
              {r.paid[0].toUpperCase() + r.paid.slice(1)}
            </Chip>
          </span>
          <span>
            <Chip
              tone={
                r.defaultScheduleType === 'fixed'
                  ? 'info'
                  : r.defaultScheduleType === 'flexible'
                    ? 'warn'
                    : 'gray'
              }
            >
              {String(r.defaultScheduleType)[0].toUpperCase() + String(r.defaultScheduleType).slice(1)}
            </Chip>
          </span>
        </Link>
      ))}
    </div>
  );
};

const ClockWindowTable = ({ rows }: { rows: ClockWindowPolicy[] }) => {
  const grid = 'grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_1fr]';
  return (
    <div className="rounded-md hairline overflow-hidden">
      <HeaderRow
        gridCols={grid}
        cols={['Name', 'Apply for', 'Total employees', 'Grace', 'Clock-in window', 'Clock-out window']}
      />
      {rows.map((r) => (
        <div
          key={r.id}
          className={`grid ${grid} gap-3 px-3 py-3 items-center text-13 border-b-hair border-app-line dark:border-app-line-dark last:border-b-0`}
        >
          <span className="font-medium">{r.name}</span>
          <span className="text-app-mute dark:text-app-mute-dark">
            {r.appliesTo.groupIds.length} group{r.appliesTo.groupIds.length === 1 ? '' : 's'}
          </span>
          <span className="text-app-mute dark:text-app-mute-dark">{r.appliesTo.employeeCount}</span>
          <span className="text-app-mute dark:text-app-mute-dark">{r.clockInGraceMinutes}m</span>
          <Chip tone="gray">
            {r.clockInWindowStart} – {r.clockInWindowEnd}
          </Chip>
          <Chip tone="gray">
            {r.clockOutWindowStart} – {r.clockOutWindowEnd}
          </Chip>
        </div>
      ))}
    </div>
  );
};

const ExcuseTable = ({ rows }: { rows: ExcusePolicy[] }) => {
  const grid = 'grid-cols-[1.4fr_1.2fr_0.8fr_1fr_1fr]';
  return (
    <div className="rounded-md hairline overflow-hidden">
      <HeaderRow
        gridCols={grid}
        cols={['Name', 'Apply for', 'Total employees', 'Approval required', 'Max per month']}
      />
      {rows.map((r) => (
        <div
          key={r.id}
          className={`grid ${grid} gap-3 px-3 py-3 items-center text-13 border-b-hair border-app-line dark:border-app-line-dark last:border-b-0`}
        >
          <span className="font-medium">{r.name}</span>
          <span className="text-app-mute dark:text-app-mute-dark">
            {r.appliesTo.groupIds.length} groups
          </span>
          <span className="text-app-mute dark:text-app-mute-dark">{r.appliesTo.employeeCount}</span>
          <span className="text-app-mute dark:text-app-mute-dark">
            {r.approvalRequired ? 'Yes' : 'No'}
          </span>
          <span className="text-app-mute dark:text-app-mute-dark">{r.maxPerMonth}</span>
        </div>
      ))}
    </div>
  );
};

const PunchCorrectionTable = ({ rows }: { rows: PunchCorrectionPolicy[] }) => (
  <ExcuseTable rows={rows as unknown as ExcusePolicy[]} />
);

const RelatedSettings = ({ tab }: { tab: TabId }) => {
  const items = (
    {
      overtime: [
        { title: 'Holiday calendar', sub: 'Determines holiday OT multipliers.' },
        { title: 'Payroll periods', sub: 'OT amounts roll into the next payroll cut-off.' },
      ],
      break: [
        { title: 'Heat ban schedule', sub: 'Drives auto-mandate behaviour for outdoor crews.' },
        { title: 'Group assignments', sub: 'Assign break policies to employee groups.' },
      ],
      clock_window: [
        { title: 'Geofence locations', sub: 'Manage on-site GPS coordinates.' },
        { title: 'Allowed IP ranges', sub: 'Restrict desk-based clock-in to office networks.' },
      ],
      excuse: [
        { title: 'Approval workflow', sub: 'Choose who reviews excuse requests.' },
        { title: 'Carry-over policy', sub: 'Define rollover for unused excuses.' },
      ],
      punch_correction: [
        { title: 'Audit log retention', sub: 'How long edited punches remain reviewable.' },
        { title: 'Notification policy', sub: 'Notify managers on every correction request.' },
      ],
    } as const
  )[tab];

  return (
    <div>
      <div className="label-caps mb-2 px-1">Related settings</div>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((it) => (
          <Card key={it.title}>
            <div className="text-13 font-medium">{it.title}</div>
            <p className="text-11 text-app-mute dark:text-app-mute-dark mt-1">{it.sub}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
