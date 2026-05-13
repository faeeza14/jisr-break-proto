/**
 * DS shim — mirrors @jisr-hr/ds-web Table API (organism).
 * Source: Figma — Wasl DS / Organisms / Table (canvas 8351:1054)
 *
 * Real DS subcomponents (per Figma componentSets):
 *   [Table] TableHead (8361:70057):
 *     props: reorder, select, expand, mainContent, slot, actions,
 *            sort, pin, filter, more
 *   [Table] TableCell (8361:73587):
 *     props: statusBar, reorder, select, expand, avatar, mainContent,
 *            badge, switch, slot, actions
 *   [Table] TableBulkActions (8361:69539):
 *     leadingSlot, trailingSlot, actions, text
 *     Layout: row, gap 24, padding 16/12, bg #101014, white text
 *   [Table] TableButton (8361:70689): focusRing
 *   [Table] TableWidthHandle (8361:70930): column resize handle
 *
 * Patterns this shim supports:
 *   - Selectable rows w/ Checkbox (matches `select` prop)
 *   - Sortable columns w/ chevron indicator (matches `⤷sort` slot)
 *   - Row hover state matches Item spec (white → app-surface)
 *   - TableBulkActions bar slides in when ≥1 row selected
 *   - Built-in DS Empty integration for zero-state
 *   - Real <table> HTML for a11y
 *
 * Style tokens from Figma:
 *   - Card bg: white | borders: app-line | header label: text-11 uppercase
 *   - Row pad: 12px vertical (default) / 8px (condensed)
 *   - Header pad: 12px vertical
 *   - Bulk bar: bg app-ink, white text, padding 16px/12px, gap 24px
 */
import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { Empty } from './Empty';

export type SortDirection = 'asc' | 'desc';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: ReactNode;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  /** Enable sort UI on this column. Caller handles actual sort via `sortKey`/`onSortChange`. */
  sortable?: boolean;
}

interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  /** Use compact row padding (8px) instead of default (12px) */
  condensed?: boolean;
  onRowClick?: (row: T) => void;
  getRowKey?: (row: T, index: number) => string;
  className?: string;

  // Empty state
  /** Rendered when data is empty. Pass a string title for an Empty component, or a custom node. */
  emptyState?: ReactNode | { title: string; description?: string };

  // Selection (mirrors `select` slot in TableHead/TableCell)
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;

  // Sorting (mirrors `⤷sort` slot)
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string, dir: SortDirection) => void;
}

export function Table<T = Record<string, unknown>>({
  columns,
  data,
  condensed = false,
  onRowClick,
  getRowKey,
  className = '',
  emptyState,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  sortKey,
  sortDirection,
  onSortChange,
}: TableProps<T>) {
  const [uncontrolledSelection, setUncontrolledSelection] = useState<Set<string>>(new Set());
  const selSet = selectedKeys ?? uncontrolledSelection;
  const setSel = onSelectionChange ?? setUncontrolledSelection;

  const keyFor = (row: T, i: number): string =>
    getRowKey ? getRowKey(row, i) : String(i);

  const allSelected = data.length > 0 && data.every((r, i) => selSet.has(keyFor(r, i)));
  const someSelected = !allSelected && data.some((r, i) => selSet.has(keyFor(r, i)));

  const toggleAll = () => {
    if (allSelected) {
      setSel(new Set());
    } else {
      setSel(new Set(data.map((r, i) => keyFor(r, i))));
    }
  };

  const toggleOne = (k: string) => {
    const next = new Set(selSet);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setSel(next);
  };

  const onHeaderSort = (col: TableColumn<T>) => {
    if (!col.sortable || !onSortChange) return;
    if (sortKey === col.key) {
      onSortChange(col.key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(col.key, 'asc');
    }
  };

  const rowPadCls = condensed ? 'py-2' : 'py-3';

  // Render empty state
  const renderEmpty = () => {
    if (!emptyState) {
      return (
        <Empty
          inline
          title="No data"
          description="Nothing to show here yet."
        />
      );
    }
    if (
      typeof emptyState === 'object' &&
      emptyState !== null &&
      !('type' in (emptyState as object)) &&
      'title' in (emptyState as object)
    ) {
      const { title, description } = emptyState as { title: string; description?: string };
      return <Empty inline title={title} description={description} />;
    }
    return emptyState as ReactNode;
  };

  const totalColumns = columns.length + (selectable ? 1 : 0);

  return (
    <div
      className={[
        'rounded-card hairline overflow-hidden bg-white dark:bg-app-card-dark',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <table className="w-full text-13 text-left text-app-ink dark:text-app-ink-dark border-collapse">
        <thead>
          <tr className="border-b border-app-line dark:border-app-line-dark bg-white dark:bg-app-card-dark">
            {selectable && (
              <th className="w-10 pl-4 pr-1 py-3 align-middle">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col, ci) => {
              const isSorted = sortKey === col.key;
              const sortIcon = col.sortable ? (
                isSorted ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )
                ) : (
                  <ChevronsUpDown className="size-3.5 opacity-40" />
                )
              ) : null;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    'px-4 py-3 text-11 font-medium uppercase tracking-[0.08em] text-app-faint dark:text-app-faint-dark whitespace-nowrap',
                    ci === 0 && !selectable ? 'pl-4' : '',
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : '',
                    col.sortable ? 'cursor-pointer select-none hover:text-app-mute dark:hover:text-app-mute-dark' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => onHeaderSort(col)}
                  aria-sort={
                    col.sortable
                      ? isSorted
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                >
                  <span
                    className={[
                      'inline-flex items-center gap-1',
                      col.align === 'right' ? 'flex-row-reverse' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {col.header}
                    {sortIcon}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={totalColumns} className="p-0">
                <div className="py-12 flex items-center justify-center">{renderEmpty()}</div>
              </td>
            </tr>
          ) : (
            data.map((row, ri) => {
              const rk = keyFor(row, ri);
              const isSelected = selSet.has(rk);
              return (
                <tr
                  key={rk}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    'border-b border-app-line dark:border-app-line-dark last:border-b-0 transition-colors',
                    isSelected ? 'bg-app-surface dark:bg-app-subtle-dark' : '',
                    onRowClick
                      ? 'cursor-pointer hover:bg-app-surface active:bg-app-bg dark:hover:bg-app-subtle-dark dark:active:bg-app-subtle-dark'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-state={isSelected ? 'selected' : undefined}
                >
                  {selectable && (
                    <td
                      className={['w-10 pl-4 pr-1 align-middle', rowPadCls].join(' ')}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOne(rk);
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(rk)}
                        aria-label={`Select row ${ri + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        'px-4 align-middle',
                        rowPadCls,
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                            ? 'text-center'
                            : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {col.render
                        ? col.render(row, ri)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * [Table] TableBulkActions (8361:69539) — sticky action bar that appears
 * when one or more rows are selected. Compose above the Table, or use the
 * helper `<TableBulkActions visible={...}>`.
 *
 * From Figma:
 *   Layout: row, gap 24px, padding 16px 12px
 *   Fill: #101014 (app-ink)   |   Text: white
 *   Slots: leadingSlot, text, trailingSlot, actions
 */
interface TableBulkActionsProps {
  visible: boolean;
  /** Count or descriptive text — usually "N selected" */
  text: ReactNode;
  /** Left-side slot (Avatar, icon) */
  leadingSlot?: ReactNode;
  /** Right-side slot before actions */
  trailingSlot?: ReactNode;
  /** Actions (Button(s)) — rendered on the right */
  actions?: ReactNode;
  /** Callback when user dismisses the bar */
  onClear?: () => void;
  className?: string;
}

export const TableBulkActions = ({
  visible,
  text,
  leadingSlot,
  trailingSlot,
  actions,
  onClear,
  className = '',
}: TableBulkActionsProps) => {
  if (!visible) return null;
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={[
        'flex items-center gap-6 px-3 py-4 bg-app-ink text-white rounded-card',
        'shadow-elevated',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {leadingSlot && <span className="shrink-0 inline-flex items-center">{leadingSlot}</span>}
      <span className="flex-1 text-13 font-medium">{text}</span>
      {trailingSlot && <span className="shrink-0 inline-flex items-center">{trailingSlot}</span>}
      {actions && <span className="shrink-0 inline-flex items-center gap-2">{actions}</span>}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 text-13 text-white/70 hover:text-white"
        >
          Clear
        </button>
      )}
    </div>
  );
};
