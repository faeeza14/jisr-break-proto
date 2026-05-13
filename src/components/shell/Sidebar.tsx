/**
 * Settings sidebar — rebuilt using @jisr-hr/ds-web SidebarNav.
 * Storybook: molecules-sidebar--v-2-sidebar
 */
import { useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { SidebarNav, Input } from '@jisr-hr/ds-web';
import type { ReactNode } from 'react';

export const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
  void onNavigate;
  void location;

  return (
    <SidebarNav
      header={
        <div>
          <p className="text-11 font-medium tracking-tight text-app-faint dark:text-app-faint-dark">
            JISR
          </p>
          <p className="text-13 font-semibold text-app-ink dark:text-app-ink-dark mt-0.5">Settings</p>
        </div>
      }
      searchSlot={
        <Input
          appearance="default"
          size="sm"
          placeholder="Search settings"
          startAddon={<Search className="size-3.5" />}
        />
      }
      sections={[
        {
          items: [{ label: 'Quick access', icon: icon(<Star />) }],
        },
        {
          heading: 'Essentials',
          items: [
            { label: 'Organization', icon: icon(<Building2 />) },
            { label: 'Employees', icon: icon(<Users />) },
            { label: 'Requests & tasks', icon: icon(<Inbox />) },
            { label: 'Access & security', icon: icon(<Lock />) },
          ],
        },
        {
          heading: 'Core HR',
          items: [
            {
              label: 'Attendance',
              icon: icon(<CalendarClock />),
              children: [
                { label: 'Shifts & scheduling', to: '/settings/attendance/shifts' },
                { label: 'Attendance policies', to: '/settings/attendance/policies' },
                { label: 'Tracking methods', to: '/settings/attendance/tracking' },
              ],
            },
            { label: 'Leave', icon: icon(<ClipboardList />) },
            { label: 'Payroll', icon: icon(<Wallet />) },
          ],
        },
        {
          heading: 'Talent',
          items: [{ label: 'Performance', icon: icon(<TrendingUp />) }],
        },
      ]}
    />
  );
};

function icon(el: ReactNode): ReactNode {
  return <span className="size-4 flex items-center justify-center">{el}</span>;
}
