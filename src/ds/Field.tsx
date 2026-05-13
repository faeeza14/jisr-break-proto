/**
 * DS shim — mirrors @jisr-hr/ds-web Field API.
 * Storybook: molecules-field--docs
 * Stories: basic-field, field-with-description, field-with-error, field-with-multiple-errors,
 *          vertical-orientation, horizontal-orientation, responsive-orientation
 */
import type { ReactNode } from 'react';

type FieldOrientation = 'vertical' | 'horizontal' | 'responsive';

interface FieldProps {
  label?: string;
  description?: string;
  error?: string | string[];
  required?: boolean;
  orientation?: FieldOrientation;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export const Field = ({
  label,
  description,
  error,
  required = false,
  orientation = 'vertical',
  children,
  className = '',
  htmlFor,
}: FieldProps) => {
  const errors = Array.isArray(error) ? error : error ? [error] : [];
  const hasError = errors.length > 0;

  if (orientation === 'horizontal') {
    return (
      <div className={['flex items-start gap-4', className].join(' ')}>
        {label && (
          <label
            htmlFor={htmlFor}
            className="w-36 shrink-0 pt-2 text-13 font-medium text-app-ink dark:text-app-ink-dark"
          >
            {label}
            {required && <span className="text-danger-ink ml-0.5">*</span>}
          </label>
        )}
        <div className="flex-1 min-w-0">
          {children}
          {description && !hasError && (
            <p className="mt-1 text-11 text-app-mute dark:text-app-mute-dark">{description}</p>
          )}
          {errors.map((e) => (
            <p key={e} className="mt-1 text-11 text-danger-ink dark:text-danger-ink-dark">
              {e}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={['space-y-1', className].join(' ')}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-13 font-medium text-app-ink dark:text-app-ink-dark"
        >
          {label}
          {required && <span className="text-danger-ink ml-0.5">*</span>}
        </label>
      )}
      {children}
      {description && !hasError && (
        <p className="text-11 text-app-mute dark:text-app-mute-dark">{description}</p>
      )}
      {errors.map((e) => (
        <p key={e} className="text-11 text-danger-ink dark:text-danger-ink-dark">
          {e}
        </p>
      ))}
    </div>
  );
};
