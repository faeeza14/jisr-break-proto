import { NavLink, Outlet } from 'react-router-dom';
import { Breadcrumb } from '../components/PageHeader';

const tabs = [
  { to: '/settings/attendance/shifts/scheduler', label: 'Scheduler' },
  { to: '/settings/attendance/shifts/settings', label: 'Shift settings' },
];

export const ShiftsLayout = () => (
  <div>
    <div className="px-5 sm:px-6 pt-5 pb-2">
      <Breadcrumb
        items={[
          { label: 'Settings', to: '/settings' },
          { label: 'Attendance' },
          { label: 'Shifts & scheduling' },
        ]}
      />
      <h1 className="mt-2 text-[18px] font-medium">Shifts &amp; scheduling</h1>
      <p className="text-13 text-app-mute dark:text-app-mute-dark">
        Plan the week, build shift presets, and group them into templates.
      </p>
    </div>
    <div className="px-5 sm:px-6 border-b-hair border-app-line dark:border-app-line-dark">
      <div className="flex gap-5">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `pb-2.5 -mb-px text-13 font-medium border-b-2 transition ${
                isActive
                  ? 'border-app-ink dark:border-app-ink-dark text-app-ink dark:text-app-ink-dark'
                  : 'border-transparent text-app-mute dark:text-app-mute-dark hover:text-app-ink'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
    <Outlet />
  </div>
);
