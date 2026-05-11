import { NavLink, useLocation } from 'react-router-dom';
import {
  Search,
  Building2,
  Users,
  Inbox,
  Lock,
  CalendarClock,
  ClipboardList,
  Wallet,
  TrendingUp,
  Star,
  ChevronDown,
} from 'lucide-react';
import type { ReactNode } from 'react';

type Item = {
  label: string;
  icon?: ReactNode;
  to?: string;
  children?: Array<{ label: string; to: string }>;
};

const sections: Array<{ heading?: string; items: Item[] }> = [
  {
    items: [{ label: 'Quick access', icon: <Star className="size-4" /> }],
  },
  {
    heading: 'Essentials',
    items: [
      { label: 'Organization', icon: <Building2 className="size-4" /> },
      { label: 'Employees', icon: <Users className="size-4" /> },
      { label: 'Requests & tasks', icon: <Inbox className="size-4" /> },
      { label: 'Access & security', icon: <Lock className="size-4" /> },
    ],
  },
  {
    heading: 'Core HR',
    items: [
      {
        label: 'Attendance',
        icon: <CalendarClock className="size-4" />,
        children: [
          { label: 'Shifts & scheduling', to: '/settings/attendance/shifts' },
          { label: 'Attendance policies', to: '/settings/attendance/policies' },
          { label: 'Attendance tracking methods', to: '/settings/attendance/tracking' },
        ],
      },
      { label: 'Leave', icon: <ClipboardList className="size-4" /> },
      { label: 'Payroll', icon: <Wallet className="size-4" /> },
    ],
  },
  {
    heading: 'Talent',
    items: [{ label: 'Performance', icon: <TrendingUp className="size-4" /> }],
  },
];

export const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
  const attendanceOpen = location.pathname.startsWith('/settings/attendance');

  return (
    <nav className="h-full w-[244px] shrink-0 bg-white dark:bg-app-card-dark hairline border-l-0 border-t-0 border-b-0 px-3 pt-4 pb-6 overflow-y-auto">
      <div className="px-2 pb-3">
        <div className="text-11 font-medium tracking-tight text-app-faint dark:text-app-faint-dark">JISR</div>
        <div className="text-13 font-medium text-app-ink dark:text-app-ink-dark mt-0.5">Settings</div>
      </div>

      <div className="px-2 pb-3">
        <div className="relative">
          <Search className="size-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-app-faint" />
          <input
            placeholder="Search settings"
            className="w-full pl-7 pr-2 py-1.5 text-13 bg-app-subtle dark:bg-app-subtle-dark rounded-md hairline focus-ring placeholder:text-app-faint"
          />
        </div>
      </div>

      {sections.map((section, si) => (
        <div key={si} className="mb-2">
          {section.heading && (
            <div className="label-caps px-2 mt-3 mb-1.5">{section.heading}</div>
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              if (item.children) {
                return (
                  <li key={item.label}>
                    <div
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-13 ${
                        attendanceOpen
                          ? 'text-app-ink dark:text-app-ink-dark'
                          : 'text-app-mute dark:text-app-mute-dark'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      <ChevronDown className={`size-3.5 transition ${attendanceOpen ? '' : '-rotate-90'}`} />
                    </div>
                    {attendanceOpen && (
                      <ul className="ml-7 mt-0.5 space-y-0.5">
                        {item.children.map((c) => (
                          <li key={c.label}>
                            <NavLink
                              to={c.to}
                              onClick={onNavigate}
                              className={({ isActive }) =>
                                `block px-2 py-1.5 rounded-md text-13 transition ${
                                  isActive
                                    ? 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-ink'
                                    : 'text-app-mute dark:text-app-mute-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark'
                                }`
                              }
                            >
                              {c.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-13 text-app-mute dark:text-app-mute-dark hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};
