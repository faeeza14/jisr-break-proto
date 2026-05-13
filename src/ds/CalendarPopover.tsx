/**
 * DS shim — mirrors @jisr-hr/ds-web [Pattern] CalendarPopover.
 * Source: Figma — Wasl DS / Molecules / Calendar (component 12861:25371)
 *
 * Per Figma: "This component is a combination of existing components;
 * Calendar × Popover; We've combined them together and created it as a
 * pattern component to ensure consistency in design usage and application."
 *
 * Usage:
 *   <CalendarPopover
 *     value={date}
 *     onChange={setDate}
 *     placeholder="Pick a date"
 *   />
 *
 *   <CalendarPopover
 *     mode="range"
 *     value={range}
 *     onChange={setRange}
 *   />
 */
import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Calendar, type DateRange } from './Calendar';

interface BaseProps {
  placeholder?: string;
  disabled?: boolean;
  /** Function to disable specific dates */
  isDateDisabled?: (date: Date) => boolean;
  className?: string;
  locale?: string;
  size?: 'sm' | 'md';
}

interface SingleProps extends BaseProps {
  mode?: 'single';
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

interface RangeProps extends BaseProps {
  mode: 'range';
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

type CalendarPopoverProps = SingleProps | RangeProps;

const fmt = (d: Date, locale: string) =>
  d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });

const formatValue = (props: CalendarPopoverProps): string => {
  const locale = props.locale ?? 'en-US';
  if (props.mode === 'range') {
    if (!props.value?.from && !props.value?.to) return '';
    if (props.value?.from && props.value?.to)
      return `${fmt(props.value.from, locale)} – ${fmt(props.value.to, locale)}`;
    if (props.value?.from) return `${fmt(props.value.from, locale)} – …`;
    return '';
  }
  return props.value ? fmt(props.value, locale) : '';
};

export const CalendarPopover = (props: CalendarPopoverProps) => {
  const [open, setOpen] = useState(false);
  const text = formatValue(props);
  const sizeCls = props.size === 'sm' ? 'h-8 text-13' : 'h-9 text-13';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={[
          'w-full inline-flex items-center gap-2 rounded-lg hairline bg-white dark:bg-app-card-dark px-3 text-left',
          sizeCls,
          props.disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-app-surface dark:hover:bg-app-subtle-dark cursor-pointer',
          props.className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={props.disabled}
      >
        <CalendarIcon className="size-3.5 text-app-mute" />
        <span
          className={text ? 'text-app-ink dark:text-app-ink-dark' : 'text-app-faint'}
        >
          {text || props.placeholder || 'Pick a date'}
        </span>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" maxWidth={360}>
        {props.mode === 'range' ? (
          <Calendar
            mode="range"
            selected={props.value}
            onSelect={(r) => {
              props.onChange?.(r);
              if (r?.from && r?.to) setOpen(false);
            }}
            disabled={props.isDateDisabled}
            locale={props.locale}
            captionLayout="dropdown"
          />
        ) : (
          <Calendar
            mode="single"
            selected={props.value}
            onSelect={(d) => {
              props.onChange?.(d);
              setOpen(false);
            }}
            disabled={props.isDateDisabled}
            locale={props.locale}
            captionLayout="dropdown"
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
