export type WorkEnvironment = 'indoor' | 'outdoor' | 'mixed';
export type BreakScheduleType = 'fixed' | 'flexible' | 'anchored';
export type ViolationSeverity = 'hard' | 'soft';

export type Group = {
  id: string;
  name: string;
  employeeCount: number;
};

export type EmployeeProfile = {
  id: string;
  name: string;
  groupId: string;
  observesRamadan: boolean;
};

// R1 — break time is fully inline on the shift preset (no reusable BreakPolicy).
export type BreakInstance = {
  id: string;
  name: string;
  scheduleType: BreakScheduleType;
  fixedTime?: string;
  flexibleWindow?: { start: string; end: string };
  anchoredOffsetMinutes?: number;
  durationMinutes: number;
  // Behaviour fields previously read from BreakPolicy:
  paid: 'paid' | 'unpaid' | 'mixed';
  countTowardWorkHours: boolean;
  autoMandatePaidDuringHeatBan: boolean;
  forceBreakAfter5h: boolean;
};

// R1 — clocking rules live directly on the shift preset (no ClockWindowPolicy).
export type ShiftPreset = {
  id: string;
  nameEn: string;
  nameAr: string;
  color: string;
  workEnvironment: WorkEnvironment;
  startTime: string;
  workDurationMinutes: number;
  breaks: BreakInstance[];
  // Inline clocking rules (formerly ClockWindowPolicy):
  clockInWindowStart: string;
  clockInWindowEnd: string;
  clockOutWindowStart: string;
  clockOutWindowEnd: string;
  clockInGraceMinutes: number;
  allowedShortageMinutes: number;
  geofenceRequired: boolean;
  geofenceRadiusMeters?: number;
  ipRestricted: boolean;
  // Still reusable:
  overtimePolicyId: string;
  usedInTemplateIds: string[];
};

export type TemplateType = 'day' | 'week' | 'rotation';

export type ShiftTemplate = {
  id: string;
  name: string;
  type: TemplateType;
  daysOfWeek: number[];
  dayPresetId?: string;
  weekDays?: (string | null)[];
  rotationWeeks?: { dayPresetIds: (string | null)[] }[];
  rotationStartDate?: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  groupId: string;
  observesRamadan: boolean;
  defaultTemplateId?: string;
};

export type Assignment = {
  id: string;
  employeeId: string;
  date: string;
  presetId: string | null;
  source: 'manual' | 'template';
  templateId?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuditEntry = {
  id: string;
  entityType: 'preset' | 'template' | 'policy' | 'assignment';
  entityId: string;
  userId: string;
  userName: string;
  action: 'create' | 'edit' | 'delete' | 'override';
  diff: { field: string; before: unknown; after: unknown }[];
  complianceImpact?: { before: number; after: number };
  reason?: string;
  timestamp: string;
};

export type AttendancePolicyBase = {
  id: string;
  name: string;
  description?: string;
  appliesTo: { groupIds: string[]; employeeCount: number };
};

export type OvertimePolicy = AttendancePolicyBase & {
  type: 'overtime';
  paidRate: number;
  holidayRate: number;
  timeOffInLieuRate: number;
  preApprovalRequired: boolean;
  autoOvertimeAfterMinutes: number | null;
};

// R1 — BreakPolicy + ClockWindowPolicy removed (now inline on ShiftPreset/BreakInstance).

export type ExcusePolicy = AttendancePolicyBase & {
  type: 'excuse';
  approvalRequired: boolean;
  maxPerMonth: number;
};

export type PunchCorrectionPolicy = AttendancePolicyBase & {
  type: 'punch_correction';
  approvalRequired: boolean;
  maxPerMonth: number;
};

export type AttendancePolicy =
  | OvertimePolicy
  | ExcusePolicy
  | PunchCorrectionPolicy;

export type Violation = {
  ruleId: string;
  severity: ViolationSeverity;
  message: string;
  citation: string;
  affectedTimeRange?: { start: string; end: string };
  suggestedFix?: ShiftPreset;
};

export type ComplianceContext = {
  currentDate: Date;
  country: 'SA';
  employeeProfile?: EmployeeProfile;
};

export type ComplianceStatus = 'green' | 'amber' | 'red';

export type ComplianceResult = {
  violations: Violation[];
  status: ComplianceStatus;
};
