/**
 * EdgeCasesGallery — curated showcase of shift-config corner cases.
 *
 * Each Card renders one scenario with: title, KSA rule citation, short
 * description, a read-only Timeline preview (with the new clocking row +
 * compact mode), compliance status chip, and a deep-link to the regular
 * PresetDetail editor for hands-on poking.
 *
 * Lives only on the `edge-cases` branch — deployed at
 *   https://faeeza14.github.io/jisr-break-proto/edge-cases/
 */
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ShieldAlert } from 'lucide-react';
import {
  Button,
  Card,
  CardSection,
  PageHeader,
  SmartBreadcrumb,
  Tag,
} from '@jisr-hr/ds-web';
import { Timeline, TimelineLegend } from '../components/timeline/Timeline';
import { useAppStore } from '../store';
import { deriveSchedule } from '../lib/segments';
import { evaluateCompliance } from '../lib/compliance';
import { isHeatBanDate, fmtDuration } from '../lib/time';
import type { ShiftPreset } from '../types';

type EdgeCase = {
  presetId: string;
  title: string;
  rule: string;
  description: string;
};

const CASES: EdgeCase[] = [
  {
    presetId: 'edge-cross-day',
    title: 'Cross-day night shift',
    rule: 'Minute math · display wrap',
    description:
      'Shift starts at 22:00 and ends at 06:00 the next morning. The Timeline keeps minute values continuous past 1440 so anchored breaks and the work bar render correctly; HH:MM display wraps at midnight.',
  },
  {
    presetId: 'edge-heat-ban',
    title: 'Heat-ban collision',
    rule: 'KSA Ministerial Decision 3337',
    description:
      'Outdoor crew with a 30-minute fixed break at 12:00 leaves work running 12:30–15:00 inside the summer heat-ban window. A hard violation fires; the SuggestedFix splits the shift around the ban.',
  },
  {
    presetId: 'edge-art101',
    title: '5h continuous work',
    rule: 'KSA Labour Law Art. 101',
    description:
      'Long shift with its only break placed at 15:00 — seven hours of continuous work first. Art. 101 caps continuous work at five hours without at least a 30-minute break, so this is a hard violation.',
  },
  {
    presetId: 'edge-12h',
    title: '12h+ presence cap',
    rule: 'KSA Labour Law Art. 98',
    description:
      'Twelve hours of work plus a 90-minute lunch puts total daily presence at 13.5h, exceeding the 12-hour cap. Hard violation regardless of break placement.',
  },
];

const tagAppearance = (status: 'green' | 'amber' | 'red') =>
  status === 'red' ? 'danger' : status === 'amber' ? 'warning' : 'success';

const statusLabel = (status: 'green' | 'amber' | 'red') =>
  status === 'red' ? 'Hard violation' : status === 'amber' ? 'Warnings' : 'Compliant';

export const EdgeCasesGallery = () => {
  const navigate = useNavigate();
  const { presets, ui } = useAppStore();
  const date = new Date(ui.currentDate);

  return (
    <div className="pb-12">
      <PageHeader
        breadcrumb={
          <SmartBreadcrumb
            items={[
              { label: 'Settings', to: '/settings' },
              { label: 'Attendance' },
              { label: 'Edge cases' },
            ]}
          />
        }
        title="Edge cases · live demo"
        description="Curated compliance + scheduling scenarios. Each card mirrors a real preset — click 'Open full preset' to edit."
        border={false}
      />

      <div className="px-5 sm:px-6 space-y-4">
        <Card>
          <CardSection title="About this gallery">
            <p className="text-13 text-app-mute dark:text-app-mute-dark">
              Four pre-built shift presets that each exercise a specific corner case in the
              compliance engine. The Timeline previews are read-only; clicking{' '}
              <span className="font-medium">Open full preset</span> drops you into the regular
              editor where you can toggle the configuration to see how the rule responds.
            </p>
          </CardSection>
        </Card>

        {CASES.map((c) => {
          const preset = presets[c.presetId];
          if (!preset) {
            return (
              <Card key={c.presetId}>
                <p className="text-13 text-app-mute dark:text-app-mute-dark">
                  Seed preset <code>{c.presetId}</code> is missing — gallery card skipped.
                </p>
              </Card>
            );
          }
          return <EdgeCaseCard key={c.presetId} preset={preset} edge={c} date={date} onOpen={() => navigate(`/settings/attendance/shifts/presets/${preset.id}`)} />;
        })}
      </div>
    </div>
  );
};

const EdgeCaseCard = ({
  preset,
  edge,
  date,
  onOpen,
}: {
  preset: ShiftPreset;
  edge: EdgeCase;
  date: Date;
  onOpen: () => void;
}) => {
  const sched = deriveSchedule(preset);
  const compliance = evaluateCompliance({
    preset,
    context: { currentDate: date, country: 'SA' },
  });
  const heatBanActive = isHeatBanDate(date) && preset.workEnvironment !== 'indoor';
  const hardCount = compliance.violations.filter((v) => v.severity === 'hard').length;
  const softCount = compliance.violations.filter((v) => v.severity === 'soft').length;
  const showViolations = compliance.violations.some((v) => v.ruleId === 'ksa.heat_ban');

  const flexibleBreaksRender = sched.breakInstants
    .filter((bi) => bi.b.scheduleType === 'flexible')
    .map((bi) => ({ b: bi.b, start: bi.start, end: bi.end }));

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
              {edge.title}
            </h3>
            <Tag appearance={tagAppearance(compliance.status)} size="sm" leadingIcon={hardCount > 0 ? <ShieldAlert className="size-3" /> : undefined}>
              {statusLabel(compliance.status)}
              {hardCount + softCount > 0 ? ` · ${hardCount + softCount}` : ''}
            </Tag>
            <Tag appearance="neutral" size="sm">
              {preset.nameEn}
            </Tag>
          </div>
          <p className="text-11 text-app-faint dark:text-app-faint-dark mt-1">{edge.rule}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpen}
          trailingIcon={<ArrowUpRight className="size-3.5" />}
        >
          Open full preset
        </Button>
      </div>

      <p className="text-13 text-app-mute dark:text-app-mute-dark mb-4">{edge.description}</p>

      <Timeline
        schedule={sched}
        showHeatBan={heatBanActive}
        showViolations={showViolations}
        flexibleBreaks={flexibleBreaksRender}
        clocking={{
          clockInWindowStart: preset.clockInWindowStart,
          clockInWindowEnd: preset.clockInWindowEnd,
          clockOutWindowStart: preset.clockOutWindowStart,
          clockOutWindowEnd: preset.clockOutWindowEnd,
          clockInGraceMinutes: preset.clockInGraceMinutes,
        }}
      />
      <TimelineLegend
        showHeatBan={heatBanActive}
        showViolation={showViolations || hardCount > 0}
        showClocking
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <Metric label="Work" value={fmtDuration(sched.totalWorkMin)} />
        <Metric label="Break" value={fmtDuration(sched.totalBreakMin)} />
        <Metric
          label="Presence"
          value={fmtDuration(sched.presenceMin)}
          tone={sched.presenceMin > 12 * 60 ? 'danger' : undefined}
        />
        <Metric
          label="Violations"
          value={`${hardCount} hard · ${softCount} soft`}
          tone={hardCount > 0 ? 'danger' : softCount > 0 ? 'warning' : undefined}
        />
      </div>

      {compliance.violations.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {compliance.violations.map((v) => (
            <div
              key={v.ruleId}
              className={[
                'rounded-md hairline px-3 py-2 text-13',
                v.severity === 'hard'
                  ? 'bg-danger-bg/30 dark:bg-danger-bg-dark/20 text-app-ink dark:text-app-ink-dark'
                  : 'bg-warn-bg/40 dark:bg-warn-bg-dark/30 text-app-ink dark:text-app-ink-dark',
              ].join(' ')}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <Tag appearance={v.severity === 'hard' ? 'danger' : 'warning'} size="sm">
                  {v.severity === 'hard' ? 'Hard' : 'Soft'}
                </Tag>
                <span className="text-11 text-app-mute dark:text-app-mute-dark">{v.ruleId}</span>
              </div>
              <p>{v.message}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const Metric = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'danger' | 'warning';
}) => (
  <div className="rounded-md bg-app-surface dark:bg-app-subtle-dark/40 px-3 py-2">
    <div className="text-11 uppercase tracking-[0.06em] text-app-faint dark:text-app-faint-dark">
      {label}
    </div>
    <div
      className={[
        'text-13 font-medium mt-0.5',
        tone === 'danger'
          ? 'text-danger-ink dark:text-danger-ink-dark'
          : tone === 'warning'
            ? 'text-warn-ink dark:text-warn-ink-dark'
            : 'text-app-ink dark:text-app-ink-dark',
      ].join(' ')}
    >
      {value}
    </div>
  </div>
);
