/**
 * DS shim — mirrors @jisr-hr/ds-web Table API (organisms-table).
 * Storybook: organisms-table--docs
 * Stories: default-table, condensed-table, table-with-actions, table-with-clickable-rows,
 *          table-with-pagination, expandable-rows
 *
 * Simplified shim — real DS Table uses @tanstack/react-table internally.
 * This shim exposes the same declarative column/data API.
 */
import type { ReactNode } from 'react';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  condensed?: boolean;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  className?: string;
  getRowKey?: (row: T, index: number) => string;
}

export function Table<T = Record<string, unknown>>({
  columns,
  data,
  condensed = false,
  onRowClick,
  emptyState,
  className = '',
  getRowKey,
}: TableProps<T>) {
  const rowPad = condensed ? 'px-3 py-2' : 'px-3 py-3';
  const headerPad = condensed ? 'px-3 py-1.5' : 'px-3 py-2';

  return (
    <div className={['rounded-lg hairline overflow-hidden', className].join(' ')}>
      {/* Header */}
      <div className="grid border-b border-app-line dark:border-app-line-dark bg-app-subtle/40 dark:bg-app-subtle-dark/40" style={{ gridTemplateColumns: columns.map((c) => c.width ?? '1fr').join(' ') }}>
        {columns.map((col) => (
          <div
            key={col.key}
            className={[
              headerPad,
              'text-11 tracking-[0.08em] uppercase text-app-faint dark:text-app-faint-dark font-medium',
              col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.length === 0 && emptyState ? (
        <div className="px-4 py-8 flex items-center justify-center">{emptyState}</div>
      ) : (
        data.map((row, ri) => (
          <div
            key={getRowKey ? getRowKey(row, ri) : ri}
            onClick={() => onRowClick?.(row)}
            className={[
              'grid border-b border-app-line dark:border-app-line-dark last:border-b-0 items-center text-13 transition-colors',
              onRowClick ? 'cursor-pointer hover:bg-app-subtle/50 dark:hover:bg-app-subtle-dark/50' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ gridTemplateColumns: columns.map((c) => c.width ?? '1fr').join(' ') }}
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className={[
                  rowPad,
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {col.render
                  ? col.render(row, ri)
                  : String((row as Record<string, unknown>)[col.key] ?? '')}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
