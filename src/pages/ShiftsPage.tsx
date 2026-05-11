import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Download, Plus, Search } from 'lucide-react';
import { Button } from '../components/primitives/Button';
import { Chip } from '../components/primitives/Chip';
import { Pill } from '../components/primitives/Pill';
import { BreakIndicator, BreakIndicatorLegend, totalBreakMinutes } from '../components/BreakIndicator';
import { useAppStore } from '../store';
import { fmt12h, fmtDuration, parseHHMM } from '../lib/time';
import { evaluateCompliance } from '../lib/compliance';
import { deriveSchedule } from '../lib/segments';

type SubNav = 'presets' | 'open' | 'templates' | 'fixed';

const subNavItems: Array<{ id: SubNav; label: string }> = [
  { id: 'presets', label: 'Shift presets' },
  { id: 'open', label: 'Open shifts' },
  { id: 'templates', label: 'Templates' },
  { id: 'fixed', label: 'Fixed hours' },
];

export const ShiftsPage = () => {
  const [sub, setSub] = useState<SubNav>('presets');

  return (
    <>
      {(
        <div className="flex flex-col md:flex-row gap-4 p-5 sm:p-6">
          <nav className="md:w-56 shrink-0">
            <ul className="flex md:flex-col gap-1 overflow-x-auto">
              {subNavItems.map((it) => (
                <li key={it.id}>
                  <button
                    onClick={() => setSub(it.id)}
                    className={`whitespace-nowrap text-13 px-2.5 py-1.5 rounded-md w-full text-left ${
                      sub === it.id
                        ? 'bg-app-subtle dark:bg-app-subtle-dark text-app-ink dark:text-app-ink-dark font-medium'
                        : 'text-app-mute dark:text-app-mute-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark'
                    }`}
                  >
                    {it.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-1 min-w-0">
            {sub === 'presets' && <PresetsList />}
            {sub === 'templates' && <TemplatesList />}
            {sub === 'open' && <EmptyState title="No open shifts" sub="Open shifts let employees claim available slots." />}
            {sub === 'fixed' && <EmptyState title="No fixed hours configured" sub="Define salaried fixed hour patterns here." />}
          </div>
        </div>
      )}
    </>
  );
};

const EmptyState = ({ title, sub }: { title: string; sub: string }) => (
  <div className="rounded-card bg-white dark:bg-app-card-dark hairline p-8 text-center">
    <h2 className="text-13 font-medium">{title}</h2>
    <p className="mt-1 text-13 text-app-mute dark:text-app-mute-dark">{sub}</p>
  </div>
);

type SortDir = 'asc' | 'desc';

const PresetsList = () => {
  const { presets, breakPolicies, clockWindowPolicies, overtimePolicies, ui } = useAppStore();
  const [q, setQ] = useState('');
  const [showName, setShowName] = useState(true);
  const [breakSort, setBreakSort] = useState<SortDir | null>(null);

  const list = useMemo(() => Object.values(presets), [presets]);
  const filtered = list.filter((p) => p.nameEn.toLowerCase().includes(q.toLowerCase()));

  const sorted = useMemo(() => {
    if (!breakSort) return filtered;
    return [...filtered].sort((a, b) => {
      const da = totalBreakMinutes(a.breaks);
      const db = totalBreakMinutes(b.breaks);
      return breakSort === 'asc' ? da - db : db - da;
    });
  }, [filtered, breakSort]);

  const cwName = (id: string) => clockWindowPolicies.find((c) => c.id === id)?.name ?? '—';
  const otName = (id: string) => overtimePolicies.find((c) => c.id === id)?.name ?? '—';

  const date = new Date(ui.currentDate);

  const toggleBreakSort = () =>
    setBreakSort((d) => (d === null ? 'desc' : d === 'desc' ? 'asc' : null));

  const cols =
    'grid-cols-[40px_minmax(160px,1.4fr)_72px_minmax(140px,1fr)_minmax(140px,1.1fr)_minmax(140px,1.1fr)_minmax(110px,0.9fr)] min-[900px]:grid-cols-[40px_minmax(180px,1.4fr)_80px_minmax(180px,1.2fr)_minmax(160px,1.1fr)_minmax(160px,1.1fr)_minmax(120px,0.9fr)]';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-app-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search presets"
            className="w-full pl-7 pr-2.5 py-1.5 text-13 bg-white dark:bg-app-card-dark hairline rounded-md focus-ring placeholder:text-app-faint"
          />
        </div>
        <label className="flex items-center gap-2 text-13 text-app-mute dark:text-app-mute-dark">
          <input
            type="checkbox"
            checked={showName}
            onChange={(e) => setShowName(e.target.checked)}
            className="size-3.5 accent-app-ink"
          />
          Show shift name
        </label>
        <Button variant="secondary" size="sm">
          <Download className="size-3.5" />
          Import
        </Button>
        <Link
          to="/settings/attendance/shifts/presets/new"
          className="inline-flex items-center gap-1.5 rounded-lg font-medium h-7 px-2.5 text-11 bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-ink hover:opacity-90 focus-ring"
        >
          <Plus className="size-3.5" />
          New shift preset
        </Link>
      </div>

      <div className="rounded-card bg-white dark:bg-app-card-dark hairline overflow-hidden">
        <div className={`grid ${cols} gap-3 px-4 py-2.5 label-caps border-b-hair border-app-line dark:border-app-line-dark`}>
          <span></span>
          <span>Shift</span>
          <span>Duration</span>
          <button
            type="button"
            onClick={toggleBreakSort}
            className="inline-flex items-center gap-1 hover:text-app-ink dark:hover:text-app-ink-dark text-left"
          >
            Breaks
            {breakSort === 'asc' && <ArrowUp className="size-3" />}
            {breakSort === 'desc' && <ArrowDown className="size-3" />}
          </button>
          <span className="hidden min-[900px]:inline">Clock-in / out</span>
          <span className="hidden min-[900px]:inline">Overtime</span>
          <span>Compliance</span>
        </div>
        {sorted.map((p) => {
          const startMin = parseHHMM(p.startTime);
          const sched = deriveSchedule(p, breakPolicies);
          const result = evaluateCompliance({
            preset: p,
            breakPolicies,
            context: { currentDate: date, country: 'SA' },
          });
          const compliancePill =
            result.status === 'red' ? (
              <Pill tone="red">Violations</Pill>
            ) : result.status === 'amber' ? (
              <Pill tone="amber">Warnings</Pill>
            ) : (
              <Pill tone="green">Compliant</Pill>
            );
          return (
            <Link
              key={p.id}
              to={`/settings/attendance/shifts/presets/${p.id}`}
              className={`grid ${cols} gap-3 px-4 py-3 items-center text-13 border-b-hair border-app-line dark:border-app-line-dark last:border-b-0 hover:bg-app-subtle/50 dark:hover:bg-app-subtle-dark/50 transition-colors`}
            >
              <span className="size-4 rounded" style={{ backgroundColor: p.color }} aria-hidden />
              <div className="min-w-0">
                <div className="font-medium truncate">{showName ? p.nameEn : '—'}</div>
                <div className="text-11 text-app-mute dark:text-app-mute-dark">
                  {fmt12h(startMin)} – {fmt12h(sched.endMin)}
                </div>
              </div>
              <span className="text-app-mute dark:text-app-mute-dark">
                {fmtDuration(p.workDurationMinutes)}
              </span>
              <span className="min-w-0">
                <span className="hidden min-[900px]:inline">
                  <BreakIndicator breaks={p.breaks} breakPolicies={breakPolicies} />
                </span>
                <span className="inline min-[900px]:hidden">
                  <BreakIndicator breaks={p.breaks} breakPolicies={breakPolicies} compact />
                </span>
              </span>
              <Chip tone="gray" className="self-center hidden min-[900px]:inline-flex">
                {cwName(p.clockWindowPolicyId)}
              </Chip>
              <Chip tone="gray" className="self-center hidden min-[900px]:inline-flex">
                {otName(p.overtimePolicyId)}
              </Chip>
              <span>{compliancePill}</span>
            </Link>
          );
        })}
        <BreakIndicatorLegend />
      </div>
    </div>
  );
};

const presetIdsInTemplate = (t: import('../types').ShiftTemplate): string[] => {
  if (t.type === 'day') return t.dayPresetId ? [t.dayPresetId] : [];
  if (t.type === 'week') return (t.weekDays ?? []).filter((x): x is string => !!x);
  if (t.type === 'rotation')
    return (t.rotationWeeks ?? []).flatMap((w) =>
      w.dayPresetIds.filter((x): x is string => !!x),
    );
  return [];
};

const TemplatesList = () => {
  const { templates, presets, clockWindowPolicies, breakPolicies, ui } = useAppStore();
  const date = new Date(ui.currentDate);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Link
          to="/settings/attendance/shifts/templates/new"
          className="inline-flex items-center gap-1.5 rounded-lg font-medium h-7 px-2.5 text-11 bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-ink hover:opacity-90 focus-ring"
        >
          <Plus className="size-3.5" /> New template
        </Link>
      </div>
      <div className="grid gap-3">
        {Object.values(templates).map((t) => {
          const ids = presetIdsInTemplate(t);
          const presetsInTpl = ids.map((id) => presets[id]).filter(Boolean);
          const uniquePresets = Array.from(new Map(presetsInTpl.map((p) => [p.id, p])).values());
          const totalMin = presetsInTpl.reduce((acc, p) => acc + p.workDurationMinutes, 0);
          const someViolation = uniquePresets.some((p) => {
            const r = evaluateCompliance({
              preset: p,
              breakPolicies,
              context: { currentDate: date, country: 'SA' },
            });
            return r.status === 'red';
          });
          const typeLabel =
            t.type === 'day' ? 'Day template' : t.type === 'week' ? 'Week template' : 'Rotation template';
          return (
            <div
              key={t.id}
              className="rounded-card bg-white dark:bg-app-card-dark hairline p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-13 font-medium">{t.name}</span>
                    <Chip tone="gray">{typeLabel}</Chip>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {uniquePresets.map((p) => {
                      const cw = clockWindowPolicies.find((c) => c.id === p.clockWindowPolicyId);
                      return (
                        <Chip key={p.id} tone="gray">
                          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.nameEn} · {p.startTime}–{cw?.clockOutWindowEnd ?? '—'}
                        </Chip>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-13">{fmtDuration(totalMin)}</div>
                  <div className="mt-1">
                    {someViolation ? (
                      <Pill tone="red">Violations</Pill>
                    ) : (
                      <Pill tone="green">Compliant</Pill>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
