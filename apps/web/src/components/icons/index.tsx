import type { SVGProps } from 'react';

import { cn } from '@/utils/cn';

/**
 * Lightweight, original line-icon set (24px grid, 1.5px stroke, currentColor)
 * matching the design language (DESIGN_GUIDELINES section 7). Decorative by
 * default (aria-hidden); pass a `title` for standalone meaningful icons.
 */
type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Icon({ children, className, title, ...props }: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      width='20'
      height='20'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('shrink-0', className)}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M19 12H5' />
      <path d='m12 19-7-7 7-7' />
    </Icon>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M12 3.5 13.6 8.4 18.5 10 13.6 11.6 12 16.5 10.4 11.6 5.5 10 10.4 8.4Z' />
      <path d='M18 15.5 18.7 17.3 20.5 18 18.7 18.7 18 20.5 17.3 18.7 15.5 18 17.3 17.3Z' />
    </Icon>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x='3' y='3' width='7.5' height='9' rx='1.5' />
      <rect x='3' y='15' width='7.5' height='6' rx='1.5' />
      <rect x='13.5' y='3' width='7.5' height='6' rx='1.5' />
      <rect x='13.5' y='12' width='7.5' height='9' rx='1.5' />
    </Icon>
  );
}

export function ProjectsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M3 7a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z' />
      <path d='M3 10.5h18' />
    </Icon>
  );
}

export function PeopleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx='9' cy='8' r='3' />
      <path d='M3.5 19a5.5 5.5 0 0 1 11 0' />
      <path d='M16 5.2a3 3 0 0 1 0 5.6' />
      <path d='M17.5 13.6A5.5 5.5 0 0 1 20.5 18.5' />
    </Icon>
  );
}

export function TicketIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v2a2 2 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2 2 0 0 0 0-5Z' />
      <path d='M14 6v12' strokeDasharray='2 2' />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M6 9a6 6 0 0 1 12 0c0 4 1.2 5.5 2 6.5H4c.8-1 2-2.5 2-6.5Z' />
      <path d='M10 19a2 2 0 0 0 4 0' />
    </Icon>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M12 15V4' />
      <path d='m8 8 4-4 4 4' />
      <path d='M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3' />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d='M12 3 19 6v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6Z' />
      <path d='m9 12 2 2 4-4' />
    </Icon>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx='12' cy='12' r='9' />
      <path d='m15.5 8.5-2 5-5 2 2-5Z' />
    </Icon>
  );
}

export function SitemapIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x='9' y='3' width='6' height='5' rx='1' />
      <rect x='3' y='16' width='6' height='5' rx='1' />
      <rect x='15' y='16' width='6' height='5' rx='1' />
      <path d='M12 8v4M6 16v-2h12v2' />
    </Icon>
  );
}
