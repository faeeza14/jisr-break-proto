/**
 * Attendance Policies page — rebuilt with @jisr-hr/ds-web components.
 * Break tab is the hero: clickable rows → BreakPolicyDetail.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  PageHeader,
  SmartBreadcrumb,
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Table,
  Tag,
  Badge,
  Banner,
} from '@jisr-hr/ds-web';
import type { TableColumn } from '@jisr-hr/ds-web';
import { useAppStore } from '../store';
import type {
  BreakPolicy,
  ClockWindowPolicy,
  ExcusePolicy,
  OvertimePolicy,
  PunchCorrectionPolicy,
} from '../types';

type TabId = 'overtime' | 'break' | 'clock_window' | 'excuse' | 'punch_correction';

const TAB_LABELS: Array<{ id: TabId; label: string; isNew?: boolean }> = [
  { id: 'overtime', label: 'Overtime' },
  { id: 'break', label: 'Break', isNew: true },
  { id: 'clock_window', label: 'Clock-in window', isNew: true },
  { id: 'excuse', label: 'Excuse' },
  { id: 'punch_correction', label: 'Punch correction' },
];

export const PoliciesPage = () => {
  const {
    overtimePolicies,
    breakPolicies,
    clockWindowPolicies,
    excusePolicies,
    punchCorrectionPolicies,
  } = useAppStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('break');

  const counts: Record<TabId, number> = {
    overtime: overtimePolicies.length,
    break: breakPolicies.length,
    clock_window: clockWindowPolicies.length,
    excuse: excusePolicies.length,
    punch_correction: punchCorrectionPolicies.length,
  };

  const tabLabel = TAB_LABELS.find((l) => l.id === tab)!.label;

  // ── Break columns ──────────────────────────────────────────
  const breakCols: TableColumn<BreakPolicy>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '1.4fr',
      render: (r) => <span className="font-medium text-app-ink dark:text-app-ink-dark">{r.name}</span>,
    },
    {
      key: 'groups',
      header: 'Apply for',
      width: '1.2fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">
          {r.appliesTo.groupIds.length} group{r.appliesTo.groupIds.length === 1 ? '' : 's'}
        </span>
      ),
    },
    {
      key: 'employees',
      header: 'Total employees',
      width: '0.9fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">{r.appliesTo.employeeCount}</span>
      ),
    },
    {
      key: 'paid',
      header: 'Type',
      width: '0.9fr',
      render: (r) => (
        <Tag
          appearance={r.paid === 'paid' ? 'success' : r.paid === 'unpaid' ? 'warning' : 'info'}
          size="sm"
        >
          {r.paid[0].toUpperCase() + r.paid.slice(1)}
        </Tag>
      ),
    },
    {
      key: 'schedule',
      header: 'Schedule',
      width: '0.9fr',
      render: (r) => (
        <Tag
          appearance={
            r.defaultScheduleType === 'fixed'
              ? 'info'
              : r.defaultScheduleType === 'flexible'
                ? 'neutral'
                : 'neutral'
          }
          size="sm"
        >
          {String(r.defaultScheduleType)[0].toUpperCase() + String(r.defaultScheduleType).slice(1)}
        </Tag>
      ),
    },
    {
      key: 'compliance',
      header: 'Compliance',
      width: '0.9fr',
      render: (r) => (
        <Tag appearance={r.forceBreakAfter5h ? 'success' : 'warning'} size="sm">
          {r.forceBreakAfter5h ? 'Art. 101 ✓' : 'Review needed'}
        </Tag>
      ),
    },
  ];

  // ── Overtime columns ──────────────────────────────────────
  const overtimeCols: TableColumn<OvertimePolicy>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '1.4fr',
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: 'groups',
      header: 'Apply for',
      width: '1.2fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">
          {r.appliesTo.groupIds.length} group{r.appliesTo.groupIds.length === 1 ? '' : 's'}
        </span>
      ),
    },
    {
      key: 'employees',
      header: 'Employees',
      width: '0.9fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">{r.appliesTo.employeeCount}</span>
      ),
    },
    {
      key: 'approval',
      header: 'Approval',
      width: '1fr',
      render: (r) => (
        <Tag appearance={r.preApprovalRequired ? 'warning' : 'neutral'} size="sm">
          {r.preApprovalRequired ? 'Pre-approval' : 'Auto-approve'}
        </Tag>
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      width: '1.2fr',
      render: (r) => (
        <span className="flex gap-1.5 flex-wrap">
          <Tag appearance="neutral" size="sm">Paid OT {r.paidRate}×</Tag>
          <Tag appearance="neutral" size="sm">TOIL {r.timeOffInLieuRate}×</Tag>
        </span>
      ),
    },
  ];

  // ── Clock-window columns ──────────────────────────────────
  const cwCols: TableColumn<ClockWindowPolicy>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '1.2fr',
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: 'groups',
      header: 'Apply for',
      width: '1fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">
          {r.appliesTo.groupIds.length} groups
        </span>
      ),
    },
    {
      key: 'employees',
      header: 'Employees',
      width: '0.8fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">{r.appliesTo.employeeCount}</span>
      ),
    },
    {
      key: 'grace',
      header: 'Grace',
      width: '0.7fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">{r.clockInGraceMinutes}m</span>
      ),
    },
    {
      key: 'clockIn',
      header: 'Clock-in window',
      width: '1.1fr',
      render: (r) => (
        <Tag appearance="neutral" size="sm">{r.clockInWindowStart} – {r.clockInWindowEnd}</Tag>
      ),
    },
    {
      key: 'clockOut',
      header: 'Clock-out window',
      width: '1.1fr',
      render: (r) => (
        <Tag appearance="neutral" size="sm">{r.clockOutWindowStart} – {r.clockOutWindowEnd}</Tag>
      ),
    },
  ];

  // ── Excuse columns ────────────────────────────────────────
  const excuseCols: TableColumn<ExcusePolicy>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '1.4fr',
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: 'groups',
      header: 'Apply for',
      width: '1.2fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">
          {r.appliesTo.groupIds.length} groups
        </span>
      ),
    },
    {
      key: 'employees',
      header: 'Employees',
      width: '0.8fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">{r.appliesTo.employeeCount}</span>
      ),
    },
    {
      key: 'approval',
      header: 'Approval required',
      width: '1fr',
      render: (r) => (
        <Tag appearance={r.approvalRequired ? 'info' : 'neutral'} size="sm">
          {r.approvalRequired ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      key: 'max',
      header: 'Max per month',
      width: '1fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">{r.maxPerMonth}</span>
      ),
    },
  ];

  const punchCols: TableColumn<PunchCorrectionPolicy>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '1.4fr',
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: 'groups',
      header: 'Apply for',
      width: '1.2fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">
          {r.appliesTo.groupIds.length} groups
        </span>
      ),
    },
    {
      key: 'employees',
      header: 'Employees',
      width: '0.8fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">{r.appliesTo.employeeCount}</span>
      ),
    },
    {
      key: 'approval',
      header: 'Approval required',
      width: '1fr',
      render: (r) => (
        <Tag appearance={r.approvalRequired ? 'info' : 'neutral'} size="sm">
          {r.approvalRequired ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      key: 'max',
      header: 'Max per month',
      width: '1fr',
      render: (r) => (
        <span className="text-app-mute dark:text-app-mute-dark">{r.maxPerMonth}</span>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <PageHeader
        breadcrumb={
          <SmartBreadcrumb
            items={[
              { label: 'Settings', to: '/settings' },
              { label: 'Attendance' },
              { label: 'Attendance policies' },
            ]}
          />
        }
        title="Attendance policies"
        description="Reusable rules linked to shift presets and groups."
        border={false}
        actions={
          <Button
            variant="primary"
            leadingIcon={<Plus className="size-3.5" />}
            onClick={() => navigate(`/settings/attendance/policies/new?type=${tab}`)}
          >
            New {tabLabel.toLowerCase()} policy
          </Button>
        }
      />

      <div className="px-5 sm:px-6 space-y-4">
        {/* Heat-ban reminder — only shown on break tab */}
        {tab === 'break' && (
          <Banner appearance="info" emphasis="mid" title="KSA heat-ban active Aug 15">
            Outdoor break policies with auto-mandate enabled will override schedule during 12:00–15:00.
          </Banner>
        )}

        <Card>
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
            <TabsList className="-mx-1 px-1">
              {TAB_LABELS.map((l) => (
                <TabsTrigger
                  key={l.id}
                  value={l.id}
                  badge={
                    <span className="inline-flex items-center gap-1.5">
                      <Badge appearance="neutral" size="small" count={counts[l.id]} />
                      {l.isNew && <Badge appearance="info" dot size="medium" />}
                    </span>
                  }
                >
                  {l.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="break" className="mt-4">
              <Table
                columns={breakCols}
                data={breakPolicies}
                onRowClick={(r) => navigate(`/settings/attendance/policies/break/${r.id}`)}
                getRowKey={(r) => r.id}
                emptyState={
                  <p className="text-13 text-app-mute dark:text-app-mute-dark">
                    No break policies yet. Add one above.
                  </p>
                }
              />
            </TabsContent>

            <TabsContent value="overtime" className="mt-4">
              <Table
                columns={overtimeCols}
                data={overtimePolicies}
                getRowKey={(r) => r.id}
              />
            </TabsContent>

            <TabsContent value="clock_window" className="mt-4">
              <Table
                columns={cwCols}
                data={clockWindowPolicies}
                getRowKey={(r) => r.id}
              />
            </TabsContent>

            <TabsContent value="excuse" className="mt-4">
              <Table
                columns={excuseCols}
                data={excusePolicies}
                getRowKey={(r) => r.id}
              />
            </TabsContent>

            <TabsContent value="punch_correction" className="mt-4">
              <Table
                columns={punchCols}
                data={punchCorrectionPolicies}
                getRowKey={(r) => r.id}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Related settings */}
        <RelatedSettings tab={tab} />
      </div>
    </div>
  );
};

const RELATED: Record<TabId, Array<{ title: string; sub: string }>> = {
  break: [
    { title: 'Heat ban schedule', sub: 'Drives auto-mandate behaviour for outdoor crews.' },
    { title: 'Group assignments', sub: 'Assign break policies to employee groups.' },
  ],
  overtime: [
    { title: 'Holiday calendar', sub: 'Determines holiday OT multipliers.' },
    { title: 'Payroll periods', sub: 'OT amounts roll into the next payroll cut-off.' },
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
};

const RelatedSettings = ({ tab }: { tab: TabId }) => (
  <div>
    <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium px-1 mb-2">
      Related settings
    </p>
    <div className="grid sm:grid-cols-2 gap-3">
      {RELATED[tab].map((it) => (
        <Card key={it.title} interactive>
          <div className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{it.title}</div>
          <p className="text-11 text-app-mute dark:text-app-mute-dark mt-1">{it.sub}</p>
        </Card>
      ))}
    </div>
  </div>
);
