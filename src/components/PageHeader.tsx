import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export type Crumb = { label: string; to?: string };

export const Breadcrumb = ({ items }: { items: Crumb[] }) => (
  <nav className="flex flex-wrap items-center text-11 text-app-faint dark:text-app-faint-dark gap-x-1">
    {items.map((c, i) => (
      <span key={i} className="inline-flex items-center gap-1">
        {c.to ? (
          <Link to={c.to} className="hover:text-app-mute dark:hover:text-app-mute-dark">
            {c.label}
          </Link>
        ) : (
          <span className={i === items.length - 1 ? 'text-app-mute dark:text-app-mute-dark' : ''}>
            {c.label}
          </span>
        )}
        {i < items.length - 1 && <ChevronRight className="size-3 opacity-60" />}
      </span>
    ))}
  </nav>
);

export const PageHeader = ({
  crumbs,
  title,
  subtitle,
  right,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) => (
  <div className="px-5 sm:px-6 pt-5 pb-3">
    <Breadcrumb items={crumbs} />
    <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[18px] font-medium leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-13 text-app-mute dark:text-app-mute-dark mt-0.5">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  </div>
);
