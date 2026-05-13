/**
 * DS shim — mirrors @jisr-hr/ds-web Pagination API.
 * Source: Figma — Wasl DS / Molecules / Pagination (canvas 8174:2)
 *
 * Component sets in Figma:
 *   _PaginationFirst, _PaginationPrevious, _PaginationLink (active/disabled),
 *   _PaginationEllipsis, _PaginationNext, _PaginationLast
 *
 * Spec from Figma (changelog 2026.03.27):
 *   - showSummary supported, gap 12px, disabled states for link & ellipsis
 *
 * API:
 *   <Pagination
 *     page={current}
 *     totalPages={n}
 *     onPageChange={setPage}
 *     showSummary
 *     summary="Showing 1–10 of 87"
 *     siblingCount={1}
 *     boundaryCount={1}
 *   />
 */
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Number of pages to show on each side of the current page */
  siblingCount?: number;
  /** Number of pages to always show at the start/end */
  boundaryCount?: number;
  /** Show First / Last buttons */
  showEdges?: boolean;
  /** Show "Showing X of Y" summary line */
  showSummary?: boolean;
  summary?: string;
  disabled?: boolean;
  className?: string;
}

type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

const buildPages = (
  page: number,
  total: number,
  siblings: number,
  boundary: number,
): PaginationItem[] => {
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  if (total <= 1) return [1];

  const startPages = range(1, Math.min(boundary, total));
  const endPages = range(Math.max(total - boundary + 1, boundary + 1), total);

  const siblingStart = Math.max(
    Math.min(page - siblings, total - boundary - siblings * 2 - 1),
    boundary + 2,
  );
  const siblingEnd = Math.min(
    Math.max(page + siblings, boundary + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : total - 1,
  );

  const items: PaginationItem[] = [...startPages];
  if (siblingStart > boundary + 2) {
    items.push('ellipsis-start');
  } else if (boundary + 1 < total - boundary) {
    items.push(boundary + 1);
  }
  items.push(...range(siblingStart, siblingEnd));
  if (siblingEnd < total - boundary - 1) {
    items.push('ellipsis-end');
  } else if (total - boundary > boundary) {
    items.push(total - boundary);
  }
  items.push(...endPages);

  // Dedupe consecutive
  return items.filter((v, i, arr) => v !== arr[i - 1]);
};

const buttonBase =
  'inline-flex items-center justify-center h-8 min-w-8 rounded-lg text-13 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-ink';

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showEdges = false,
  showSummary = false,
  summary,
  disabled = false,
  className = '',
}: PaginationProps) => {
  const items = buildPages(page, totalPages, siblingCount, boundaryCount);

  const navBtnCls = (isDisabled: boolean) =>
    [
      buttonBase,
      'px-2 text-app-mute dark:text-app-mute-dark',
      isDisabled
        ? 'opacity-40 cursor-not-allowed'
        : 'hover:bg-app-surface dark:hover:bg-app-subtle-dark cursor-pointer',
    ].join(' ');

  const linkCls = (active: boolean) =>
    [
      buttonBase,
      'px-2',
      active
        ? 'bg-app-ink text-white dark:bg-app-ink-dark dark:text-app-bg-dark'
        : 'text-app-ink dark:text-app-ink-dark hover:bg-app-surface dark:hover:bg-app-subtle-dark cursor-pointer',
    ].join(' ');

  const change = (n: number) => {
    if (disabled || n < 1 || n > totalPages || n === page) return;
    onPageChange(n);
  };

  return (
    <div
      className={[
        'flex flex-col items-center gap-2 sm:flex-row sm:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showSummary && (
        <span className="text-11 text-app-mute dark:text-app-mute-dark">
          {summary ?? `Page ${page} of ${totalPages}`}
        </span>
      )}
      <nav
        aria-label="Pagination"
        className="flex items-center gap-1.5"
      >
        {showEdges && (
          <button
            type="button"
            disabled={disabled || page === 1}
            aria-label="First page"
            onClick={() => change(1)}
            className={navBtnCls(disabled || page === 1)}
          >
            <ChevronFirst className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          disabled={disabled || page === 1}
          aria-label="Previous page"
          onClick={() => change(page - 1)}
          className={navBtnCls(disabled || page === 1)}
        >
          <ChevronLeft className="size-3.5" />
        </button>
        {items.map((it, i) =>
          typeof it === 'number' ? (
            <button
              key={`p-${it}`}
              type="button"
              aria-current={it === page ? 'page' : undefined}
              onClick={() => change(it)}
              disabled={disabled}
              className={linkCls(it === page)}
            >
              {it}
            </button>
          ) : (
            <span
              key={`e-${i}`}
              aria-hidden="true"
              className="inline-flex items-center justify-center h-8 min-w-8 text-app-faint dark:text-app-faint-dark"
            >
              …
            </span>
          ),
        )}
        <button
          type="button"
          disabled={disabled || page === totalPages}
          aria-label="Next page"
          onClick={() => change(page + 1)}
          className={navBtnCls(disabled || page === totalPages)}
        >
          <ChevronRight className="size-3.5" />
        </button>
        {showEdges && (
          <button
            type="button"
            disabled={disabled || page === totalPages}
            aria-label="Last page"
            onClick={() => change(totalPages)}
            className={navBtnCls(disabled || page === totalPages)}
          >
            <ChevronLast className="size-3.5" />
          </button>
        )}
      </nav>
    </div>
  );
};
