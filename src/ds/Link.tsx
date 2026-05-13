/**
 * DS shim — mirrors @jisr-hr/ds-web Link API.
 * Source: Figma — Wasl DS / Atoms / Link (canvas 12005:1742)
 *
 * Spec from Figma (Sections: Main, Behaviour, Usage, Specs):
 *   Onest, 14px / 20px line-height, weight 400–600 depending on emphasis
 *   Color: #101014 default, with underline for emphasis
 *
 * Variants (inferred from common DS conventions):
 *   appearance: default | subtle | primary | danger
 *   size: sm | md | lg
 *   underline: always | hover | none
 *
 * API:
 *   <Link href="/foo">Open</Link>
 *   <Link href="/foo" appearance="primary" trailingIcon={<ChevronRight />} />
 *
 * For internal navigation use react-router's NavLink with an `asChild` wrapper —
 * here we render an <a>. Pass an `as` prop to swap the tag if needed.
 */
import type { AnchorHTMLAttributes, ElementType, ReactNode } from 'react';

type LinkAppearance = 'default' | 'subtle' | 'primary' | 'danger';
type LinkSize = 'sm' | 'md' | 'lg';
type LinkUnderline = 'always' | 'hover' | 'none';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'size'> {
  appearance?: LinkAppearance;
  size?: LinkSize;
  underline?: LinkUnderline;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Render a different element (e.g. RouterLink) while keeping link styles */
  as?: ElementType;
  children: ReactNode;
}

const APPEARANCE: Record<LinkAppearance, string> = {
  default: 'text-app-ink dark:text-app-ink-dark hover:text-app-faint dark:hover:text-app-faint-dark',
  subtle: 'text-app-mute dark:text-app-mute-dark hover:text-app-ink dark:hover:text-app-ink-dark',
  primary: 'text-info-ink hover:text-info-ink/80 dark:text-info-ink-dark',
  danger: 'text-danger-ink hover:text-danger-ink/80 dark:text-danger-ink-dark',
};

const SIZE: Record<LinkSize, string> = {
  sm: 'text-11',
  md: 'text-13',
  lg: 'text-sm',
};

const UNDERLINE: Record<LinkUnderline, string> = {
  always: 'underline underline-offset-2',
  hover: 'hover:underline underline-offset-2',
  none: 'no-underline',
};

export const Link = ({
  appearance = 'default',
  size = 'md',
  underline = 'hover',
  leadingIcon,
  trailingIcon,
  as,
  children,
  className = '',
  ...rest
}: LinkProps) => {
  const Tag = (as ?? 'a') as ElementType;
  return (
    <Tag
      className={[
        'inline-flex items-center gap-1 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-ink rounded-sm',
        APPEARANCE[appearance],
        SIZE[size],
        UNDERLINE[underline],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {leadingIcon && <span className="shrink-0 inline-flex size-3.5 items-center justify-center">{leadingIcon}</span>}
      <span>{children}</span>
      {trailingIcon && <span className="shrink-0 inline-flex size-3.5 items-center justify-center">{trailingIcon}</span>}
    </Tag>
  );
};
