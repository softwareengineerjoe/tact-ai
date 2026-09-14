import { cn } from '@/utils/cn';

interface BrandLogoProps {
  /** Render only the mark (no wordmark). */
  markOnly?: boolean;
  /** Tailwind height class for the mark, e.g. 'h-8'. Wordmark scales with it. */
  className?: string;
  /** Use the light (on-dark) treatment for the wordmark. */
  variant?: 'dark' | 'light';
}

/**
 * TACT AI brand lockup. The mark is an abstract "team assembly" motif — three
 * connected nodes (people coordinating) resolving into a rounded token. Purely
 * original artwork; no third-party or trademarked assets (DESIGN_GUIDELINES).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 32 32'
      className={cn('h-8 w-8', className)}
      role='img'
      aria-label='TACT AI'
    >
      <rect width='32' height='32' rx='9' className='fill-primary' />
      {/* connecting links */}
      <path
        d='M11 12.5 16 20 21 12.5'
        className='stroke-primary-fg'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
        opacity='0.55'
      />
      {/* three team nodes */}
      <circle cx='11' cy='11.5' r='2.6' className='fill-primary-fg' />
      <circle cx='21' cy='11.5' r='2.6' className='fill-primary-fg' />
      <circle cx='16' cy='21' r='2.6' className='fill-primary-fg' />
    </svg>
  );
}

export function BrandLogo({
  markOnly = false,
  className,
  variant = 'dark',
}: BrandLogoProps) {
  return (
    <span className='inline-flex items-center gap-2.5'>
      <BrandMark className={className} />
      {markOnly ? null : (
        <span
          className={cn(
            'text-lg font-semibold tracking-tight',
            variant === 'light' ? 'text-primary-fg' : 'text-fg',
          )}
        >
          TACT<span className='font-medium opacity-70'> AI</span>
        </span>
      )}
    </span>
  );
}
