import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { X } from 'lucide-react';

export const SettingsShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app-bg dark:bg-app-bg-dark flex flex-col">
      <TopBar onMenuClick={() => setDrawerOpen(true)} />
      <div className="flex-1 flex min-h-0">
        <aside className="hidden md:block">
          <Sidebar />
        </aside>
        {drawerOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            <div
              className="absolute inset-y-0 left-0 max-w-[85vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="absolute right-2 top-2 z-10 size-8 inline-flex items-center justify-center rounded-md bg-white/80 dark:bg-app-card-dark/80"
                >
                  <X className="size-4" />
                </button>
                <Sidebar onNavigate={() => setDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
