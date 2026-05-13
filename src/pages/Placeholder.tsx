import { CalendarClock } from 'lucide-react';
import { Empty } from '@jisr-hr/ds-web';

export const Placeholder = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="p-6 sm:p-8 max-w-3xl">
    <Empty
      media={<CalendarClock className="size-6" />}
      title={title}
      description={subtitle}
    />
  </div>
);
