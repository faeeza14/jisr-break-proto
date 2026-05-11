import { Check } from 'lucide-react';

type Step = { id: string; label: string };

export const StepIndicator = ({
  steps,
  current,
}: {
  steps: Step[];
  current: number;
}) => (
  <div className="flex items-center gap-2 flex-wrap">
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={s.id} className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center size-5 rounded-full text-11 font-medium ${
              done
                ? 'bg-ok-bg text-ok-ink dark:bg-ok-bg-dark dark:text-ok-ink-dark'
                : active
                  ? 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-ink'
                  : 'bg-app-subtle dark:bg-app-subtle-dark text-app-mute dark:text-app-mute-dark'
            }`}
          >
            {done ? <Check className="size-3" /> : i + 1}
          </span>
          <span
            className={`text-13 ${
              active ? 'font-medium text-app-ink dark:text-app-ink-dark' : 'text-app-mute dark:text-app-mute-dark'
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="text-app-faint dark:text-app-faint-dark mx-1">→</span>
          )}
        </div>
      );
    })}
  </div>
);
