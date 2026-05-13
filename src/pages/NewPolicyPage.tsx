/**
 * New Policy page — rebuilt with @jisr-hr/ds-web components.
 * Break type is prominently featured (hero flow).
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import {
  PageHeader,
  SmartBreadcrumb,
  Card,
  CardSection,
  Button,
  Field,
  Input,
  Textarea,
  Switch,
  NumberInput,
  SegmentedControl,
  Tag,
  Banner,
  Separator,
  useToast,
} from '@jisr-hr/ds-web';
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

const POLICY_TYPES: Array<{
  id: PolicyKind;
  label: string;
  description: string;
  isNew?: boolean;
}> = [
  { id: 'overtime', label: 'Overtime', description: 'Rate multipliers and approval rules' },
  {
    id: 'break',
    label: 'Break',
    description: 'Paid/unpaid, schedule type, KSA compliance',
    isNew: true,
  },
  {
    id: 'clock_window',
    label: 'Clock-in window',
    description: 'Grace periods and geofence settings',
    isNew: true,
  },
  { id: 'excuse', label: 'Excuse', description: 'Approval and monthly limits' },
  { id: 'punch_correction', label: 'Punch correction', description: 'Approval and audit rules' },
];

const labelFor = (k: PolicyKind) => POLICY_TYPES.find((t) => t.id === k)!.label;

type Common = { name: string; description: string; groupIds: string[] };

export const NewPolicyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
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
    forceBreakAfter5h: boolean;
  }>({
    paid: 'unpaid',
    defaultScheduleType: 'flexible',
    countTowardWorkHours: false,
    autoMandatePaidDuringHeatBan: false,
    forceBreakAfter5h: true,
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
        (acc, gid) => acc + (groups.find((g) => g.id === gid)?.employeeCount ?? 0),
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
        createPunchCorrectionPolicy({ ...base, type: 'punch_correction', ...punch } as PunchCorrectionPolicy);
        break;
    }
    toast.success('Policy created', `"${common.name.trim()}" is now available.`);
    navigate('/settings/attendance/policies');
  };

  const canSave = kind !== null && common.name.trim().length > 0;

  return (
    <div className="pb-12">
      <PageHeader
        breadcrumb={
          <SmartBreadcrumb
            items={[
              { label: 'Settings', to: '/settings' },
              { label: 'Attendance' },
              { label: 'Attendance policies', to: '/settings/attendance/policies' },
              { label: 'New policy' },
            ]}
          />
        }
        title={kind ? `New ${labelFor(kind).toLowerCase()} policy` : 'New policy'}
        description="Pick a policy type, then configure its rules and group assignment."
        border={false}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/settings/attendance/policies')}>
              Discard
            </Button>
            <Button variant="primary" disabled={!canSave} onClick={onSave}>
              Create policy
            </Button>
          </>
        }
      />

      <div className="px-5 sm:px-6 max-w-3xl space-y-4">
        {/* ── Policy type picker ── */}
        <Card>
          <CardSection title="Policy type">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POLICY_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setKind(pt.id)}
                  className={[
                    'text-left p-3 rounded-lg hairline transition',
                    kind === pt.id
                      ? 'ring-2 ring-app-ink dark:ring-app-ink-dark border-transparent bg-app-subtle/40 dark:bg-app-subtle-dark/40'
                      : 'bg-white dark:bg-app-card-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                      {pt.label}
                    </span>
                    {pt.isNew && <Tag appearance="info" size="sm">New</Tag>}
                  </span>
                  <span className="text-11 text-app-mute dark:text-app-mute-dark">
                    {pt.description}
                  </span>
                </button>
              ))}
            </div>
          </CardSection>
        </Card>

        {/* ── Basics ── */}
        <Card>
          <CardSection title="Basics">
            <div className="space-y-3">
              <Field label="Name" required>
                <Input
                  value={common.name}
                  onChange={(e) => setCommon((c) => ({ ...c, name: e.target.value }))}
                  placeholder={kind ? `${labelFor(kind)} policy name` : 'Policy name'}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={3}
                  value={common.description}
                  onChange={(e) => setCommon((c) => ({ ...c, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </Field>
            </div>
          </CardSection>
        </Card>

        {/* ── Break-specific config ── */}
        {kind === 'break' && (
          <>
            <Card>
              <CardSection title="Break type & behaviour">
                <div className="space-y-4">
                  <Field label="Paid" description="Whether break time is included in payroll.">
                    <SegmentedControl
                      value={breakP.paid}
                      onChange={(v) => setBreakP((b) => ({ ...b, paid: v as BreakPolicy['paid'] }))}
                      options={[
                        { value: 'paid', label: 'Paid', description: 'Included in payroll' },
                        { value: 'unpaid', label: 'Unpaid', description: 'Deducted from wages' },
                        { value: 'mixed', label: 'Mixed', description: 'Per-instance setting' },
                      ]}
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
                      checked={breakP.countTowardWorkHours}
                      onCheckedChange={(v) => setBreakP((b) => ({ ...b, countTowardWorkHours: v }))}
                    />
                  </div>
                </div>
              </CardSection>
            </Card>

            <Card>
              <CardSection title="Schedule">
                <Field
                  label="Schedule type"
                  description="Default shape applied when this policy is added to a shift preset."
                >
                  <SegmentedControl
                    value={breakP.defaultScheduleType}
                    onChange={(v) =>
                      setBreakP((b) => ({ ...b, defaultScheduleType: v as BreakScheduleType }))
                    }
                    options={[
                      { value: 'fixed', label: 'Fixed', description: 'Exact start time' },
                      { value: 'flexible', label: 'Flexible', description: 'Within a window' },
                      { value: 'mixed', label: 'Mixed', description: 'Employee chooses' },
                    ]}
                  />
                </Field>
              </CardSection>
            </Card>

            <Card>
              <CardSection title="KSA compliance behaviour">
                <div className="space-y-3">
                  <Banner appearance="info" emphasis="low">
                    These settings control how this policy interacts with KSA Labour Law requirements.
                  </Banner>
                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                      <span className="flex items-center gap-1.5">
                        <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                          Force break after 5 hours of work
                        </p>
                        <Tag appearance="danger" size="sm">Required</Tag>
                      </span>
                      <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
                        KSA Labour Law Art. 101 — mandatory for compliance.
                      </p>
                    </div>
                    <Switch
                      checked={breakP.forceBreakAfter5h}
                      onCheckedChange={(v) => setBreakP((b) => ({ ...b, forceBreakAfter5h: v }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                        Auto-mandate paid break during heat ban
                      </p>
                      <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
                        Outdoor work overlapping 12:00–15:00 triggers paid mandatory break.
                      </p>
                    </div>
                    <Switch
                      checked={breakP.autoMandatePaidDuringHeatBan}
                      onCheckedChange={(v) =>
                        setBreakP((b) => ({ ...b, autoMandatePaidDuringHeatBan: v }))
                      }
                    />
                  </div>
                </div>
              </CardSection>
            </Card>
          </>
        )}

        {/* ── Overtime-specific config ── */}
        {kind === 'overtime' && (
          <Card>
            <CardSection title="Overtime rules">
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  <Field label="Paid rate (×)">
                    <NumberInput
                      value={overtime.paidRate}
                      onChange={(v) => setOvertime((o) => ({ ...o, paidRate: v }))}
                      min={1}
                      max={5}
                      step={0.25}
                    />
                  </Field>
                  <Field label="Holiday rate (×)">
                    <NumberInput
                      value={overtime.holidayRate}
                      onChange={(v) => setOvertime((o) => ({ ...o, holidayRate: v }))}
                      min={1}
                      max={5}
                      step={0.25}
                    />
                  </Field>
                  <Field label="TOIL rate (×)">
                    <NumberInput
                      value={overtime.timeOffInLieuRate}
                      onChange={(v) => setOvertime((o) => ({ ...o, timeOffInLieuRate: v }))}
                      min={0}
                      max={2}
                      step={0.25}
                    />
                  </Field>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                      Pre-approval required
                    </p>
                    <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
                      Overtime requests need manager sign-off before being counted.
                    </p>
                  </div>
                  <Switch
                    checked={overtime.preApprovalRequired}
                    onCheckedChange={(v) => setOvertime((o) => ({ ...o, preApprovalRequired: v }))}
                  />
                </div>
              </div>
            </CardSection>
          </Card>
        )}

        {/* ── Clock-window-specific config ── */}
        {kind === 'clock_window' && (
          <Card>
            <CardSection title="Clock-in/out windows">
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Clock-in window start">
                    <Input
                      type="time"
                      value={cw.clockInWindowStart}
                      onChange={(e) => setCw((c) => ({ ...c, clockInWindowStart: e.target.value }))}
                    />
                  </Field>
                  <Field label="Clock-in window end">
                    <Input
                      type="time"
                      value={cw.clockInWindowEnd}
                      onChange={(e) => setCw((c) => ({ ...c, clockInWindowEnd: e.target.value }))}
                    />
                  </Field>
                  <Field label="Clock-out window start">
                    <Input
                      type="time"
                      value={cw.clockOutWindowStart}
                      onChange={(e) => setCw((c) => ({ ...c, clockOutWindowStart: e.target.value }))}
                    />
                  </Field>
                  <Field label="Clock-out window end">
                    <Input
                      type="time"
                      value={cw.clockOutWindowEnd}
                      onChange={(e) => setCw((c) => ({ ...c, clockOutWindowEnd: e.target.value }))}
                    />
                  </Field>
                </div>
                <Field label="Grace period (minutes)">
                  <NumberInput
                    value={cw.clockInGraceMinutes}
                    onChange={(v) => setCw((c) => ({ ...c, clockInGraceMinutes: v }))}
                    min={0}
                    max={60}
                    step={5}
                    endAddon="min"
                  />
                </Field>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                      Geofence required
                    </p>
                    <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
                      Employee must be on-site (GPS) to clock in.
                    </p>
                  </div>
                  <Switch
                    checked={cw.geofenceRequired}
                    onCheckedChange={(v) => setCw((c) => ({ ...c, geofenceRequired: v }))}
                  />
                </div>
              </div>
            </CardSection>
          </Card>
        )}

        {/* ── Excuse / Punch correction config ── */}
        {(kind === 'excuse' || kind === 'punch_correction') && (
          <Card>
            <CardSection title={kind === 'excuse' ? 'Excuse rules' : 'Punch correction rules'}>
              <div className="space-y-4">
                <Field label="Max per month">
                  <NumberInput
                    value={kind === 'excuse' ? excuse.maxPerMonth : punch.maxPerMonth}
                    onChange={(v) =>
                      kind === 'excuse'
                        ? setExcuse((e) => ({ ...e, maxPerMonth: v }))
                        : setPunch((p) => ({ ...p, maxPerMonth: v }))
                    }
                    min={1}
                    max={30}
                    step={1}
                  />
                </Field>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                      Approval required
                    </p>
                    <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
                      Manager must approve before the request takes effect.
                    </p>
                  </div>
                  <Switch
                    checked={kind === 'excuse' ? excuse.approvalRequired : punch.approvalRequired}
                    onCheckedChange={(v) =>
                      kind === 'excuse'
                        ? setExcuse((e) => ({ ...e, approvalRequired: v }))
                        : setPunch((p) => ({ ...p, approvalRequired: v }))
                    }
                  />
                </div>
              </div>
            </CardSection>
          </Card>
        )}

        {/* ── Apply to (groups) — shown for all types ── */}
        {kind !== null && (
          <Card>
            <CardSection title="Apply to">
              <div className="space-y-3">
                <div>
                  <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark mb-1.5">
                    Assigned groups
                  </p>
                  <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                    {common.groupIds.length === 0 ? (
                      <span className="text-13 text-app-mute dark:text-app-mute-dark">
                        No groups assigned.
                      </span>
                    ) : (
                      common.groupIds.map((gid) => {
                        const g = groups.find((x) => x.id === gid);
                        if (!g) return null;
                        return (
                          <Tag
                            key={gid}
                            appearance="neutral"
                            size="sm"
                            onDismiss={() => toggleGroup(gid)}
                          >
                            {g.name}
                          </Tag>
                        );
                      })
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-11 text-app-mute dark:text-app-mute-dark mb-1.5">Add groups</p>
                  <div className="flex flex-wrap gap-1.5">
                    {groups
                      .filter((g) => !common.groupIds.includes(g.id))
                      .map((g) => (
                        <Button
                          key={g.id}
                          variant="tertiary"
                          size="sm"
                          onClick={() => toggleGroup(g.id)}
                        >
                          + {g.name} ({g.employeeCount})
                        </Button>
                      ))}
                  </div>
                </div>
                <p className="text-11 text-app-mute dark:text-app-mute-dark">
                  Total employees:{' '}
                  <span className="font-medium text-app-ink dark:text-app-ink-dark">
                    {totalEmployees}
                  </span>
                </p>
              </div>
            </CardSection>
          </Card>
        )}
      </div>
    </div>
  );
};
