import { Bell, ChevronDown, HelpCircle, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export const TopBar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <header className="h-14 shrink-0 flex items-center px-3 sm:px-5 gap-3 bg-white dark:bg-app-card-dark border-b-hair border-app-line dark:border-app-line-dark">
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden inline-flex items-center justify-center size-8 rounded-md hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 px-2 h-8 rounded-md hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
      >
        <span className="size-6 rounded-md bg-app-ink dark:bg-app-ink-dark text-white dark:text-app-ink text-11 inline-flex items-center justify-center font-medium">
          AG
        </span>
        <span className="text-13 font-medium hidden sm:inline">AlAqel Group</span>
        <ChevronDown className="size-3.5 text-app-faint" />
      </button>
      <div className="flex-1" />
      <button
        type="button"
        onClick={() => setDark((d) => !d)}
        className="inline-flex items-center justify-center size-8 rounded-md hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
        aria-label="Toggle theme"
      >
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-2 h-8 rounded-md text-13 text-app-mute dark:text-app-mute-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
      >
        <HelpCircle className="size-4" />
        <span className="hidden sm:inline">Get help</span>
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center size-8 rounded-md hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
      </button>
      <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l-hair border-app-line dark:border-app-line-dark">
        <span className="size-7 rounded-full bg-app-subtle dark:bg-app-subtle-dark text-13 inline-flex items-center justify-center">
          F
        </span>
        <div className="leading-tight">
          <div className="text-13">Faeeza A.</div>
          <div className="text-11 text-app-faint dark:text-app-faint-dark">faeeza1496@gmail.com</div>
        </div>
      </div>
    </header>
  );
};
