import { cn } from '@/utils/cn';

type AvatarState = 'idle' | 'thinking';

interface AssistantAvatarProps {
  /** Visual size in pixels (width & height). */
  size?: number;
  /** 'thinking' adds an active pulse + orbit; 'idle' gently floats. */
  state?: AvatarState;
  /** Suppress the ambient float (e.g. inline next to a message). */
  still?: boolean;
  className?: string;
}

/**
 * "Tia" — the TACT AI companion. An original, premium mascot: a luminous green
 * orb with a calm face and a gold spark, wrapped in a soft glow and an orbiting
 * particle. Purely original artwork; motion is transform/opacity only and stops
 * under prefers-reduced-motion (DESIGN_GUIDELINES section 8).
 */
export function AssistantAvatar({
  size = 64,
  state = 'idle',
  still = false,
  className,
}: AssistantAvatarProps) {
  const isThinking = state === 'thinking';

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center',
        !still && 'animate-float',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Ambient glow */}
      <span
        className={cn(
          'absolute inset-0 rounded-full bg-primary/30 blur-xl transition-opacity',
          isThinking ? 'animate-pulse opacity-80' : 'opacity-50',
        )}
      />

      {/* Orbiting particle */}
      <span
        className='absolute inset-0'
        style={{
          animation: isThinking
            ? 'tia-orbit 3.5s linear infinite'
            : 'tia-orbit 9s linear infinite',
        }}
      >
        <span className='absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent-gold shadow-[0_0_8px_2px_rgba(198,161,91,0.6)]' />
      </span>

      <svg
        viewBox='0 0 64 64'
        className='relative'
        style={{ width: size, height: size }}
        role='img'
        aria-label='TACT AI assistant'
      >
        <defs>
          <radialGradient id='tia-body' cx='38%' cy='32%' r='75%'>
            <stop offset='0%' stopColor='#3fa57b' />
            <stop offset='55%' stopColor='#00754a' />
            <stop offset='100%' stopColor='#0e4a34' />
          </radialGradient>
          <linearGradient id='tia-ring' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#3fa57b' />
            <stop offset='100%' stopColor='#0e4a34' />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle
          cx='32'
          cy='32'
          r='29'
          fill='none'
          stroke='url(#tia-ring)'
          strokeWidth='1.5'
          opacity='0.4'
        />

        {/* Body */}
        <circle cx='32' cy='32' r='24' fill='url(#tia-body)' />

        {/* Glossy highlight */}
        <ellipse cx='25' cy='23' rx='9' ry='6' fill='#ffffff' opacity='0.18' />

        {/* Eyes */}
        <g fill='#ffffff'>
          <circle cx='26' cy='33' r='2.6' opacity='0.95'>
            {isThinking ? (
              <animate
                attributeName='r'
                values='2.6;0.6;2.6'
                dur='2.4s'
                repeatCount='indefinite'
              />
            ) : null}
          </circle>
          <circle cx='38' cy='33' r='2.6' opacity='0.95'>
            {isThinking ? (
              <animate
                attributeName='r'
                values='2.6;0.6;2.6'
                dur='2.4s'
                begin='0.1s'
                repeatCount='indefinite'
              />
            ) : null}
          </circle>
        </g>

        {/* Calm smile */}
        <path
          d='M27 40c1.6 1.8 3.2 2.6 5 2.6s3.4-.8 5-2.6'
          fill='none'
          stroke='#ffffff'
          strokeWidth='1.8'
          strokeLinecap='round'
          opacity='0.85'
        />

        {/* Gold spark */}
        <path
          d='M46 18l1.3 3.2L50.5 22.5l-3.2 1.3L46 27l-1.3-3.2L41.5 22.5l3.2-1.3z'
          fill='#c6a15b'
        />
      </svg>
    </span>
  );
}
