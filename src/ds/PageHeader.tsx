/**
 * DS shim — mirrors @jisr-hr/ds-web PageHeader + SmartBreadcrumb APIs.
 * Storybook: molecules-pageheader--docs, atoms-smartbreadcrumb--docs
 * Stories: with-items, with-custom-breadcrumb, with-slots, without-border
 *          smartbreadcrumb--default, --overflowing, --with-targets
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/* ── SmartBreadcrumb ── */

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface SmartBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const SmartBreadcrumb = ({ items, className = '' }: SmartBreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className={['flex items-center flex-wrap gap-1', className].join(' ')}>
    {items.map((item, i) => {
      const isLast = i === items.length - 1;
      return (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3 text-app-faint dark:text-app-faint-dark" />}
          {item.to && !isLast ? (
            <Link
              to={item.to}
              className="text-11 text-app-faint dark:text-app-faint-dark hover:text-app-mute dark:hover:text-app-mute-dark transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={[
                'text-11',
                isLast
                  ? 'text-app-mute dark:text-app-mute-dark font-medium'
                  : 'text-app-faint dark:text-app-faint-dark',
              ].join(' ')}
            >
              {item.label}
            </span>
          )}
        </span>
      );
    })}
  </nav>
);

/* ── PageHeader ── */

interface MetadataItemProps {
  icon?: ReactNode;
  label: string;
  value?: string;
}

export const MetadataItem = ({ icon, label, value }: MetadataItemProps) => (
  <span className="inline-flex items-center gap-1 text-11 text-app-mute dark:text-app-mute-dark">
    {icon && <span className="size-3.5">{icon}</span>}
    <span>{label}</span>
    {value && <span className="font-medium text-app-ink dark:text-app-ink-dark">{value}</span>}
  </span>
);

interface PageHeaderProps {
  breadcrumb?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  metadata?: ReactNode;
  border?: boolean;
  className?: string;
}

export const PageHeader = ({
  breadcrumb,
  title,
  description,
  actions,
  metadata,
  border = true,
  className = '',
}: PageHeaderProps) => (
  <div
    className={[
      'px-5 sm:px-6 pt-5 pb-4',
      border ? 'border-b border-app-line dark:border-app-line-dark' : 'pb-3',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[18px] font-semibold leading-tight text-app-ink dark:text-app-ink-dark">
          {title}
        </h1>
        {description && (
          <p className="text-13 text-app-mute dark:text-app-mute-dark mt-0.5">{description}</p>
        )}
        {metadata && <div className="flex flex-wrap gap-3 mt-1.5">{metadata}</div>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  </div>
);
