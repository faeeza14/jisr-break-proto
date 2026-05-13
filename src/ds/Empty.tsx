/**
 * DS shim — mirrors @jisr-hr/ds-web Empty API.
 * Source: Figma — Wasl DS / Molecules / Empty (canvas 8351:1055)
 *
 * Spec from Figma:
 *   Component: padding 24px, gap 16px, fills white, borderRadius 24px
 *   Supporting subcomponents: [Empty] Media (246×174 illustration slot)
 *                              [Empty] Content (383×172 text + actions slot)
 *
 * API:
 *   <Empty
 *     media={<MyIllustration />}
 *     title="No policies yet"
 *     description="Create one to get started."
 *     primaryAction={<Button>New policy</Button>}
 *     secondaryAction={<Button variant="tertiary">Learn more</Button>}
 *   />
 */
import type { ReactNode } from 'react';
import { InboxIcon } from 'lucide-react';

interface EmptyProps {
  /** Illustration slot (lucide icon, custom SVG, or image). Falls back to a generic inbox glyph. */
  media?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  /** When true, removes the surrounding card chrome — for use inside an existing Card */
  inline?: boolean;
}

export const Empty = ({
  media,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
  inline = false,
}: EmptyProps) => (
  <div
    className={[
      'flex flex-col items-center text-center gap-4 px-6 py-10',
      inline ? '' : 'rounded-2xl bg-white dark:bg-app-card-dark hairline',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <div className="size-12 inline-flex items-center justify-center rounded-full bg-app-subtle dark:bg-app-subtle-dark text-app-mute dark:text-app-mute-dark">
      {media ?? <InboxIcon className="size-6" />}
    </div>
    <div className="space-y-1 max-w-sm">
      <div className="text-13 font-medium text-app-ink dark:text-app-ink-dark">{title}</div>
      {description && (
        <p className="text-13 text-app-mute dark:text-app-mute-dark">{description}</p>
      )}
    </div>
    {(primaryAction || secondaryAction) && (
      <div className="flex items-center gap-2 pt-1">
        {secondaryAction}
        {primaryAction}
      </div>
    )}
  </div>
);
