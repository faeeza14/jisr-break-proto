import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { Button } from './primitives/Button';
import type { AuditEntry } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  entries: AuditEntry[];
  title?: string;
};

export const AuditLogModal = ({ open, onClose, entries, title }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!open) return null;
  const list = [...entries].reverse();
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="History"
        className="w-full max-w-xl bg-white dark:bg-app-card-dark rounded-card hairline overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b-hair border-app-line dark:border-app-line-dark flex items-start justify-between gap-3">
          <div>
            <div className="text-13 font-medium">{title ?? 'History'}</div>
            <div className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
              {entries.length === 0
                ? 'No changes recorded yet.'
                : `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-7 inline-flex items-center justify-center rounded-md hover:bg-app-subtle dark:hover:bg-app-subtle-dark"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {list.map((e) => {
            const isOpen = expanded === e.id;
            const summary = describeAction(e);
            return (
              <div key={e.id} className="rounded-md hairline">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-app-subtle/40 dark:hover:bg-app-subtle-dark/30"
                >
                  {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-13">{summary}</div>
                    <div className="text-11 text-app-mute dark:text-app-mute-dark">
                      {new Date(e.timestamp).toLocaleString()} · {e.userName}
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pt-0 text-11 text-app-mute dark:text-app-mute-dark space-y-1">
                    {e.diff.length === 0 && <div>No diff.</div>}
                    {e.diff.map((d, i) => (
                      <div key={i}>
                        <span className="font-medium text-app-ink dark:text-app-ink-dark">{d.field}:</span>{' '}
                        {String(d.before)} → {String(d.after)}
                      </div>
                    ))}
                    {e.complianceImpact && (
                      <div className="pt-1">
                        Compliance: {e.complianceImpact.before} → {e.complianceImpact.after}
                      </div>
                    )}
                    {e.reason && (
                      <div className="pt-1 italic">Reason: "{e.reason}"</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t-hair border-app-line dark:border-app-line-dark flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const describeAction = (e: AuditEntry): string => {
  if (e.action === 'create') return `Created ${e.entityType}`;
  if (e.action === 'edit') return `Edited ${e.entityType}${e.diff.length ? ` · ${e.diff.length} change${e.diff.length === 1 ? '' : 's'}` : ''}`;
  if (e.action === 'override') return `Overrode compliance`;
  return `Deleted ${e.entityType}`;
};
