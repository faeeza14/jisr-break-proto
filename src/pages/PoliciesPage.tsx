/**
 * R1 Attendance Policies page.
 * Break and Clock-in window are NOT policies in R1 — both are configured
 * inline on each shift preset. Only Overtime / Excuse / Punch correction
 * remain as reusable policy entities here.
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
} from '@jisr-hr/ds-web';
import type { TableColumn } from '@jisr-hr/ds-web';
import { useAppStore } from '../store';
import type { ExcusePolicy, OvertimePolicy, PunchCorrectionPolicy } from '../types';

type TabId = 'overtime' | 'excuse' | 'punch_correction';

const TAB_LABELS: Array<{ id: TabId; label: string }> = [
  { id: 'overtime', label: 'Overtime' },
  { id: 'excuse', label: 'Excuse' },
  { id: 'punch_correction', label: 'Punch correction' },
];

export const PoliciesPage = () => {
  const { overtimePolicies, excusePolicies, punchCorrectionPolicies } = useAppStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('overtime');

  const counts: Record<TabId, number> = {
    overtime: overtimePolicies.length,
    excuse: excusePolicies.length,
    punch_correction: punchCorrectionPolicies.length,
  };

  const tabLabel = TAB_LABELS.find((l) => l.id === tab)!.label;

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
        description="Reusable rules linked to employee groups. Break and clocking rules are configured per shift in R1."
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
        <Card>
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
            <TabsList className="-mx-1 px-1">
              {TAB_LABELS.map((l) => (
                <TabsTrigger
                  key={l.id}
                  value={l.id}
                  badge={<Badge appearance="neutral" size="small" count={counts[l.id]} />}
                >
                  {l.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overtime" className="mt-4">
              <Table columns={overtimeCols} data={overtimePolicies} getRowKey={(r) => r.id} />
            </TabsContent>

            <TabsContent value="excuse" className="mt-4">
              <Table columns={excuseCols} data={excusePolicies} getRowKey={(r) => r.id} />
            </TabsContent>

            <TabsContent value="punch_correction" className="mt-4">
              <Table columns={punchCols} data={punchCorrectionPolicies} getRowKey={(r) => r.id} />
            </TabsContent>
          </Tabs>
        </Card>

        <RelatedSettings tab={tab} />
      </div>
    </div>
  );
};

const RELATED: Record<TabId, Array<{ title: string; sub: string }>> = {
  overtime: [
    { title: 'Holiday calendar', sub: 'Determines holiday OT multipliers.' },
    { title: 'Payroll periods', sub: 'OT amounts roll into the next payroll cut-off.' },
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
