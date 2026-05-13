/**
 * DS shim — mirrors @jisr-hr/ds-web Tooltip API.
 * Storybook: atoms-tooltip--docs
 * Stories: default, no-arrow, long-multiline-content, top-placement, left-top-side
 */
import type { ReactNode } from 'react';
import { useState } from 'react';

interface TooltipProps {
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  arrow?: boolean;
  children: ReactNode;
  className?: string;
}

const sideClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export const Tooltip = ({
  content,
  side = 'top',
  children,
  className = '',
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={['relative inline-flex', className].join(' ')}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <span
          role="tooltip"
          className={[
            'absolute z-50 whitespace-nowrap rounded-md bg-app-ink dark:bg-app-ink-dark text-white dark:text-app-bg text-11 px-2 py-1 pointer-events-none',
            sideClasses[side],
          ].join(' ')}
        >
          {content}
        </span>
      )}
    </span>
  );
};
