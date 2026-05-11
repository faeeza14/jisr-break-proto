export const RAMADAN_WINDOWS: Array<{ year: number; start: string; end: string }> = [
  { year: 1447, start: '2026-02-17', end: '2026-03-19' },
  { year: 1448, start: '2027-02-06', end: '2027-03-08' },
];

export const isRamadanDate = (d: Date): boolean => {
  const iso = d.toISOString().slice(0, 10);
  return RAMADAN_WINDOWS.some((w) => iso >= w.start && iso <= w.end);
};
