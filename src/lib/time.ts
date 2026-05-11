export const parseHHMM = (s: string): number => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

export const fmtHHMM = (mins: number): string => {
  const m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${String(h).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

export const fmt12h = (mins: number): string => {
  const m = ((mins % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const r = m % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = ((h24 + 11) % 12) + 1;
  return `${String(h12).padStart(2, '0')}:${String(r).padStart(2, '0')} ${period}`;
};

export const fmtDuration = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

export type Span = { start: number; end: number };

export const intersect = (a: Span, b: Span): Span | null => {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  return end > start ? { start, end } : null;
};

export const heatBanSpan: Span = { start: 12 * 60, end: 15 * 60 };

const isInDateRange = (d: Date, monthStart: number, dayStart: number, monthEnd: number, dayEnd: number) => {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m < monthStart || m > monthEnd) return false;
  if (m === monthStart && day < dayStart) return false;
  if (m === monthEnd && day > dayEnd) return false;
  return true;
};

export const isHeatBanDate = (d: Date): boolean => isInDateRange(d, 6, 15, 9, 15);
