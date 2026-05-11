import { evaluateCompliance } from '../src/lib/compliance';
import { deriveSchedule } from '../src/lib/segments';
import { breakPolicies, shiftPresets } from '../src/data/seed';
import { fmtHHMM } from '../src/lib/time';
import { heatBanFix } from '../src/lib/fixers';

const construction = shiftPresets.find((p) => p.id === 'cc')!;

console.log('--- Construction crew baseline (Aug 15 2026) ---');
const aug15 = new Date('2026-08-15');
const r1 = evaluateCompliance({
  preset: construction,
  breakPolicies,
  context: { currentDate: aug15, country: 'SA' },
});
console.log('Status:', r1.status);
for (const v of r1.violations) {
  console.log(`  ${v.ruleId} [${v.severity}]: ${v.message}`);
  if (v.affectedTimeRange) console.log(`    range: ${v.affectedTimeRange.start}–${v.affectedTimeRange.end}`);
}

const sched = deriveSchedule(construction, breakPolicies);
console.log('Segments:');
for (const s of sched.segments) {
  console.log(`  ${s.kind} ${fmtHHMM(s.start)}–${fmtHHMM(s.end)}`);
}

console.log('\n--- After heatBanFix ---');
const fixed = heatBanFix(construction);
console.log('Start:', fixed.startTime, 'Breaks:', fixed.breaks.map((b) => `${b.name} ${b.fixedTime}+${b.durationMinutes}m`));
const r2 = evaluateCompliance({
  preset: fixed,
  breakPolicies,
  context: { currentDate: aug15, country: 'SA' },
});
console.log('Status after fix:', r2.status);
for (const v of r2.violations) {
  console.log(`  ${v.ruleId} [${v.severity}]: ${v.message}`);
}
const sched2 = deriveSchedule(fixed, breakPolicies);
console.log('Fixed segments:');
for (const s of sched2.segments) {
  console.log(`  ${s.kind} ${fmtHHMM(s.start)}–${fmtHHMM(s.end)}`);
}
console.log(`Fixed end: ${fmtHHMM(sched2.endMin)} | presence: ${sched2.presenceMin / 60}h`);

console.log('\n--- Off-season (Oct 15 2026) ---');
const oct15 = new Date('2026-10-15');
const r3 = evaluateCompliance({
  preset: construction,
  breakPolicies,
  context: { currentDate: oct15, country: 'SA' },
});
console.log('Status:', r3.status);
for (const v of r3.violations) {
  console.log(`  ${v.ruleId} [${v.severity}]: ${v.message}`);
}

console.log('\n--- Indoor variant on Aug 15 ---');
const indoor = { ...construction, workEnvironment: 'indoor' as const };
const r4 = evaluateCompliance({
  preset: indoor,
  breakPolicies,
  context: { currentDate: aug15, country: 'SA' },
});
console.log('Status:', r4.status);
for (const v of r4.violations) {
  console.log(`  ${v.ruleId} [${v.severity}]: ${v.message}`);
}

console.log('\n--- Start at 14:00 outdoor on Aug 15 ---');
const lateStart = { ...construction, startTime: '14:00' };
const r5 = evaluateCompliance({
  preset: lateStart,
  breakPolicies,
  context: { currentDate: aug15, country: 'SA' },
});
console.log('Status:', r5.status);
for (const v of r5.violations) {
  console.log(`  ${v.ruleId} [${v.severity}]: ${v.message}`);
  if (v.affectedTimeRange) console.log(`    range: ${v.affectedTimeRange.start}–${v.affectedTimeRange.end}`);
}

console.log('\n--- Ramadan rule for Muslim profile (Mar 1 2026) ---');
const r6 = evaluateCompliance({
  preset: construction,
  breakPolicies,
  context: {
    currentDate: new Date('2026-03-01'),
    country: 'SA',
    employeeProfile: { id: 'e1', name: 'Khalid', groupId: 'g1', observesRamadan: true },
  },
});
for (const v of r6.violations) {
  console.log(`  ${v.ruleId} [${v.severity}]: ${v.message}`);
}
