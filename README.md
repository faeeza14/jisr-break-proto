# Jisr — Shift configuration prototype

Interactive prototype for the Jisr HR product. Demonstrates a redesigned shift configuration system with **KSA labour-law compliance** as a live, layered concern: compliance engine → reusable attendance policies → atomic shift presets → templates → scheduler.

Built with Vite + React 19 + TypeScript, Tailwind CSS, Zustand, React Router v6. No backend — all data is mock and lives in the Zustand store.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. You'll land on the **Scheduler**.

The "current date" used for compliance is hard-coded to **August 15, 2026** — mid heat-ban window, mid demo week.

## What to look at

**Scheduler** (`/settings/attendance/shifts/scheduler`) — week grid with seeded assignments for 7 employees. Construction crew cells are red-outlined because outdoor work overlaps the 12:00–15:00 heat-ban window during summer. Click any cell to open the assignment panel and see the preset picker; outdoor presets show a "! Heat ban" warning per cell. Drag a cell to move (same employee) or swap (across employees) — drops that would create a violation prompt for confirmation.

**Construction crew preset** (`/settings/attendance/shifts/presets/cc`) — the hero of the original brief. Live timeline with heat-ban band + work + violation overlays, four metrics, the compliance violation card with a **suggested fix** preview, and Apply auto-fix. Scrub the date input in the header to step outside the heat-ban window and watch the violation disappear. Save now opens a diff modal showing the change set + downstream impact + before/after compliance counts; if a save *introduces* hard violations, the modal requires a reason and routes through the override flow.

**Attendance policies** (`/settings/attendance/policies`) — 5 tabs (Overtime, Break NEW, Clock-in window NEW, Excuse, Punch correction). Click any Break row for the full editor. `+ New {kind} policy` lands on a unified type-aware form at `/settings/attendance/policies/new`.

**New template wizard** (`/settings/attendance/shifts/templates/new`) — three-step builder (Type → Details → Compose). Day, Week, and Rotation modes each have a distinct composition surface; the compliance summary card evaluates the in-progress template against the demo week so admins can see violations before saving.

## Compliance engine

`src/lib/compliance.ts` is the single source of truth for KSA rules. Each rule is a pure function `(preset, context) => Violation[]`; `evaluateCompliance` aggregates them. Rules implemented:

| Rule | Severity | Source |
|---|---|---|
| Heat ban (outdoor 12:00–15:00, Jun 15 – Sep 15) | hard | Ministerial Decision 3337 |
| Max 5h consecutive without ≥30min break | hard | Art. 101 |
| Break required when work > 5h | soft | Art. 101 |
| Daily presence ≤ 12h | hard | Art. 98 |
| Daily work cap 8h | soft | Art. 98 |
| Weekly work cap 48h | soft | Art. 98 |
| Ramadan 6h/day for observing Muslims | hard | Art. 98 |
| Friday default rest day | soft | Art. 104 |

The engine is country-aware in the data model (single switch to add UAE / Bahrain / etc.) but only KSA is surfaced in v1.

## Repo layout

```
src/
├── types.ts                 # all data-model types
├── data/seed.ts             # groups, employees, presets, policies, templates, assignments
├── data/ramadan.ts          # hard-coded 1447/1448 windows
├── lib/
│   ├── compliance.ts        # KSA rules + evaluateCompliance
│   ├── fixers.ts            # heat-ban split-shift fix
│   ├── segments.ts          # work/break segment derivation
│   ├── time.ts              # parseHHMM, fmtDuration, intersect
│   └── weekly.ts            # Sun-anchored week math
├── store/index.ts           # Zustand: presets, policies, assignments, audit log
├── components/              # shell, primitives, timeline, modals, picker cards
└── pages/                   # ShiftsLayout, SchedulerPage, PresetDetail, PoliciesPage,
                             # BreakPolicyDetail, NewPolicyPage, NewTemplatePage
```

## Smoke tests

A puppeteer-based end-to-end test lives at `scripts/smoke-e2e.mjs` and walks the canonical demo (scheduler → Construction violation → new template wizard → bulk-assign Office standard → all violations clear). Run with the dev server up:

```bash
npm run dev                       # in one terminal
node scripts/smoke-e2e.mjs        # in another
```

The Chrome path inside the scripts is hard-coded to `/Applications/Google Chrome.app/...` — adjust if you're on another platform.

## Notes for reviewers

- **Demo date** is hard-coded to Aug 15 2026 across the app. The Preset detail page has a date scrubber so reviewers can step in and out of the heat-ban window without re-seeding.
- **Sun-anchored weeks** (KSA convention). Workdays default to Sun–Thu; Fri/Sat are weekend.
- **The 5-hour consecutive rule** exits early if any flexible break ≥30min exists in the preset, on the assumption employees will time it within the window. This keeps Office standard's 1h flexible lunch compliant without forcing the engine to position flexible breaks deterministically. Adjust in `src/lib/compliance.ts` if you want stricter behaviour.
- **State is in-memory** — refreshing the page resets everything to seed.
