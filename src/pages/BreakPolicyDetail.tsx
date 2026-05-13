/**
 * Break Policy detail / editor — rebuilt with @jisr-hr/ds-web components.
 * Sections: Basics · Type & behaviour · Schedule · Apply to · Compliance behaviour
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  SegmentedControl,
  Tag,
  Banner,
  useToast,
} from '@jisr-hr/ds-web';
import { useAppStore } from '../store';
import type { BreakPolicy, BreakScheduleType } from '../types';

const blank = (): BreakPolicy => ({
  id: `bp-${nanoid(6)}`,
  type: 'break',
  name: 'New break policy',
  description: '',
  paid: 'unpaid',
  countTowardWorkHours: false,
  defaultScheduleType: 'flexible',
  autoMandatePaidDuringHeatBan: false,
  forceBreakAfter5h: true,
  appliesTo: { groupIds: [], employeeCount: 0 },
});

export const BreakPolicyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { breakPolicies, groups, updateBreakPolicy } = useAppStore();
  const isNew = !id;

  const existing = useMemo(() => breakPolicies.find((p) => p.id === id), [breakPolicies, id]);
  const [draft, setDraft] = useState<BreakPolicy>(existing ?? blank());

  useEffect(() => { setDraft(existing ?? blank()); }, [existing]);

  if (!isNew && !existing) {
    return (
      <div className="p-6 text-13">
        Break policy not found.{' '}
        <Link to="/settings/attendance/policies" className="underline">Back to policies</Link>
      </div>
    );
  }

  const update = (patch: Partial<BreakPolicy>) => setDraft((d) => ({ ...d, ...patch }));

  const totalEmployees = (groupIds: string[]) =>
    groupIds.reduce((acc, gid) => acc + (groups.find((g) => g.id === gid)?.employeeCount ?? 0), 0);

  const onSave = () => {
    const next: BreakPolicy = {
      ...draft,
      appliesTo: { ...draft.appliesTo, employeeCount: totalEmployees(draft.appliesTo.groupIds) },
    };
    if (!isNew) updateBreakPolicy(next.id, next);
    toast.success('Break policy saved', `"${next.name}" has been updated.`);
    setTimeout(() => navigate('/settings/attendance/policies'), 400);
  };

  const toggleGroup = (gid: string) => {
    const has = draft.appliesTo.groupIds.includes(gid);
    const groupIds = has
      ? draft.appliesTo.groupIds.filter((x) => x !== gid)
      : [...draft.appliesTo.groupIds, gid];
    update({ appliesTo: { groupIds, employeeCount: totalEmployees(groupIds) } });
  };

  const complianceOk = draft.forceBreakAfter5h;

  return (
    <div className="pb-12">
      <PageHeader
        breadcrumb={
          <SmartBreadcrumb
            items={[
              { label: 'Settings', to: '/settings' },
              { label: 'Attendance' },
              { label: 'Attendance policies', to: '/settings/attendance/policies' },
              { label: 'Break' },
              { label: isNew ? 'New break policy' : draft.name },
            ]}
          />
        }
        title={isNew ? 'New break policy' : draft.name}
        description="Break behaviour, schedule, and group assignment."
        border={false}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/settings/attendance/policies')}>
              Discard
            </Button>
            <Button variant="primary" onClick={onSave}>
              {isNew ? 'Create policy' : 'Save changes'}
            </Button>
          </>
        }
      />

      <div className="px-5 sm:px-6 max-w-3xl space-y-4">
        {/* Compliance warning */}
        {!complianceOk && (
          <Banner appearance="warning" emphasis="mid" title="KSA Art. 101 compliance">
            Enabling "Force break after 5 hours" is required to comply with KSA Labour Law Article 101.
          </Banner>
        )}

        {/* ── Basics ── */}
        <Card>
          <CardSection title="Basics">
            <div className="space-y-3">
              <Field label="Name" required>
                <Input
                  value={draft.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="e.g. Standard break policy"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={3}
                  value={draft.description ?? ''}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Optional — describe when this policy applies."
                />
              </Field>
            </div>
          </CardSection>
        </Card>

        {/* ── Type & behaviour ── */}
        <Card>
          <CardSection title="Type & behaviour">
            <div className="space-y-4">
              <Field
                label="Paid"
                description="Whether time spent on break counts as paid work time."
              >
                <SegmentedControl
                  value={draft.paid}
                  onChange={(v) => update({ paid: v as BreakPolicy['paid'] })}
                  options={[
                    { value: 'paid', label: 'Paid', description: 'Included in payroll' },
                    { value: 'unpaid', label: 'Unpaid', description: 'Deducted from wages' },
                    { value: 'mixed', label: 'Mixed', description: 'Per-instance setting' },
                  ]}
                />
              </Field>

              <div className="flex items-start justify-between gap-4 py-1">
                <div>
                  <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
                    Counts toward work hours
                  </p>
                  <p className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
                    When enabled, break duration is included in the daily work cap.
                  </p>
                </div>
                <Switch
                  checked={draft.countTowardWorkHours}
                  onCheckedChange={(v) => update({ countTowardWorkHours: v })}
                />
              </div>
            </div>
          </CardSection>
        </Card>

        {/* ── Schedule ── */}
        <Card>
          <CardSection title="Schedule">
            <Field
              label="Schedule type"
              description="Default schedule shape applied when this policy is added to a shift preset."
            >
              <SegmentedControl
                value={draft.defaultScheduleType}
                onChange={(v) => update({ defaultScheduleType: v as BreakScheduleType })}
                options={[
                  { value: 'fixed', label: 'Fixed', description: 'Exact start time' },
                  { value: 'flexible', label: 'Flexible', description: 'Within a window' },
                  { value: 'mixed', label: 'Mixed', description: 'Employee chooses' },
                ]}
              />
            </Field>
          </CardSection>
        </Card>

        {/* ── Apply to ── */}
        <Card>
          <CardSection title="Apply to">
            <div className="space-y-3">
              <div>
                <p className="text-13 font-medium text-app-ink dark:text-app-ink-dark mb-1.5">
                  Assigned groups
                </p>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {draft.appliesTo.groupIds.length === 0 ? (
                    <span className="text-13 text-app-mute dark:text-app-mute-dark">
                      No groups assigned yet.
                    </span>
                  ) : (
                    draft.appliesTo.groupIds.map((gid) => {
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
                    .filter((g) => !draft.appliesTo.groupIds.includes(g.id))
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
                  {totalEmployees(draft.appliesTo.groupIds)}
                </span>
              </p>
            </div>
          </CardSection>
        </Card>

        {/* ── Compliance behaviour ── */}
        <Card>
          <CardSection title="Compliance behaviour">
            <div className="space-y-3">
              <ComplianceToggle
                label="Auto-mandate paid break during heat ban"
                description="When outdoor work overlaps the 12:00–15:00 heat ban window, this break becomes paid and mandatory."
                checked={draft.autoMandatePaidDuringHeatBan}
                onChange={(v) => update({ autoMandatePaidDuringHeatBan: v })}
              />
              <ComplianceToggle
                label="Force break after 5 hours of work"
                description="Required for KSA Labour Law Art. 101 compliance."
                checked={!!draft.forceBreakAfter5h}
                onChange={(v) => update({ forceBreakAfter5h: v })}
                critical
              />
            </div>
          </CardSection>
        </Card>
      </div>
    </div>
  );
};

/* ── Compliance toggle row ── */
const ComplianceToggle = ({
  label,
  description,
  checked,
  onChange,
  critical = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  critical?: boolean;
}) => (
  <label className="flex items-start justify-between gap-4 py-1 cursor-pointer">
    <span className="min-w-0">
      <span className="flex items-center gap-1.5">
        <span className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{label}</span>
        {critical && (
          <Tag appearance="danger" size="sm">Required</Tag>
        )}
      </span>
      {description && (
        <span className="block text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
          {description}
        </span>
      )}
    </span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </label>
);
