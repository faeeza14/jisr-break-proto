import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Breadcrumb } from '../components/PageHeader';
import { Card, CardSectionLabel } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { Field } from '../components/primitives/Field';
import { Chip } from '../components/primitives/Chip';
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
  const { breakPolicies, groups, updateBreakPolicy } = useAppStore();
  const isNew = !id;

  const existing = useMemo(() => breakPolicies.find((p) => p.id === id), [breakPolicies, id]);
  const [draft, setDraft] = useState<BreakPolicy>(existing ?? blank());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(existing ?? blank());
  }, [existing]);

  if (!isNew && !existing) {
    return (
      <div className="p-6 text-13">
        Break policy not found.{' '}
        <Link to="/settings/attendance/policies" className="underline">
          Back to policies
        </Link>
      </div>
    );
  }

  const update = (patch: Partial<BreakPolicy>) => setDraft((d) => ({ ...d, ...patch }));

  const totalEmployees = (groupIds: string[]) =>
    groupIds.reduce((acc, id) => acc + (groups.find((g) => g.id === id)?.employeeCount ?? 0), 0);

  const onSave = () => {
    const next: BreakPolicy = {
      ...draft,
      appliesTo: { ...draft.appliesTo, employeeCount: totalEmployees(draft.appliesTo.groupIds) },
    };
    if (isNew) {
      // For prototype: not adding to store on create; navigate back.
      // eslint-disable-next-line no-console
      console.log('[CREATE break policy]', next);
    } else {
      updateBreakPolicy(next.id, next);
    }
    setSaved(true);
    setTimeout(() => navigate('/settings/attendance/policies'), 350);
  };

  const toggleGroup = (gid: string) => {
    const has = draft.appliesTo.groupIds.includes(gid);
    const groupIds = has
      ? draft.appliesTo.groupIds.filter((x) => x !== gid)
      : [...draft.appliesTo.groupIds, gid];
    update({
      appliesTo: { groupIds, employeeCount: totalEmployees(groupIds) },
    });
  };

  return (
    <div className="pb-12">
      <div className="px-5 sm:px-6 pt-5 pb-3">
        <Breadcrumb
          items={[
            { label: 'Settings', to: '/settings' },
            { label: 'Attendance' },
            { label: 'Attendance policies', to: '/settings/attendance/policies' },
            { label: 'Break' },
            { label: isNew ? 'New break policy' : draft.name },
          ]}
        />
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-medium leading-tight">
              {isNew ? 'New break policy' : draft.name}
            </h1>
            <p className="text-13 text-app-mute dark:text-app-mute-dark mt-0.5">
              Break behaviour, schedule, and group assignment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/settings/attendance/policies')}>
              Discard
            </Button>
            <Button variant="primary" onClick={onSave}>
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 max-w-3xl space-y-4">
        <Card>
          <CardSectionLabel>Basics</CardSectionLabel>
          <div className="space-y-3">
            <Field label="Name">
              <input
                className="field-input"
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="field-input"
                rows={3}
                value={draft.description ?? ''}
                onChange={(e) => update({ description: e.target.value })}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardSectionLabel>Type & behaviour</CardSectionLabel>
          <div className="space-y-3">
            <div>
              <div className="text-13 font-medium mb-1.5">Paid</div>
              <div className="flex gap-2 flex-wrap">
                {(['paid', 'unpaid', 'mixed'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update({ paid: p })}
                    className={`px-3 py-1.5 rounded-md text-13 hairline capitalize ${
                      draft.paid === p
                        ? 'bg-app-ink text-white border-app-ink dark:bg-app-ink-dark dark:text-app-ink'
                        : 'bg-white dark:bg-app-card-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <Toggle
              label="Counts toward work hours"
              hint="When enabled, break duration is included in the daily work cap."
              checked={draft.countTowardWorkHours}
              onChange={(v) => update({ countTowardWorkHours: v })}
            />
          </div>
        </Card>

        <Card>
          <CardSectionLabel>Schedule</CardSectionLabel>
          <div className="text-13 font-medium mb-1.5">Schedule type</div>
          <div className="flex gap-2 flex-wrap">
            {(['fixed', 'flexible', 'mixed'] as Array<BreakScheduleType | 'mixed'>).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => update({ defaultScheduleType: s })}
                className={`px-3 py-1.5 rounded-md text-13 hairline capitalize ${
                  draft.defaultScheduleType === s
                    ? 'bg-app-ink text-white border-app-ink dark:bg-app-ink-dark dark:text-app-ink'
                    : 'bg-white dark:bg-app-card-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-11 text-app-mute dark:text-app-mute-dark mt-2">
            Default schedule shape applied when this policy is added to a shift preset.
          </p>
        </Card>

        <Card>
          <CardSectionLabel>Apply to</CardSectionLabel>
          <div className="text-13 font-medium mb-1.5">Groups</div>
          <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
            {draft.appliesTo.groupIds.length === 0 && (
              <span className="text-13 text-app-mute dark:text-app-mute-dark">No groups assigned.</span>
            )}
            {draft.appliesTo.groupIds.map((gid) => {
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
              .filter((g) => !draft.appliesTo.groupIds.includes(g.id))
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
            <span className="font-medium text-app-ink dark:text-app-ink-dark">
              {totalEmployees(draft.appliesTo.groupIds)}
            </span>
          </p>
        </Card>

        <Card>
          <CardSectionLabel>Compliance behaviour</CardSectionLabel>
          <div className="space-y-2.5">
            <Toggle
              label="Auto-mandate paid break during heat ban"
              hint="When outdoor work overlaps the 12:00–15:00 heat ban window, this break becomes paid and mandatory."
              checked={draft.autoMandatePaidDuringHeatBan}
              onChange={(v) => update({ autoMandatePaidDuringHeatBan: v })}
            />
            <Toggle
              label="Force break after 5 hours of work"
              hint="Required for KSA Labour Law Art. 101 compliance."
              checked={!!draft.forceBreakAfter5h}
              onChange={(v) => update({ forceBreakAfter5h: v })}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const Toggle = ({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex items-start justify-between gap-3 py-1.5">
    <span className="min-w-0">
      <span className="block text-13 font-medium">{label}</span>
      {hint && (
        <span className="block text-11 text-app-mute dark:text-app-mute-dark mt-0.5">{hint}</span>
      )}
    </span>
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition ${
        checked ? 'bg-app-ink dark:bg-app-ink-dark' : 'bg-app-subtle dark:bg-app-subtle-dark hairline'
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
