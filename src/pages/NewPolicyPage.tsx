/**
 * R1 New Policy page — Break and Clock-in window are NOT policies in R1
 * (configured per shift). Only Overtime / Excuse / Punch correction remain.
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
  Tag,
  useToast,
} from '@jisr-hr/ds-web';
import { useAppStore } from '../store';
import type { ExcusePolicy, OvertimePolicy, PunchCorrectionPolicy } from '../types';

type PolicyKind = 'overtime' | 'excuse' | 'punch_correction';

const POLICY_TYPES: Array<{
  id: PolicyKind;
  label: string;
  description: string;
}> = [
  { id: 'overtime', label: 'Overtime', description: 'Rate multipliers and approval rules' },
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
