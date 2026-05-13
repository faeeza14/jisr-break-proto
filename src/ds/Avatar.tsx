/**
 * DS shim — mirrors @jisr-hr/ds-web Avatar API.
 * Source: Figma — Wasl DS / Atoms / Avatar (canvas 4793:12888)
 *
 * Spec from Figma:
 *   Sizes: xxl (80) | xl (56) | l (40) | m (32) | s (24)
 *   borderRadius: 400px (fully round)
 *   strokeWeight: 2px (white border, inside)
 *   AvatarStatus subcomponent: optional dot overlay (online/offline/dnd)
 *   Image fallback: initials (recent decision to allow clipping on small avatars)
 *
 * API:
 *   <Avatar size="m" name="Faeeza Adams" src="/photo.jpg" status="online" />
 */
import type { ReactNode } from 'react';

type AvatarSize = 'xxl' | 'xl' | 'l' | 'm' | 's';
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
  /** Full name — used to derive initials when src is missing or fails */
  name?: string;
  /** Image source */
  src?: string;
  /** Explicit initials override (defaults to deriving from name) */
  initials?: string;
  size?: AvatarSize;
  /** Optional small status dot overlay */
  status?: AvatarStatus;
  className?: string;
  alt?: string;
  /** Optional click handler — makes the avatar focusable */
  onClick?: () => void;
  children?: ReactNode;
}

const SIZE_PX: Record<AvatarSize, number> = {
  xxl: 80,
  xl: 56,
  l: 40,
  m: 32,
  s: 24,
};

const SIZE_CLS: Record<AvatarSize, string> = {
  xxl: 'size-20 text-base',
  xl: 'size-14 text-sm',
  l: 'size-10 text-13',
  m: 'size-8 text-11',
  s: 'size-6 text-[10px]',
};

const STATUS_DOT_SIZE: Record<AvatarSize, string> = {
  xxl: 'size-4',
  xl: 'size-3',
  l: 'size-2.5',
  m: 'size-2',
  s: 'size-1.5',
};

const STATUS_FILL: Record<AvatarStatus, string> = {
  online: 'bg-ok-line',
  offline: 'bg-app-mute',
  busy: 'bg-danger-line',
  away: 'bg-warn-line',
};

const deriveInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Deterministic background color from name → 5-slot palette
const BG_PALETTE = [
  'bg-info-bg text-info-ink',
  'bg-ok-bg text-ok-ink',
  'bg-warn-bg text-warn-ink',
  'bg-danger-bg text-danger-ink',
  'bg-app-subtle text-app-ink dark:bg-app-subtle-dark dark:text-app-ink-dark',
];

const hashName = (n?: string) => {
  if (!n) return 0;
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) | 0;
  return Math.abs(h) % BG_PALETTE.length;
};

export const Avatar = ({
  name,
  src,
  initials,
  size = 'm',
  status,
  className = '',
  alt,
  onClick,
  children,
}: AvatarProps) => {
  const pxSize = SIZE_PX[size];
  const initialsText = initials ?? deriveInitials(name);
  const paletteCls = BG_PALETTE[hashName(name ?? initialsText)];

  const Wrapper = onClick ? 'button' : 'span';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={alt ?? name ?? 'Avatar'}
      className={[
        'relative inline-flex items-center justify-center rounded-full overflow-hidden font-medium select-none',
        'ring-2 ring-white dark:ring-app-card-dark',
        SIZE_CLS[size],
        !src ? paletteCls : '',
        onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-app-ink' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: pxSize, height: pxSize }}
    >
      {src ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          src={src}
          alt={alt ?? name ?? ''}
          className="size-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span aria-hidden="true">{children ?? initialsText}</span>
      )}
      {status && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-app-card-dark',
            STATUS_DOT_SIZE[size],
            STATUS_FILL[status],
          ].join(' ')}
          aria-label={`Status: ${status}`}
        />
      )}
    </Wrapper>
  );
};

interface AvatarGroupProps {
  /** Avatars to display — overflow shows a +N indicator */
  children: ReactNode;
  /** Max avatars to show before collapsing */
  max?: number;
  size?: AvatarSize;
  className?: string;
}

/**
 * Per Figma changelog 23.02.2026:
 *   - item wrapper removed from structure
 *   - count border now inside the avatar
 *   - Mobile: typical max visible avatar = 3
 */
export const AvatarGroup = ({
  children,
  max = 4,
  size = 'm',
  className = '',
}: AvatarGroupProps) => {
  const arr = Array.isArray(children) ? children : [children];
  const shown = arr.slice(0, max);
  const overflow = arr.length - max;
  const overlap = size === 's' ? '-ml-1.5' : size === 'm' ? '-ml-2' : '-ml-2.5';

  return (
    <div className={['flex items-center', className].filter(Boolean).join(' ')}>
      {shown.map((child, i) => (
        <span key={i} className={i === 0 ? '' : overlap}>
          {child}
        </span>
      ))}
      {overflow > 0 && (
        <span className={overlap}>
          <Avatar size={size} initials={`+${overflow}`} />
        </span>
      )}
    </div>
  );
};

/**
 * [Pattern] AvatarLabel — Avatar + label/sublabel combo from Figma
 * (component 16808:10575). Per Figma: "We've combined them together
 * and created it as a pattern component to provide guidance in dialog
 * overflow."
 */
interface AvatarLabelProps {
  avatar: ReactNode;
  /** Primary line — usually a person's name */
  label: ReactNode;
  /** Secondary line — role, email, status */
  sublabel?: ReactNode;
  /** Trailing slot — Badge, Tag, IconButton */
  trailing?: ReactNode;
  size?: 's' | 'm' | 'l';
  className?: string;
}

export const AvatarLabel = ({
  avatar,
  label,
  sublabel,
  trailing,
  size = 'm',
  className = '',
}: AvatarLabelProps) => (
  <div
    className={[
      'inline-flex items-center min-w-0',
      size === 's' ? 'gap-2' : 'gap-3',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <span className="shrink-0">{avatar}</span>
    <span className="flex-1 min-w-0">
      <span
        className={[
          'block truncate text-app-ink dark:text-app-ink-dark font-medium',
          size === 's' ? 'text-11' : 'text-13',
        ].join(' ')}
      >
        {label}
      </span>
      {sublabel && (
        <span
          className={[
            'block truncate text-app-mute dark:text-app-mute-dark',
            size === 's' ? 'text-[10px]' : 'text-11',
          ].join(' ')}
        >
          {sublabel}
        </span>
      )}
    </span>
    {trailing && <span className="shrink-0">{trailing}</span>}
  </div>
);
