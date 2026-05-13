/**
 * DS shim — mirrors @jisr-hr/ds-web Calendar API.
 * Source: Figma — Wasl DS / Molecules / Calendar (canvas 105:5)
 *
 * Spec from Figma (structure):
 *   Calendar (componentSet 12861:24637)
 *     └ Months wrapper
 *         ├ Navigation (Previous / Next, absolute)
 *         └ Month
 *             ├ MonthCaption (captionLayout: label | dropdown | dropdown-month | dropdown-years)
 *             └ MonthGrid
 *                 ├ TableHead → WeekDays
 *                 └ TableBody → Week → DayButton
 *
 * Subcomponents in Figma:
 *   [Calendar] DayButton (12861:25376) — variants for state (default/today/
 *     selected/range-start/range-end/range-middle/disabled/outside)
 *   [Calendar] DayButtonRange (12861:25401) — range visual variants
 *   _CaptionLayout (12861:25458) — label | dropdown | dropdown-month | dropdown-years
 *   _WeekDay — Sa..Su label
 *   [Pattern] CalendarPopover (12861:25371) — Calendar inside Popover pattern
 *
 * Per Figma: "In MVP, dropdowns are sourced directly from ShadCN. We currently
 * do not have a dedicated Select subcomponent." Note kept for fidelity.
 *
 * API mirrors react-day-picker / ShadCN:
 *   <Calendar
 *     mode="single"            // single | range
 *     selected={date}
 *     onSelect={setDate}
 *     captionLayout="label"    // label | dropdown
 *     fromYear={2020} toYear={2030}
 *     disabled={(d) => d.getDay() === 5}
 *   />
 */
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CaptionLayout = 'label' | 'dropdown';

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface BaseCalendarProps {
  /** Initial month displayed; defaults to current month */
  defaultMonth?: Date;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  captionLayout?: CaptionLayout;
  fromYear?: number;
  toYear?: number;
  /** Disable specific dates */
  disabled?: (date: Date) => boolean;
  /** Locale, defaults to 'en-US' */
  locale?: string;
  /** Day shown as the start of the week (0 = Sunday, 1 = Monday) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

interface SingleCalendarProps extends BaseCalendarProps {
  mode?: 'single';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

interface RangeCalendarProps extends BaseCalendarProps {
  mode: 'range';
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
}

type CalendarProps = SingleCalendarProps | RangeCalendarProps;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isInRange = (date: Date, range: DateRange) => {
  if (!range.from || !range.to) return false;
  return date >= range.from && date <= range.to;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};

const monthDays = (year: number, month: number, weekStartsOn: number) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = (first.getDay() - weekStartsOn + 7) % 7;
  const totalDays = last.getDate();

  const grid: Array<{ date: Date; outside: boolean }> = [];
  // Previous month padding
  for (let i = startWeekday; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    grid.push({ date: d, outside: true });
  }
  // Current month
  for (let i = 1; i <= totalDays; i++) {
    grid.push({ date: new Date(year, month, i), outside: false });
  }
  // Next month padding to 6 rows × 7 cols = 42
  while (grid.length < 42) {
    const next = new Date(year, month, totalDays + (grid.length - startWeekday - totalDays + 1));
    grid.push({ date: next, outside: true });
  }
  return grid;
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Calendar = (props: CalendarProps) => {
  const {
    captionLayout = 'label',
    fromYear = new Date().getFullYear() - 5,
    toYear = new Date().getFullYear() + 5,
    disabled,
    locale = 'en-US',
    weekStartsOn = 0,
    className = '',
    defaultMonth,
    month: controlledMonth,
    onMonthChange,
  } = props;

  const today = useMemo(() => startOfDay(new Date()), []);

  const [uncontrolledMonth, setUncontrolledMonth] = useState<Date>(
    defaultMonth ?? (props.mode === 'range' && props.selected?.from
      ? props.selected.from
      : props.mode !== 'range' && props.selected
        ? props.selected
        : today),
  );

  const month = controlledMonth ?? uncontrolledMonth;
  const setMonth = (m: Date) => {
    if (!controlledMonth) setUncontrolledMonth(m);
    onMonthChange?.(m);
  };

  const days = useMemo(
    () => monthDays(month.getFullYear(), month.getMonth(), weekStartsOn),
    [month, weekStartsOn],
  );

  const weekDayLabels = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      arr.push(WEEKDAY_LABELS[(weekStartsOn + i) % 7]);
    }
    return arr;
  }, [weekStartsOn]);

  const onDayClick = (d: Date) => {
    if (disabled?.(d)) return;
    if (props.mode === 'range') {
      const cur = props.selected;
      if (!cur || (cur.from && cur.to)) {
        props.onSelect?.({ from: d, to: undefined });
      } else if (cur.from && !cur.to) {
        if (d < cur.from) {
          props.onSelect?.({ from: d, to: cur.from });
        } else {
          props.onSelect?.({ from: cur.from, to: d });
        }
      }
    } else {
      const isSame = props.selected && isSameDay(props.selected, d);
      props.onSelect?.(isSame ? undefined : d);
    }
  };

  const dayState = (d: Date, outside: boolean) => {
    const isToday = isSameDay(d, today);
    const isDisabled = disabled?.(d) ?? false;
    let selected: 'none' | 'single' | 'range-start' | 'range-end' | 'range-middle' = 'none';
    if (props.mode === 'range' && props.selected) {
      const { from, to } = props.selected;
      if (from && isSameDay(d, from)) selected = to ? 'range-start' : 'single';
      else if (to && isSameDay(d, to)) selected = 'range-end';
      else if (from && to && isInRange(d, { from, to })) selected = 'range-middle';
    } else if (props.mode !== 'range' && props.selected && isSameDay(d, props.selected)) {
      selected = 'single';
    }
    return { isToday, isDisabled, outside, selected };
  };

  const dayCls = (state: ReturnType<typeof dayState>) => {
    const base =
      'inline-flex items-center justify-center size-8 text-13 select-none transition-colors';
    if (state.isDisabled) return `${base} opacity-30 cursor-not-allowed`;

    let bg = '';
    let radius = 'rounded-md';
    if (state.selected === 'single') {
      bg = 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-bg-dark font-medium';
      radius = 'rounded-md';
    } else if (state.selected === 'range-start') {
      bg = 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-bg-dark font-medium';
      radius = 'rounded-l-md rounded-r-none';
    } else if (state.selected === 'range-end') {
      bg = 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-bg-dark font-medium';
      radius = 'rounded-r-md rounded-l-none';
    } else if (state.selected === 'range-middle') {
      bg = 'bg-app-subtle dark:bg-app-subtle-dark';
      radius = 'rounded-none';
    } else {
      bg = state.outside
        ? 'text-app-faint dark:text-app-faint-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark'
        : 'text-app-ink dark:text-app-ink-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark';
    }

    const todayRing = state.isToday && state.selected === 'none' ? 'ring-1 ring-app-ink/40' : '';
    return [base, bg, radius, todayRing, 'cursor-pointer'].filter(Boolean).join(' ');
  };

  const captionText = month.toLocaleString(locale, { month: 'long', year: 'numeric' });
  const years = useMemo(() => {
    const out = [];
    for (let y = fromYear; y <= toYear; y++) out.push(y);
    return out;
  }, [fromYear, toYear]);

  return (
    <div
      className={[
        'inline-block p-3 rounded-lg bg-white dark:bg-app-card-dark hairline',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Caption + Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setMonth(addMonths(month, -1))}
          className="size-7 inline-flex items-center justify-center rounded-md hover:bg-app-surface dark:hover:bg-app-subtle-dark text-app-mute"
        >
          <ChevronLeft className="size-4" />
        </button>
        {captionLayout === 'label' ? (
          <div className="text-13 font-medium text-app-ink dark:text-app-ink-dark">
            {captionText}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <select
              value={month.getMonth()}
              onChange={(e) => {
                const m = new Date(month);
                m.setMonth(Number(e.target.value));
                setMonth(m);
              }}
              className="text-13 font-medium bg-transparent focus:outline-none cursor-pointer rounded px-1 hover:bg-app-surface dark:hover:bg-app-subtle-dark"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {new Date(2000, i, 1).toLocaleString(locale, { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={month.getFullYear()}
              onChange={(e) => {
                const m = new Date(month);
                m.setFullYear(Number(e.target.value));
                setMonth(m);
              }}
              className="text-13 font-medium bg-transparent focus:outline-none cursor-pointer rounded px-1 hover:bg-app-surface dark:hover:bg-app-subtle-dark"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMonth(addMonths(month, 1))}
          className="size-7 inline-flex items-center justify-center rounded-md hover:bg-app-surface dark:hover:bg-app-subtle-dark text-app-mute"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-y-1 mb-1">
        {weekDayLabels.map((wd) => (
          <div
            key={wd}
            className="size-8 inline-flex items-center justify-center text-11 font-medium text-app-faint dark:text-app-faint-dark uppercase"
          >
            {wd.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map(({ date, outside }) => {
          const state = dayState(date, outside);
          return (
            <button
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              type="button"
              disabled={state.isDisabled}
              onClick={() => onDayClick(date)}
              className={dayCls(state)}
              aria-pressed={state.selected !== 'none'}
              aria-current={state.isToday ? 'date' : undefined}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
