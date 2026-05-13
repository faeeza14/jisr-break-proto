import { Bell, ChevronDown, HelpCircle, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, Badge, Tooltip } from '@jisr-hr/ds-web';

export const TopBar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <header className="h-14 shrink-0 flex items-center px-3 sm:px-5 gap-2 bg-white dark:bg-app-card-dark border-b-hair border-app-line dark:border-app-line-dark">
      <Tooltip content="Open menu">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden inline-flex items-center justify-center size-8 rounded-md hover:bg-app-surface dark:hover:bg-app-subtle-dark"
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </button>
      </Tooltip>

      <button
        type="button"
        className="inline-flex items-center gap-2 px-2 h-8 rounded-md hover:bg-app-surface dark:hover:bg-app-subtle-dark"
      >
        <Avatar size="s" name="AlAqel Group" initials="AG" />
        <span className="text-13 font-medium hidden sm:inline">AlAqel Group</span>
        <ChevronDown className="size-3.5 text-app-faint" />
      </button>

      <div className="flex-1" />

      <Tooltip content={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          className="inline-flex items-center justify-center size-8 rounded-md hover:bg-app-surface dark:hover:bg-app-subtle-dark"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </Tooltip>

      <Tooltip content="Help & guides">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2 h-8 rounded-md text-13 text-app-mute dark:text-app-mute-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark"
        >
          <HelpCircle className="size-4" />
          <span className="hidden sm:inline">Get help</span>
        </button>
      </Tooltip>

      <Tooltip content="Notifications">
        <button
          type="button"
          className="relative inline-flex items-center justify-center size-8 rounded-md hover:bg-app-surface dark:hover:bg-app-subtle-dark"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {/* Live indicator via DS Badge dot variant */}
          <span className="absolute top-1.5 right-1.5">
            <Badge appearance="danger" dot size="small" />
          </span>
        </button>
      </Tooltip>

      <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l-hair border-app-line dark:border-app-line-dark">
        <Avatar size="m" name="Faeeza Adams" status="online" />
        <div className="leading-tight">
          <div className="text-13">Faeeza A.</div>
          <div className="text-11 text-app-faint dark:text-app-faint-dark">faeeza1496@gmail.com</div>
        </div>
      </div>
    </header>
  );
};
