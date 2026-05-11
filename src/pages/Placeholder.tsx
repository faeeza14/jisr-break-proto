import { CalendarClock } from 'lucide-react';

export const Placeholder = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="p-6 sm:p-8 max-w-3xl">
    <div className="rounded-card bg-white dark:bg-app-card-dark hairline p-8 text-center">
      <div className="mx-auto size-10 rounded-full bg-app-subtle dark:bg-app-subtle-dark inline-flex items-center justify-center mb-3">
        <CalendarClock className="size-5 text-app-faint" />
      </div>
      <h2 className="text-13 font-medium">{title}</h2>
      <p className="mt-1 text-13 text-app-mute dark:text-app-mute-dark">{subtitle}</p>
    </div>
  </div>
);
