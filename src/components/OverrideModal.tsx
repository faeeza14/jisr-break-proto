import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './primitives/Button';
import type { Violation } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  presetId: string;
  violations: Violation[];
  onConfirm: (reason: string) => void;
};

export const OverrideModal = ({ open, onClose, violations, onConfirm }: Props) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Override compliance check"
        className="w-full max-w-lg bg-white dark:bg-app-card-dark rounded-card hairline overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b-hair border-app-line dark:border-app-line-dark flex items-start justify-between gap-3">
          <div>
            <div className="text-13 font-medium">Override compliance check</div>
            <div className="text-11 text-app-mute dark:text-app-mute-dark mt-0.5">
              An audit entry will be recorded.
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
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="rounded-md bg-danger-bg/40 hairline border-danger-line/50 p-3">
            <div className="label-caps text-danger-ink dark:text-danger-ink-dark">Suppressing</div>
            <ul className="mt-1.5 space-y-1">
              {violations.map((v) => (
                <li key={v.ruleId} className="text-13">
                  {v.message}
                </li>
              ))}
            </ul>
          </div>
          <label className="block">
            <span className="text-13 font-medium">Reason for override</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Document why this shift is being scheduled despite the violation."
              className="mt-1.5 field-input"
            />
            <span className="text-11 text-app-mute dark:text-app-mute-dark mt-1 block">
              Required. Captured to the audit trail.
            </span>
          </label>
        </div>
        <div className="px-5 py-3 border-t-hair border-app-line dark:border-app-line-dark flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            disabled={reason.trim().length < 4}
            onClick={() => {
              onConfirm(reason.trim());
              onClose();
            }}
          >
            Confirm override
          </Button>
        </div>
      </div>
    </div>
  );
};
