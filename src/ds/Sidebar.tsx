/**
 * DS shim — mirrors @jisr-hr/ds-web Sidebar API.
 * Storybook: molecules-sidebar--docs
 * Stories: v-2-sidebar, default-sidebar
 *
 * Navigation sidebar matching the DS v2 pattern.
 */
import type { ReactNode } from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface SidebarNavItemChild {
  label: string;
  to: string;
}

interface SidebarNavItem {
  label: string;
  icon?: ReactNode;
  to?: string;
  children?: SidebarNavItemChild[];
}

interface SidebarSectionProps {
  heading?: string;
  items: SidebarNavItem[];
}

const NavItem = ({ item }: { item: SidebarNavItem }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-13 text-app-mute dark:text-app-mute-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark transition-colors"
        >
          {item.icon && <span className="shrink-0 size-4 text-app-faint">{item.icon}</span>}
          <span className="flex-1 text-left font-medium">{item.label}</span>
          <ChevronDown
            className={['size-3.5 text-app-faint transition-transform', expanded ? 'rotate-180' : ''].join(' ')}
          />
        </button>
        {expanded && (
          <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
            {item.children!.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  [
                    'block px-2 py-1.5 rounded-lg text-13 transition-colors',
                    isActive
                      ? 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-bg font-medium'
                      : 'text-app-mute dark:text-app-mute-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark hover:text-app-ink dark:hover:text-app-ink-dark',
                  ].join(' ')
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.to) {
    return (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          [
            'flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-13 transition-colors',
            isActive
              ? 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-bg font-medium'
              : 'text-app-mute dark:text-app-mute-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark hover:text-app-ink dark:hover:text-app-ink-dark',
          ].join(' ')
        }
      >
        {item.icon && <span className="shrink-0 size-4">{item.icon}</span>}
        {item.label}
      </NavLink>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-13 text-app-mute dark:text-app-mute-dark opacity-50 cursor-default">
      {item.icon && <span className="shrink-0 size-4">{item.icon}</span>}
      {item.label}
    </div>
  );
};

interface SidebarProps {
  header?: ReactNode;
  searchSlot?: ReactNode;
  sections: SidebarSectionProps[];
  footer?: ReactNode;
  className?: string;
}

export const SidebarNav = ({ header, searchSlot, sections, footer, className = '' }: SidebarProps) => (
  <nav
    className={[
      'h-full w-[244px] shrink-0 bg-white dark:bg-app-card-dark border-r border-app-line dark:border-app-line-dark flex flex-col',
      className,
    ].join(' ')}
  >
    {header && (
      <div className="px-4 pt-4 pb-2 shrink-0">{header}</div>
    )}
    {searchSlot && <div className="px-3 pb-2 shrink-0">{searchSlot}</div>}
    <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-4">
      {sections.map((section, i) => (
        <div key={i}>
          {section.heading && (
            <p className="text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium px-2 mb-1">
              {section.heading}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
    {footer && <div className="px-3 py-3 border-t border-app-line dark:border-app-line-dark shrink-0">{footer}</div>}
  </nav>
);
