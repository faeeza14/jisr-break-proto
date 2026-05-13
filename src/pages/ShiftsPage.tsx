import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, CalendarRange, Clock, Download, Plus, Search } from 'lucide-react';
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  Table,
  Tag,
} from '@jisr-hr/ds-web';
import type { TableColumn } from '@jisr-hr/ds-web';
import { BreakIndicator, BreakIndicatorLegend, totalBreakMinutes } from '../components/BreakIndicator';
import { useAppStore } from '../store';
import { fmt12h, fmtDuration, parseHHMM } from '../lib/time';
import { evaluateCompliance } from '../lib/compliance';
import { deriveSchedule } from '../lib/segments';
import type { ShiftPreset, ShiftTemplate } from '../types';

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
                    : 'text-app-mute dark:text-app-mute-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark'
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
        {sub === 'open' && (
          <Empty
            media={<CalendarRange className="size-6" />}
            title="No open shifts"
            description="Open shifts let employees claim available slots."
          />
        )}
        {sub === 'fixed' && (
          <Empty
            media={<Clock className="size-6" />}
            title="No fixed hours configured"
            description="Define salaried fixed hour patterns here."
          />
        )}
      </div>
    </div>
  );
};

type SortDir = 'asc' | 'desc';

const PresetsList = () => {
  const { presets, breakPolicies, clockWindowPolicies, overtimePolicies, ui } = useAppStore();
  const navigate = useNavigate();
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

  const cols: TableColumn<ShiftPreset>[] = [
    {
      key: 'color',
      header: '',
      width: '40px',
      render: (p) => (
        <span className="size-4 rounded inline-block" style={{ backgroundColor: p.color }} aria-hidden />
      ),
    },
    {
      key: 'name',
      header: 'Shift',
      width: 'minmax(180px,1.4fr)',
      render: (p) => {
        const startMin = parseHHMM(p.startTime);
        const sched = deriveSchedule(p, breakPolicies);
        return (
          <div className="min-w-0">
            <div className="font-medium truncate text-app-ink dark:text-app-ink-dark">
              {showName ? p.nameEn : '—'}
            </div>
            <div className="text-11 text-app-mute dark:text-app-mute-dark">
              {fmt12h(startMin)} – {fmt12h(sched.endMin)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'duration',
      header: 'Duration',
      width: '80px',
      render: (p) => (
        <span className="text-app-mute dark:text-app-mute-dark">{fmtDuration(p.workDurationMinutes)}</span>
      ),
    },
    {
      key: 'breaks',
      header: 'Breaks',
      width: 'minmax(180px,1.2fr)',
      render: (p) => (
        <span className="min-w-0">
          <span className="hidden min-[900px]:inline">
            <BreakIndicator breaks={p.breaks} breakPolicies={breakPolicies} />
          </span>
          <span className="inline min-[900px]:hidden">
            <BreakIndicator breaks={p.breaks} breakPolicies={breakPolicies} compact />
          </span>
        </span>
      ),
    },
    {
      key: 'cw',
      header: 'Clock-in / out',
      width: 'minmax(160px,1.1fr)',
      render: (p) => (
        <Tag appearance="neutral" size="sm">
          {cwName(p.clockWindowPolicyId)}
        </Tag>
      ),
    },
    {
      key: 'ot',
      header: 'Overtime',
      width: 'minmax(160px,1.1fr)',
      render: (p) => (
        <Tag appearance="neutral" size="sm">
          {otName(p.overtimePolicyId)}
        </Tag>
      ),
    },
    {
      key: 'compliance',
      header: 'Compliance',
      width: 'minmax(120px,0.9fr)',
      render: (p) => {
        const result = evaluateCompliance({
          preset: p,
          breakPolicies,
          context: { currentDate: date, country: 'SA' },
        });
        if (result.status === 'red') return <Tag appearance="danger" size="sm">Violations</Tag>;
        if (result.status === 'amber') return <Tag appearance="warning" size="sm">Warnings</Tag>;
        return <Tag appearance="success" size="sm">Compliant</Tag>;
      },
    },
  ];

  // Override the "Breaks" header with a sort toggle
  cols[3].header = '';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px]">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search presets"
            startAddon={<Search className="size-3.5" />}
            size="sm"
          />
        </div>
        <label className="flex items-center gap-2 text-13 text-app-mute dark:text-app-mute-dark cursor-pointer">
          <Checkbox checked={showName} onCheckedChange={setShowName} size="sm" />
          Show shift name
        </label>
        <Button variant="secondary" size="sm" leadingIcon={<Download className="size-3.5" />}>
          Import
        </Button>
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Plus className="size-3.5" />}
          onClick={() => navigate('/settings/attendance/shifts/presets/new')}
        >
          New shift preset
        </Button>
      </div>

      <div className="flex items-center gap-2 text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium px-1">
        <span>Sort breaks by total duration:</span>
        <button
          type="button"
          onClick={toggleBreakSort}
          className="inline-flex items-center gap-1 hover:text-app-ink dark:hover:text-app-ink-dark"
        >
          {breakSort === 'asc' ? <><ArrowUp className="size-3" /> Asc</> : breakSort === 'desc' ? <><ArrowDown className="size-3" /> Desc</> : 'None'}
        </button>
      </div>

      <Table
        columns={cols}
        data={sorted}
        getRowKey={(p) => p.id}
        onRowClick={(p) => navigate(`/settings/attendance/shifts/presets/${p.id}`)}
        emptyState={
          <p className="text-13 text-app-mute dark:text-app-mute-dark">No shift presets match.</p>
        }
      />
      <BreakIndicatorLegend />
    </div>
  );
};

const presetIdsInTemplate = (t: ShiftTemplate): string[] => {
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
  const navigate = useNavigate();
  const date = new Date(ui.currentDate);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Plus className="size-3.5" />}
          onClick={() => navigate('/settings/attendance/shifts/templates/new')}
        >
          New template
        </Button>
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
            <Card key={t.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{t.name}</span>
                    <Tag appearance="neutral" size="sm">{typeLabel}</Tag>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {uniquePresets.map((p) => {
                      const cw = clockWindowPolicies.find((c) => c.id === p.clockWindowPolicyId);
                      return (
                        <Tag
                          key={p.id}
                          appearance="neutral"
                          size="sm"
                          leadingIcon={
                            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: p.color }} />
                          }
                        >
                          {p.nameEn} · {p.startTime}–{cw?.clockOutWindowEnd ?? '—'}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-13 text-app-ink dark:text-app-ink-dark">{fmtDuration(totalMin)}</div>
                  <div className="mt-1">
                    {someViolation ? (
                      <Tag appearance="danger" size="sm">Violations</Tag>
                    ) : (
                      <Tag appearance="success" size="sm">Compliant</Tag>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
