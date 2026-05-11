// Sunday-anchored week math (KSA convention).
// Days: 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat. Workdays default to Sun–Thu (0..4), weekend = Fri/Sat (5,6).

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const isoDay = (d: Date): string => {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
};

export const parseIsoLocal = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const startOfSundayWeek = (d: Date): Date => {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - out.getDay());
  return out;
};

export const addDays = (d: Date, n: number): Date => {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
};

export const eachDayInWeek = (weekStart: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

export const isWeekend = (d: Date): boolean => d.getDay() === 5 || d.getDay() === 6;

export const fmtMonShort = (d: Date): string =>
  d.toLocaleString('en-US', { month: 'short' });

export const fmtWeekRange = (weekStart: Date): string => {
  const end = addDays(weekStart, 6);
  return `Week of ${fmtMonShort(weekStart)} ${weekStart.getDate()} – ${fmtMonShort(end)} ${end.getDate()}, ${end.getFullYear()}`;
};
