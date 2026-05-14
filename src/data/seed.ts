import type {
  Assignment,
  Employee,
  ExcusePolicy,
  Group,
  OvertimePolicy,
  PunchCorrectionPolicy,
  ShiftPreset,
  ShiftTemplate,
} from '../types';

export const groups: Group[] = [
  { id: 'g1', name: 'Operations · Field', employeeCount: 24 },
  { id: 'g2', name: 'Office · Riyadh', employeeCount: 87 },
  { id: 'g3', name: 'Manufacturing · Dammam', employeeCount: 32 },
  { id: 'g4', name: 'Retail · Mall locations', employeeCount: 45 },
];

// R1 — break + clocking config is inlined directly onto ShiftPreset (no reusable
// BreakPolicy or ClockWindowPolicy entities). The shared values below are kept
// as constants for seed convenience.

const FIELD_CLOCKING = {
  clockInWindowStart: '09:00',
  clockInWindowEnd: '12:00',
  clockOutWindowStart: '16:00',
  clockOutWindowEnd: '22:00',
  clockInGraceMinutes: 5,
  allowedShortageMinutes: 120,
  geofenceRequired: true,
  geofenceRadiusMeters: 100,
  ipRestricted: false,
} as const;

const OFFICE_CLOCKING = {
  clockInWindowStart: '08:00',
  clockInWindowEnd: '10:00',
  clockOutWindowStart: '17:00',
  clockOutWindowEnd: '19:00',
  clockInGraceMinutes: 15,
  allowedShortageMinutes: 60,
  geofenceRequired: false,
  ipRestricted: true,
} as const;

export const overtimePolicies: OvertimePolicy[] = [
  {
    id: 'ot1',
    type: 'overtime',
    name: 'KSA construction OT',
    description: 'Pre-approved overtime for construction crews under KSA labour law.',
    paidRate: 1.5,
    holidayRate: 2.0,
    timeOffInLieuRate: 0.25,
    preApprovalRequired: true,
    autoOvertimeAfterMinutes: 30,
    appliesTo: { groupIds: ['g1'], employeeCount: 24 },
  },
  {
    id: 'ot2',
    type: 'overtime',
    name: 'Standard salaried OT',
    description: 'Default OT rates for salaried roles, with auto-OT after one hour.',
    paidRate: 1.5,
    holidayRate: 2.0,
    timeOffInLieuRate: 0.25,
    preApprovalRequired: false,
    autoOvertimeAfterMinutes: 60,
    appliesTo: { groupIds: ['g2', 'g3', 'g4'], employeeCount: 164 },
  },
];

export const excusePolicies: ExcusePolicy[] = [
  {
    id: 'ex1',
    type: 'excuse',
    name: 'Default excuse policy',
    description: 'Three approved excuses per month, manager approval required.',
    approvalRequired: true,
    maxPerMonth: 3,
    appliesTo: { groupIds: ['g1', 'g2', 'g3', 'g4'], employeeCount: 188 },
  },
];

export const punchCorrectionPolicies: PunchCorrectionPolicy[] = [
  {
    id: 'pc1',
    type: 'punch_correction',
    name: 'Default punch correction',
    description: 'Up to five missed-punch corrections per month with approval.',
    approvalRequired: true,
    maxPerMonth: 5,
    appliesTo: { groupIds: ['g1', 'g2', 'g3', 'g4'], employeeCount: 188 },
  },
];

export const shiftPresets: ShiftPreset[] = [
  {
    id: 'cc',
    nameEn: 'Construction crew',
    nameAr: 'طاقم البناء',
    color: '#D58A2F',
    workEnvironment: 'outdoor',
    startTime: '08:00',
    workDurationMinutes: 510,
    breaks: [
      {
        id: 'bk-cc-1',
        name: 'Lunch',
        scheduleType: 'fixed',
        fixedTime: '12:00',
        durationMinutes: 30,
        paid: 'unpaid',
        countTowardWorkHours: false,
        autoMandatePaidDuringHeatBan: true,
        forceBreakAfter5h: true,
      },
    ],
    ...FIELD_CLOCKING,
    overtimePolicyId: 'ot1',
    usedInTemplateIds: ['t1', 't4'],
  },
  {
    id: 'os',
    nameEn: 'Office standard',
    nameAr: 'المكتب القياسي',
    color: '#2F9C95',
    workEnvironment: 'indoor',
    startTime: '09:00',
    workDurationMinutes: 480,
    breaks: [
      {
        id: 'bk-os-1',
        name: 'Lunch',
        scheduleType: 'flexible',
        flexibleWindow: { start: '12:00', end: '14:00' },
        durationMinutes: 60,
        paid: 'unpaid',
        countTowardWorkHours: false,
        autoMandatePaidDuringHeatBan: false,
        forceBreakAfter5h: true,
      },
    ],
    ...OFFICE_CLOCKING,
    overtimePolicyId: 'ot2',
    usedInTemplateIds: ['t2', 't3'],
  },
  {
    id: 'rm',
    nameEn: 'Retail morning',
    nameAr: 'البيع بالتجزئة صباحاً',
    color: '#C26B7E',
    workEnvironment: 'indoor',
    startTime: '10:00',
    workDurationMinutes: 360,
    breaks: [],
    ...OFFICE_CLOCKING,
    overtimePolicyId: 'ot2',
    usedInTemplateIds: ['t3'],
  },
  {
    id: 'mh',
    nameEn: 'Manufacturing hybrid',
    nameAr: 'تصنيع هجين',
    color: '#3B7A57',
    workEnvironment: 'indoor',
    startTime: '07:00',
    workDurationMinutes: 480,
    breaks: [
      {
        id: 'bk-mh-1',
        name: 'Tea break',
        scheduleType: 'fixed',
        fixedTime: '10:00',
        durationMinutes: 15,
        paid: 'mixed',
        countTowardWorkHours: false,
        autoMandatePaidDuringHeatBan: true,
        forceBreakAfter5h: true,
      },
      {
        id: 'bk-mh-2',
        name: 'Lunch',
        scheduleType: 'flexible',
        flexibleWindow: { start: '12:00', end: '14:00' },
        durationMinutes: 30,
        paid: 'mixed',
        countTowardWorkHours: false,
        autoMandatePaidDuringHeatBan: true,
        forceBreakAfter5h: true,
      },
    ],
    ...FIELD_CLOCKING,
    overtimePolicyId: 'ot2',
    usedInTemplateIds: ['t4'],
  },
  {
    id: 'nm',
    nameEn: 'Night maintenance',
    nameAr: 'صيانة ليلية',
    color: '#6B5BD4',
    workEnvironment: 'mixed',
    startTime: '22:00',
    workDurationMinutes: 480,
    breaks: [
      {
        id: 'bk-nm-1',
        name: 'Mid-shift break',
        scheduleType: 'anchored',
        anchoredOffsetMinutes: 240,
        durationMinutes: 30,
        paid: 'mixed',
        countTowardWorkHours: false,
        autoMandatePaidDuringHeatBan: true,
        forceBreakAfter5h: true,
      },
    ],
    ...FIELD_CLOCKING,
    overtimePolicyId: 'ot2',
    usedInTemplateIds: ['t4'],
  },

  // ──────────────────────────────────────────────────────────────────
  // 🧪 Edge-case demo presets — each is purpose-built to trigger a specific
  // compliance / scheduling corner case for the EdgeCasesGallery showcase.
  // They live alongside the 5 realistic presets above so the gallery can
  // deep-link into the regular PresetDetail editor.
  // ──────────────────────────────────────────────────────────────────

  // 1) Cross-day night shift — exercises minute-math + display-wrap past midnight.
  {
    id: 'edge-cross-day',
    nameEn: '🧪 Demo · Night cross-day',
    nameAr: 'عرض · مناوبة ليلية تتجاوز منتصف الليل',
    color: '#1F4F8E',
    workEnvironment: 'mixed',
    startTime: '22:00',
    workDurationMinutes: 480, // 8h — ends 06:00 next day
    breaks: [
      {
        id: 'bk-edge-cd-1',
        name: 'Mid-shift break',
        scheduleType: 'anchored',
        anchoredOffsetMinutes: 240, // lands at 02:00 next day
        durationMinutes: 30,
        paid: 'paid',
        countTowardWorkHours: false,
        autoMandatePaidDuringHeatBan: false,
        forceBreakAfter5h: true,
      },
    ],
    ...FIELD_CLOCKING,
    overtimePolicyId: 'ot2',
    usedInTemplateIds: [],
  },

  // 2) Heat-ban collision — outdoor crew with the 30m break placed before
  //    the heat ban window, so work runs 12:30–15:00 inside the 12:00–15:00
  //    ban → hard `ksa.heat_ban` violation.
  {
    id: 'edge-heat-ban',
    nameEn: '🧪 Demo · Heat-ban collision',
    nameAr: 'عرض · تعارض مع حظر العمل في الحر',
    color: '#D7991F',
    workEnvironment: 'outdoor',
    startTime: '09:00',
    workDurationMinutes: 480, // 8h, ends 17:30 with 30m break
    breaks: [
      {
        id: 'bk-edge-hb-1',
        name: 'Lunch',
        scheduleType: 'fixed',
        fixedTime: '12:00',
        durationMinutes: 30,
        paid: 'unpaid',
        countTowardWorkHours: false,
        autoMandatePaidDuringHeatBan: false, // intentionally off — surfaces the violation
        forceBreakAfter5h: true,
      },
    ],
    ...FIELD_CLOCKING,
    overtimePolicyId: 'ot1',
    usedInTemplateIds: [],
  },

  // 3) Art. 101 5h-no-break — long shift with the break placed too late;
  //    7 hours of continuous work before the first break → hard
  //    `ksa.consecutive_5h` violation.
  {
    id: 'edge-art101',
    nameEn: '🧪 Demo · 5h continuous work',
    nameAr: 'عرض · 5 ساعات عمل متواصلة',
    color: '#A32314',
    workEnvironment: 'indoor',
    startTime: '08:00',
    workDurationMinutes: 540, // 9h, with one 30m break
    breaks: [
      {
        id: 'bk-edge-101-1',
        name: 'Lunch',
        scheduleType: 'fixed',
        fixedTime: '15:00', // 7h after start — too late
        durationMinutes: 30,
        paid: 'unpaid',
        countTowardWorkHours: false,
        autoMandatePaidDuringHeatBan: false,
        forceBreakAfter5h: true,
      },
    ],
    ...OFFICE_CLOCKING,
    overtimePolicyId: 'ot2',
    usedInTemplateIds: [],
  },

  // 4) 12h presence cap — 12h work + 90m lunch = 13.5h total presence,
  //    exceeds Art. 98 → hard `ksa.presence_12h` violation.
  {
    id: 'edge-12h',
    nameEn: '🧪 Demo · 12h+ presence cap',
    nameAr: 'عرض · تجاوز سقف الحضور 12 ساعة',
    color: '#7A2D6B',
    workEnvironment: 'indoor',
    startTime: '06:00',
    workDurationMinutes: 720, // 12h work
    breaks: [
      {
        id: 'bk-edge-12-1',
        name: 'Lunch',
        scheduleType: 'fixed',
        fixedTime: '12:00',
        durationMinutes: 90, // pushes presence to 13.5h
        paid: 'unpaid',
        countTowardWorkHours: false,
        autoMandatePaidDuringHeatBan: false,
        forceBreakAfter5h: true,
      },
    ],
    // Custom clocking — early start needs an earlier clock-in window
    clockInWindowStart: '05:30',
    clockInWindowEnd: '07:00',
    clockOutWindowStart: '19:00',
    clockOutWindowEnd: '21:00',
    clockInGraceMinutes: 10,
    allowedShortageMinutes: 60,
    geofenceRequired: false,
    ipRestricted: true,
    overtimePolicyId: 'ot2',
    usedInTemplateIds: [],
  },
];

export const templates: ShiftTemplate[] = [
  {
    id: 't1',
    name: 'Construction full day',
    type: 'day',
    daysOfWeek: [0, 1, 2, 3, 4],
    dayPresetId: 'cc',
  },
  {
    id: 't2',
    name: 'Office Sun–Thu',
    type: 'week',
    daysOfWeek: [0, 1, 2, 3, 4],
    weekDays: ['os', 'os', 'os', 'os', 'os', null, null],
  },
  {
    id: 't3',
    name: 'Reception split week',
    type: 'week',
    daysOfWeek: [0, 1, 2, 3, 4],
    weekDays: ['rm', 'rm', 'rm', 'rm', 'os', null, null],
  },
  {
    id: 't4',
    name: 'Maintenance 2-week rotation',
    type: 'rotation',
    daysOfWeek: [0, 1, 2, 3, 4],
    rotationStartDate: '2026-08-09',
    rotationWeeks: [
      { dayPresetIds: ['mh', 'mh', 'mh', 'mh', 'mh', null, null] },
      { dayPresetIds: ['nm', 'nm', 'nm', 'nm', 'nm', null, null] },
    ],
  },
];

export const employees: Employee[] = [
  { id: 'e1', name: 'Ahmad Al-Saud', role: 'Crew lead', groupId: 'g1', observesRamadan: true },
  { id: 'e2', name: 'Salem Faraj', role: 'Site engineer', groupId: 'g1', observesRamadan: true },
  { id: 'e3', name: 'Yousef Al-Otaibi', role: 'Foreman', groupId: 'g1', observesRamadan: true },
  { id: 'e4', name: 'Layla Hassan', role: 'Office manager', groupId: 'g2', observesRamadan: false },
  { id: 'e5', name: 'Reem Al-Qadi', role: 'Accountant', groupId: 'g2', observesRamadan: true },
  { id: 'e6', name: 'Khalid Mansour', role: 'Line supervisor', groupId: 'g3', observesRamadan: true },
  { id: 'e7', name: 'Nora Al-Harbi', role: 'Store associate', groupId: 'g4', observesRamadan: true },
];

const buildAssignments = (): Assignment[] => {
  const result: Assignment[] = [];
  const now = '2026-08-09T00:00:00Z';
  const weekStart = new Date('2026-08-09');
  const dayPlan: Array<{ employeeId: string; presetId: string | null }> = [
    { employeeId: 'e1', presetId: 'cc' },
    { employeeId: 'e2', presetId: 'cc' },
    { employeeId: 'e3', presetId: 'cc' },
    { employeeId: 'e4', presetId: 'os' },
    { employeeId: 'e5', presetId: 'os' },
    { employeeId: 'e6', presetId: 'mh' },
    { employeeId: 'e7', presetId: 'rm' },
  ];
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + dayOffset);
    const iso = d.toISOString().slice(0, 10);
    const isWeekend = dayOffset >= 5;
    for (const plan of dayPlan) {
      result.push({
        id: `a-${plan.employeeId}-${iso}`,
        employeeId: plan.employeeId,
        date: iso,
        presetId: isWeekend ? null : plan.presetId,
        source: 'template',
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  return result;
};

export const assignments: Assignment[] = buildAssignments();
