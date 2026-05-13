/**
 * DS shim — mirrors @jisr-hr/ds-web Skeleton API.
 * Source: Figma — Wasl DS / Atoms / Skeleton (componentSet 2916:223)
 *
 * Spec from Figma:
 *   Variants: shape = rectangle | circle
 *   Fill: #F3F3F8 (app-bg) — note from Figma: "should be tokenized for
 *     dark-mode theming, currently hardcoded"
 *   Rectangle: height 16px default, fill width
 *   Circle: 40×40 default, borderRadius 400px
 *
 * API:
 *   <Skeleton width={120} height={16} />            // text line
 *   <Skeleton shape="circle" size={40} />           // avatar placeholder
 *   <SkeletonCard />                                 // composed pattern
 */
import type { ReactNode, CSSProperties } from 'react';

type SkeletonShape = 'rectangle' | 'circle';

interface SkeletonProps {
  shape?: SkeletonShape;
  /** Width in px, % string, or pass through tailwind via className */
  width?: number | string;
  /** Height in px */
  height?: number | string;
  /** Convenience prop for circle — sets both width & height */
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export const Skeleton = ({
  shape = 'rectangle',
  width,
  height,
  size,
  className = '',
  style,
}: SkeletonProps) => {
  const computedWidth = size ?? width ?? (shape === 'rectangle' ? '100%' : 40);
  const computedHeight = size ?? height ?? (shape === 'rectangle' ? 16 : 40);

  return (
    <span
      aria-hidden="true"
      className={[
        'inline-block bg-app-subtle dark:bg-app-subtle-dark relative overflow-hidden',
        shape === 'circle' ? 'rounded-full' : 'rounded-md',
        // Shimmer animation via pseudo-element
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/10 before:to-transparent',
        'before:animate-[shimmer_1.4s_infinite]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: computedWidth,
        height: computedHeight,
        ...style,
      }}
    />
  );
};

/** Composed skeleton card pattern from Figma — avatar + 3 lines */
export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div
    className={[
      'rounded-2xl bg-white dark:bg-app-card-dark hairline p-4 flex flex-col gap-2',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <Skeleton shape="circle" size={40} />
    <Skeleton width="100%" height={16} />
    <Skeleton width="80%" height={16} />
    <Skeleton width="60%" height={16} />
  </div>
);

/** Convenience: render N skeleton rows */
export const SkeletonText = ({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}): ReactNode => (
  <div className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={14}
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);
