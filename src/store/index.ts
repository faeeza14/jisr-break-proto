import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  Assignment,
  AuditEntry,
  BreakInstance,
  BreakPolicy,
  ClockWindowPolicy,
  Employee,
  ExcusePolicy,
  Group,
  OvertimePolicy,
  PunchCorrectionPolicy,
  ShiftPreset,
  ShiftTemplate,
} from '../types';
import {
  assignments as seedAssignments,
  breakPolicies as seedBreakPolicies,
  clockWindowPolicies as seedClockWindowPolicies,
  employees as seedEmployees,
  excusePolicies as seedExcusePolicies,
  groups as seedGroups,
  overtimePolicies as seedOvertimePolicies,
  punchCorrectionPolicies as seedPunchCorrectionPolicies,
  shiftPresets as seedPresets,
  templates as seedTemplates,
} from '../data/seed';

const indexById = <T extends { id: string }>(items: T[]): Record<string, T> =>
  Object.fromEntries(items.map((p) => [p.id, p]));

type AppState = {
  presets: Record<string, ShiftPreset>;
  breakPolicies: BreakPolicy[];
  clockWindowPolicies: ClockWindowPolicy[];
  overtimePolicies: OvertimePolicy[];
  excusePolicies: ExcusePolicy[];
  punchCorrectionPolicies: PunchCorrectionPolicy[];
  templates: Record<string, ShiftTemplate>;
  groups: Group[];
  employees: Employee[];
  assignments: Assignment[];
  auditLog: AuditEntry[];
  ui: { currentDate: string };

  updatePreset: (id: string, patch: Partial<ShiftPreset>) => void;
  replacePreset: (id: string, full: ShiftPreset) => void;
  createPreset: (full: ShiftPreset) => void;
  addBreak: (presetId: string, b: BreakInstance) => void;
  updateBreak: (presetId: string, breakId: string, patch: Partial<BreakInstance>) => void;
  removeBreak: (presetId: string, breakId: string) => void;
  updateBreakPolicy: (id: string, patch: Partial<BreakPolicy>) => void;
  updateClockWindowPolicy: (id: string, patch: Partial<ClockWindowPolicy>) => void;
  updateOvertimePolicy: (id: string, patch: Partial<OvertimePolicy>) => void;
  createBreakPolicy: (full: BreakPolicy) => void;
  createClockWindowPolicy: (full: ClockWindowPolicy) => void;
  createOvertimePolicy: (full: OvertimePolicy) => void;
  createExcusePolicy: (full: ExcusePolicy) => void;
  createPunchCorrectionPolicy: (full: PunchCorrectionPolicy) => void;
  createTemplate: (full: ShiftTemplate) => void;
  upsertAssignment: (a: Pick<Assignment, 'employeeId' | 'date' | 'presetId' | 'source'>) => void;
  removeAssignment: (employeeId: string, date: string) => void;
  swapAssignments: (
    a: { employeeId: string; date: string },
    b: { employeeId: string; date: string },
  ) => void;
  applyPresetToWeek: (employeeId: string, weekStartIso: string, presetId: string | null) => void;
  appendAudit: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  setDate: (iso: string) => void;
};

const tsNow = () => new Date().toISOString();

export const useAppStore = create<AppState>((set, get) => ({
  presets: indexById(seedPresets),
  breakPolicies: seedBreakPolicies,
  clockWindowPolicies: seedClockWindowPolicies,
  overtimePolicies: seedOvertimePolicies,
  excusePolicies: seedExcusePolicies,
  punchCorrectionPolicies: seedPunchCorrectionPolicies,
  templates: indexById(seedTemplates),
  groups: seedGroups,
  employees: seedEmployees,
  assignments: seedAssignments,
  auditLog: [],
  ui: { currentDate: '2026-08-15' },

  updatePreset: (id, patch) =>
    set((s) => ({ presets: { ...s.presets, [id]: { ...s.presets[id], ...patch } } })),

  replacePreset: (id, full) => set((s) => ({ presets: { ...s.presets, [id]: full } })),

  createPreset: (full) =>
    set((s) => ({ presets: { ...s.presets, [full.id]: full } })),

  addBreak: (presetId, b) =>
    set((s) => ({
      presets: {
        ...s.presets,
        [presetId]: { ...s.presets[presetId], breaks: [...s.presets[presetId].breaks, b] },
      },
    })),

  updateBreak: (presetId, breakId, patch) =>
    set((s) => ({
      presets: {
        ...s.presets,
        [presetId]: {
          ...s.presets[presetId],
          breaks: s.presets[presetId].breaks.map((b) => (b.id === breakId ? { ...b, ...patch } : b)),
        },
      },
    })),

  removeBreak: (presetId, breakId) =>
    set((s) => ({
      presets: {
        ...s.presets,
        [presetId]: {
          ...s.presets[presetId],
          breaks: s.presets[presetId].breaks.filter((b) => b.id !== breakId),
        },
      },
    })),

  updateBreakPolicy: (id, patch) =>
    set((s) => ({
      breakPolicies: s.breakPolicies.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  updateClockWindowPolicy: (id, patch) =>
    set((s) => ({
      clockWindowPolicies: s.clockWindowPolicies.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    })),

  updateOvertimePolicy: (id, patch) =>
    set((s) => ({
      overtimePolicies: s.overtimePolicies.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  createBreakPolicy: (full) => set((s) => ({ breakPolicies: [...s.breakPolicies, full] })),
  createClockWindowPolicy: (full) =>
    set((s) => ({ clockWindowPolicies: [...s.clockWindowPolicies, full] })),
  createOvertimePolicy: (full) =>
    set((s) => ({ overtimePolicies: [...s.overtimePolicies, full] })),
  createExcusePolicy: (full) => set((s) => ({ excusePolicies: [...s.excusePolicies, full] })),
  createPunchCorrectionPolicy: (full) =>
    set((s) => ({ punchCorrectionPolicies: [...s.punchCorrectionPolicies, full] })),

  createTemplate: (full) => set((s) => ({ templates: { ...s.templates, [full.id]: full } })),

  upsertAssignment: ({ employeeId, date, presetId, source }) => {
    const existing = get().assignments.find((a) => a.employeeId === employeeId && a.date === date);
    const ts = tsNow();
    if (existing) {
      set((s) => ({
        assignments: s.assignments.map((a) =>
          a.id === existing.id ? { ...a, presetId, source, updatedAt: ts } : a,
        ),
      }));
    } else {
      const next: Assignment = {
        id: `a-${nanoid(6)}`,
        employeeId,
        date,
        presetId,
        source,
        createdAt: ts,
        updatedAt: ts,
      };
      set((s) => ({ assignments: [...s.assignments, next] }));
    }
  },

  removeAssignment: (employeeId, date) =>
    set((s) => ({
      assignments: s.assignments.filter((a) => !(a.employeeId === employeeId && a.date === date)),
    })),

  swapAssignments: (a, b) => {
    const list = get().assignments;
    const aIdx = list.findIndex((x) => x.employeeId === a.employeeId && x.date === a.date);
    const bIdx = list.findIndex((x) => x.employeeId === b.employeeId && x.date === b.date);
    const aPreset = aIdx >= 0 ? list[aIdx].presetId : null;
    const bPreset = bIdx >= 0 ? list[bIdx].presetId : null;
    get().upsertAssignment({
      employeeId: a.employeeId,
      date: a.date,
      presetId: bPreset,
      source: 'manual',
    });
    get().upsertAssignment({
      employeeId: b.employeeId,
      date: b.date,
      presetId: aPreset,
      source: 'manual',
    });
  },

  applyPresetToWeek: (employeeId, weekStartIso, presetId) => {
    for (let i = 0; i < 5; i++) {
      const d = new Date(weekStartIso);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      get().upsertAssignment({ employeeId, date: iso, presetId, source: 'manual' });
    }
  },

  appendAudit: (entry) =>
    set((s) => ({
      auditLog: [
        ...s.auditLog,
        { ...entry, id: `au-${nanoid(6)}`, timestamp: tsNow() } as AuditEntry,
      ],
    })),

  setDate: (iso) => set((s) => ({ ui: { ...s.ui, currentDate: iso } })),
}));
