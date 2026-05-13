import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { ArrowUpRight, CalendarRange, CheckCircle2, History, Pencil, Plus, ShieldAlert } from 'lucide-react';

import {
  PageHeader,
  SmartBreadcrumb,
  Card,
  CardSection,
  Button,
  Field,
  Input,
  Tag,
  Banner,
  useToast,
} from '@jisr-hr/ds-web';
import { Timeline, TimelineLegend } from '../components/timeline/Timeline';
import { BreakSheet } from '../components/BreakSheet';
import { OverrideModal } from '../components/OverrideModal';
import { SaveDiffModal } from '../components/SaveDiffModal';
import { AuditLogModal } from '../components/AuditLogModal';

import { useAppStore } from '../store';
import { evaluateCompliance } from '../lib/compliance';
import { deriveSchedule } from '../lib/segments';
import { fmt12h, fmtDuration, fmtHHMM, isHeatBanDate, parseHHMM } from '../lib/time';
import type { BreakInstance, ShiftPreset, WorkEnvironment } from '../types';

const COLOR_SWATCHES = ['#D58A2F', '#2F9C95', '#C26B7E', '#6B5BD4', '#1F4F8E'];

const buildAuditDiff = (a: ShiftPreset, b: ShiftPreset) => {
  const diff: { field: string; before: unknown; after: unknown }[] = [];
  if (a.nameEn !== b.nameEn) diff.push({ field: 'nameEn', before: a.nameEn, after: b.nameEn });
  if (a.nameAr !== b.nameAr) diff.push({ field: 'nameAr', before: a.nameAr, after: b.nameAr });
  if (a.color !== b.color) diff.push({ field: 'color', before: a.color, after: b.color });
  if (a.workEnvironment !== b.workEnvironment)
    diff.push({ field: 'workEnvironment', before: a.workEnvironment, after: b.workEnvironment });
  if (a.startTime !== b.startTime)
    diff.push({ field: 'startTime', before: a.startTime, after: b.startTime });
  if (a.workDurationMinutes !== b.workDurationMinutes)
    diff.push({ field: 'workDurationMinutes', before: a.workDurationMinutes, after: b.workDurationMinutes });
  if (a.clockWindowPolicyId !== b.clockWindowPolicyId)
    diff.push({ field: 'clockWindowPolicyId', before: a.clockWindowPolicyId, after: b.clockWindowPolicyId });
  if (a.overtimePolicyId !== b.overtimePolicyId)
    diff.push({ field: 'overtimePolicyId', before: a.overtimePolicyId, after: b.overtimePolicyId });
  const aBreaks = a.breaks.map((x) => x.id).sort().join(',');
  const bBreaks = b.breaks.map((x) => x.id).sort().join(',');
  if (aBreaks !== bBreaks) diff.push({ field: 'breaks', before: aBreaks || '∅', after: bBreaks || '∅' });
  return diff;
};

const buildEmptyPreset = (): ShiftPreset => ({
  id: `preset-${nanoid(6)}`,
  nameEn: 'New shift preset',
  nameAr: 'مناوبة جديدة',
  color: '#6B5BD4',
  workEnvironment: 'indoor',
  startTime: '09:00',
  workDurationMinutes: 480,
  breaks: [],
  clockWindowPolicyId: 'cw2',
  overtimePolicyId: 'ot2',
  usedInTemplateIds: [],
});

export const PresetDetail = () => {
  const { id = 'cc' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const isNewRoute = location.pathname.endsWith('/presets/new');
  const {
    presets,
    breakPolicies,
    clockWindowPolicies,
    overtimePolicies,
    templates,
    assignments,
    auditLog,
    appendAudit,
    ui,
    setDate,
    updatePreset,
    replacePreset,
    createPreset,
    addBreak,
    updateBreak,
    removeBreak,
  } = useAppStore();

  // On /presets/new, mint a draft, drop it in the store, and redirect to its real id.
  useEffect(() => {
    if (!isNewRoute) return;
    const draft = buildEmptyPreset();
    createPreset(draft);
    navigate(`/settings/attendance/shifts/presets/${draft.id}`, { replace: true });
  }, [isNewRoute, createPreset, navigate]);

  const preset = presets[id];
  const snapshotRef = useRef<ShiftPreset | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [breakSheet, setBreakSheet] = useState<{ open: boolean; editing: BreakInstance | null }>({
    open: false,
    editing: null,
  });
  const [overridden, setOverridden] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (preset && snapshotRef.current?.id !== preset.id) {
      snapshotRef.current = structuredClone(preset);
      setOverridden(false);
    }
  }, [preset]);

  if (isNewRoute) return null;

  if (!preset) {
    return (
      <div className="p-6">
        <p className="text-13">Preset not found.</p>
      </div>
    );
  }

  const date = new Date(ui.currentDate);
  const sched = deriveSchedule(preset, breakPolicies);
  const compliance = evaluateCompliance({
    preset,
    breakPolicies,
    context: { currentDate: date, country: 'SA' },
  });
  const isDirty =
    snapshotRef.current && JSON.stringify(snapshotRef.current) !== JSON.stringify(preset);

  const cwPolicy = clockWindowPolicies.find((c) => c.id === preset.clockWindowPolicyId);
  const otPolicy = overtimePolicies.find((c) => c.id === preset.overtimePolicyId);
  const policyMap = Object.fromEntries(breakPolicies.map((b) => [b.id, b]));

  const heatBanActive = isHeatBanDate(date) && preset.workEnvironment !== 'indoor';
  const showViolations = !overridden && compliance.violations.some((v) => v.ruleId === 'ksa.heat_ban');
  const hardViolations = overridden ? [] : compliance.violations.filter((v) => v.severity === 'hard');
  const firstHard = hardViolations[0];

  const flexibleBreaksRender = sched.breakInstants
    .filter((bi) => bi.b.scheduleType === 'flexible')
    .map((bi) => ({ b: bi.b, start: bi.start, end: bi.end }));

  const usedTemplates = preset.usedInTemplateIds
    .map((tid) => templates[tid]?.name)
    .filter(Boolean) as string[];

  const hardCount = hardViolations.length;
  const softCount = compliance.violations.filter((v) => v.severity === 'soft').length;

  const baselineHard = snapshotRef.current
    ? evaluateCompliance({
        preset: snapshotRef.current,
        breakPolicies,
        context: { currentDate: date, country: 'SA' },
      }).violations.filter((v) => v.severity === 'hard').length
    : 0;
  const introducesViolations = hardCount > baselineHard;

  const presetEntries = auditLog.filter(
    (e) => e.entityType === 'preset' && e.entityId === preset.id,
  );

  const cellsAffected = assignments.filter((a) => a.presetId === preset.id).length;
  const templatesAffected = preset.usedInTemplateIds.length;

  const commitSave = (reason: string | null) => {
    const before = snapshotRef.current!;
    appendAudit({
      entityType: 'preset',
      entityId: preset.id,
      userId: 'admin',
      userName: 'Admin · AlAqel',
      action: 'edit',
      diff: buildAuditDiff(before, preset),
      complianceImpact: { before: baselineHard, after: hardCount },
      reason: reason ?? undefined,
    });
    snapshotRef.current = structuredClone(preset);
    setDiffOpen(false);
    toast.success('Preset saved', `${cellsAffected} cells updated.`);
  };

  const headerStatus =
    hardCount > 0 ? (
      <Tag appearance="danger" size="md" leadingIcon={<ShieldAlert className="size-3" />}>
        {hardCount} compliance issue{hardCount === 1 ? '' : 's'}
      </Tag>
    ) : (
      <Tag appearance="success" size="md" leadingIcon={<CheckCircle2 className="size-3" />}>
        Compliant{softCount > 0 ? ` · ${softCount} note${softCount === 1 ? '' : 's'}` : ''}
      </Tag>
    );

  const onSaveBreak = (b: BreakInstance) => {
    const exists = preset.breaks.find((x) => x.id === b.id);
    if (exists) updateBreak(preset.id, b.id, b);
    else addBreak(preset.id, b);
    setBreakSheet({ open: false, editing: null });
  };

  return (
    <div className="pb-12">
      <PageHeader
        breadcrumb={
          <SmartBreadcrumb
            items={[
              { label: 'Settings', to: '/settings' },
              { label: 'Attendance' },
              { label: 'Shifts & scheduling', to: '/settings/attendance/shifts' },
              { label: 'Shift presets', to: '/settings/attendance/shifts' },
              { label: preset.nameEn },
            ]}
          />
        }
        title={preset.nameEn}
        description={`Shift preset · Used in ${preset.usedInTemplateIds.length} template${preset.usedInTemplateIds.length === 1 ? '' : 's'}`}
        border={false}
        actions={
          <>
            <div className="inline-flex items-center gap-1.5 hairline rounded-md px-2 h-9 bg-white dark:bg-app-card-dark">
              <CalendarRange className="size-3.5 text-app-faint" />
              <input
                type="date"
                value={ui.currentDate}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-13 focus:outline-none text-app-ink dark:text-app-ink-dark"
                aria-label="Current date"
              />
            </div>
            {headerStatus}
            <Button variant="secondary" onClick={() => setHistoryOpen(true)} leadingIcon={<History className="size-3.5" />}>
              History
            </Button>
            <Button
              variant="secondary"
              disabled={!isDirty}
              onClick={() => {
                if (snapshotRef.current) replacePreset(preset.id, structuredClone(snapshotRef.current));
                setOverridden(false);
              }}
            >
              Discard
            </Button>
            <Button
              variant="primary"
              disabled={!isDirty}
              onClick={() => setDiffOpen(true)}
            >
              Save
            </Button>
          </>
        }
      />

      <div className="px-5 sm:px-6 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4 max-w-[1200px]">
        <div className="space-y-4 min-w-0">
          <Card>
            <CardSection title="Shift details">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Name in English">
                  <Input
                    value={preset.nameEn}
                    onChange={(e) => updatePreset(preset.id, { nameEn: e.target.value })}
                  />
                </Field>
                <Field label="Name in Arabic">
                  <Input
                    dir="rtl"
                    className="text-right"
                    value={preset.nameAr}
                    onChange={(e) => updatePreset(preset.id, { nameAr: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <Field label="Color">
                  <div className="flex items-center gap-2">
                    {COLOR_SWATCHES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Color ${c}`}
                        onClick={() => updatePreset(preset.id, { color: c })}
                        className={`size-7 rounded-md transition ${
                          preset.color === c
                            ? 'ring-2 ring-offset-2 ring-app-ink dark:ring-app-ink-dark dark:ring-offset-app-card-dark'
                            : 'hairline'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </Field>
                <Field
                  label="Work environment"
                  description="Drives heat-ban compliance for the KSA outdoor work rule."
                >
                  <select
                    className="w-full h-9 px-3 text-13 rounded-lg hairline bg-white dark:bg-app-card-dark text-app-ink dark:text-app-ink-dark focus:outline-none focus:ring-2 focus:ring-app-ink"
                    value={preset.workEnvironment}
                    onChange={(e) =>
                      updatePreset(preset.id, { workEnvironment: e.target.value as WorkEnvironment })
                    }
                  >
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </Field>
              </div>
            </CardSection>
          </Card>

          <Card>
            <CardSection title="Schedule">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Start work at">
                  <Input
                    type="time"
                    value={preset.startTime}
                    onChange={(e) => updatePreset(preset.id, { startTime: e.target.value })}
                  />
                </Field>
                <Field
                  label="Should work for"
                  description={`Shift ends ${fmt12h(sched.endMin)} (${fmtDuration(preset.workDurationMinutes)} work + ${fmtDuration(sched.totalBreakMin)} break)`}
                >
                  <Input
                    value={fmtHHMM(preset.workDurationMinutes)}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d{1,2}:\d{2}$/.test(v)) {
                        updatePreset(preset.id, { workDurationMinutes: parseHHMM(v) });
                      }
                    }}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium mb-2">
                  Live preview
                </p>
                <Timeline
                  schedule={sched}
                  showHeatBan={heatBanActive}
                  showViolations={showViolations}
                  flexibleBreaks={flexibleBreaksRender}
                />
                <TimelineLegend showHeatBan={heatBanActive} showViolation={showViolations} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                <Metric label="Work hours" value={fmtDuration(sched.totalWorkMin)} />
                <Metric label="Break" value={fmtDuration(sched.totalBreakMin)} />
                <Metric
                  label="Daily presence"
                  value={fmtDuration(sched.presenceMin)}
                  tone={sched.presenceMin > 12 * 60 ? 'danger' : undefined}
                />
                <Metric
                  label="Auto OT after"
                  value={otPolicy?.autoOvertimeAfterMinutes ? fmtDuration(otPolicy.autoOvertimeAfterMinutes) : '—'}
                />
              </div>

              {firstHard && !overridden && (
                <div className="mt-5">
                  <Banner appearance="danger" emphasis="mid" title="Compliance violation">
                    {firstHard.message} — {firstHard.citation}
                  </Banner>
                  {firstHard.suggestedFix && (
                    <SuggestedFix
                      fix={firstHard.suggestedFix}
                      onApply={() => replacePreset(preset.id, firstHard.suggestedFix!)}
                      onOverride={() => setOverrideOpen(true)}
                    />
                  )}
                </div>
              )}

              {overridden && (
                <div className="mt-5">
                  <Banner
                    appearance="warning"
                    emphasis="mid"
                    title="Compliance violations overridden"
                    actions={
                      <Button variant="ghost" size="sm" onClick={() => setOverridden(false)}>
                        Re-evaluate
                      </Button>
                    }
                  >
                    Audit logged.
                  </Banner>
                </div>
              )}
            </CardSection>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium">
                Breaks
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBreakSheet({ open: true, editing: null })}
                leadingIcon={<Plus className="size-3.5" />}
              >
                Add break
              </Button>
            </div>
            <ul className="space-y-2">
              {preset.breaks.length === 0 && (
                <li className="text-13 text-app-mute dark:text-app-mute-dark py-4 text-center hairline rounded-md">
                  No breaks configured.
                </li>
              )}
              {preset.breaks.map((b) => {
                const policy = policyMap[b.breakPolicyId];
                const dot =
                  b.scheduleType === 'fixed'
                    ? 'bg-app-ink dark:bg-app-ink-dark'
                    : b.scheduleType === 'flexible'
                      ? 'border-2 border-app-ink dark:border-app-ink-dark'
                      : 'bg-gradient-to-r from-app-ink to-transparent';
                const schedLabel =
                  b.scheduleType === 'fixed'
                    ? `at ${b.fixedTime}`
                    : b.scheduleType === 'flexible'
                      ? `${b.flexibleWindow?.start}–${b.flexibleWindow?.end} window`
                      : `${b.anchoredOffsetMinutes}m after clock-in`;
                return (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 rounded-md bg-app-subtle/70 dark:bg-app-subtle-dark/70 px-3 py-2.5"
                  >
                    <span className={`size-2 rounded-full shrink-0 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-13 font-medium truncate text-app-ink dark:text-app-ink-dark">{b.name}</div>
                      <div className="text-11 text-app-mute dark:text-app-mute-dark">
                        {policy?.name ?? '—'} · {b.paidOverride ? 'paid' : (policy?.paid ?? 'unpaid')} · {schedLabel}
                      </div>
                    </div>
                    <Tag appearance="neutral" size="sm">{fmtDuration(b.durationMinutes)}</Tag>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBreakSheet({ open: true, editing: b })}
                      leadingIcon={<Pencil className="size-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeBreak(preset.id, b.id)}>
                      Remove
                    </Button>
                  </li>
                );
              })}
            </ul>
            <p className="text-11 text-app-mute dark:text-app-mute-dark mt-3">
              Filled dot · fixed time · Hollow dot · flexible window · Half dot · anchored to clock-in
            </p>
          </Card>

          <Card>
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium">
                Linked attendance policies
              </p>
              <span className="text-11 text-app-mute dark:text-app-mute-dark">
                Configured in{' '}
                <Link
                  to="/settings/attendance/policies"
                  className="underline underline-offset-2 hover:text-app-ink"
                >
                  Settings · Attendance policies
                </Link>
              </span>
            </div>
            <div className="divide-y divide-app-line dark:divide-app-line-dark">
              <PolicyRow
                title="Clock-in / clock-out window"
                meta={
                  cwPolicy
                    ? `${cwPolicy.clockInGraceMinutes}m grace · ${cwPolicy.clockInWindowStart}–${cwPolicy.clockInWindowEnd} in / ${cwPolicy.clockOutWindowStart}–${cwPolicy.clockOutWindowEnd} out${cwPolicy.geofenceRequired ? ` · ${cwPolicy.geofenceRadiusMeters}m geofence` : ''}`
                    : '—'
                }
                value={preset.clockWindowPolicyId}
                options={clockWindowPolicies.map((c) => ({ id: c.id, label: c.name }))}
                onChange={(v) => updatePreset(preset.id, { clockWindowPolicyId: v })}
                configureTo={`/settings/attendance/policies/clock_window/${preset.clockWindowPolicyId}`}
              />
              <PolicyRow
                title="Overtime"
                meta={
                  otPolicy
                    ? `${otPolicy.paidRate}× standard · ${otPolicy.holidayRate}× holiday · ${otPolicy.preApprovalRequired ? 'Pre-approval required' : 'No pre-approval'}${otPolicy.autoOvertimeAfterMinutes ? ` · auto OT after ${otPolicy.autoOvertimeAfterMinutes}m` : ''}`
                    : '—'
                }
                value={preset.overtimePolicyId}
                options={overtimePolicies.map((c) => ({ id: c.id, label: c.name }))}
                onChange={(v) => updatePreset(preset.id, { overtimePolicyId: v })}
                configureTo={`/settings/attendance/policies/overtime/${preset.overtimePolicyId}`}
              />
            </div>
          </Card>

          <Card>
            <CardSection title="Used in templates">
              <div className="flex items-center justify-between gap-3">
                <p className="text-13 text-app-mute dark:text-app-mute-dark">
                  {usedTemplates.length === 0
                    ? 'This preset is not yet used in any template.'
                    : `This preset is part of ${usedTemplates.length} template${usedTemplates.length === 1 ? '' : 's'} · ${usedTemplates.join(', ')}`}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/settings/attendance/shifts')}
                >
                  View templates
                </Button>
              </div>
            </CardSection>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 self-start">
          <Card>
            <CardSection title="Compliance summary">
              <div className="space-y-2">
                {compliance.violations.length === 0 && (
                  <div className="text-13 text-app-mute dark:text-app-mute-dark">
                    No applicable issues for the selected date.
                  </div>
                )}
                {compliance.violations.map((v) => (
                  <div
                    key={v.ruleId}
                    className={`rounded-md hairline p-2.5 text-13 ${
                      v.severity === 'hard'
                        ? 'bg-danger-bg/30 dark:bg-danger-bg-dark/20'
                        : 'bg-warn-bg/40 dark:bg-warn-bg-dark/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag appearance={v.severity === 'hard' ? 'danger' : 'warning'} size="sm">
                        {v.severity === 'hard' ? 'Hard' : 'Soft'}
                      </Tag>
                      <span className="text-11 text-app-mute dark:text-app-mute-dark">{v.ruleId}</span>
                    </div>
                    <p className="mt-1 text-app-ink dark:text-app-ink-dark">{v.message}</p>
                  </div>
                ))}
              </div>
            </CardSection>
          </Card>
          <Card>
            <CardSection title="Demo notes">
              <p className="text-13 text-app-mute dark:text-app-mute-dark">
                Heat ban applies for outdoor / mixed environments between 15 Jun and 15 Sep.
                Use the date picker to scrub to {ui.currentDate}.
              </p>
            </CardSection>
          </Card>
        </aside>
      </div>

      <BreakSheet
        open={breakSheet.open}
        onClose={() => setBreakSheet({ open: false, editing: null })}
        initial={breakSheet.editing}
        breakPolicies={breakPolicies}
        onSave={onSaveBreak}
      />
      <OverrideModal
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        presetId={preset.id}
        violations={hardViolations}
        onConfirm={(reason) => {
          appendAudit({
            entityType: 'preset',
            entityId: preset.id,
            userId: 'admin',
            userName: 'Admin · AlAqel',
            action: 'override',
            diff: [],
            reason,
            complianceImpact: { before: hardCount, after: 0 },
          });
          // eslint-disable-next-line no-console
          console.log('[AUDIT]', {
            presetId: preset.id,
            violations: hardViolations.map((v) => v.ruleId),
            reason,
            timestamp: new Date().toISOString(),
            user: 'admin@alaqel.com',
          });
          setOverridden(true);
        }}
      />
      <SaveDiffModal
        open={diffOpen}
        onClose={() => setDiffOpen(false)}
        before={snapshotRef.current}
        after={preset}
        templatesAffected={templatesAffected}
        cellsAffected={cellsAffected}
        hardBefore={baselineHard}
        hardAfter={hardCount}
        reasonRequired={introducesViolations}
        onConfirm={(reason) => commitSave(reason)}
      />
      <AuditLogModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entries={presetEntries}
        title={`History · ${preset.nameEn}`}
      />
    </div>
  );
};

const Metric = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'danger';
}) => (
  <div
    className={`rounded-md hairline p-3 ${
      tone === 'danger'
        ? 'bg-danger-bg/30 dark:bg-danger-bg-dark/30'
        : 'bg-app-subtle/40 dark:bg-app-subtle-dark/40'
    }`}
  >
    <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium">
      {label}
    </p>
    <div className="mt-1 text-13 font-medium text-app-ink dark:text-app-ink-dark">{value}</div>
  </div>
);

const PolicyRow = ({
  title,
  meta,
  value,
  options,
  onChange,
  configureTo,
}: {
  title: string;
  meta: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
  configureTo: string;
}) => (
  <div className="py-3 first:pt-0 last:pb-0 grid sm:grid-cols-[minmax(0,1fr)_220px_auto] gap-3 items-center">
    <div className="min-w-0">
      <div className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{title}</div>
      <div className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5 truncate">{meta}</div>
    </div>
    <select
      className="w-full h-9 px-3 text-13 rounded-lg hairline bg-white dark:bg-app-card-dark text-app-ink dark:text-app-ink-dark focus:outline-none focus:ring-2 focus:ring-app-ink"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
    <Link
      to={configureTo}
      className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-lg hairline bg-white dark:bg-app-card-dark text-13 text-app-ink dark:text-app-ink-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
    >
      Configure
      <ArrowUpRight className="size-3.5" />
    </Link>
  </div>
);

const SuggestedFix = ({
  fix,
  onApply,
  onOverride,
}: {
  fix: ShiftPreset;
  onApply: () => void;
  onOverride: () => void;
}) => {
  const { breakPolicies } = useAppStore();
  const sched = deriveSchedule(fix, breakPolicies);
  return (
    <div className="mt-3 rounded-md bg-white dark:bg-app-card-dark hairline p-3">
      <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium mb-2">
        Suggested fix · split shift
      </p>
      <Timeline
        schedule={sched}
        showHeatBan
        showViolations={false}
        flexibleBreaks={[]}
      />
      <div className="mt-2 text-11 text-app-mute dark:text-app-mute-dark">
        {fmt12h(sched.startMin)} – {fmt12h(sched.endMin)} · {fmtDuration(sched.totalWorkMin)} work ·{' '}
        {fmtDuration(sched.totalBreakMin)} mandated paid break
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={onApply}>
          Apply auto-fix
        </Button>
        <Button variant="secondary" size="sm" onClick={onOverride}>
          Override · audit logged
        </Button>
      </div>
    </div>
  );
};
