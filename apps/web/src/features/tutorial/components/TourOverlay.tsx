import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useTutorialStore } from '@/stores/tutorialStore';
import { cn } from '@/utils/cn';

import type { StepPlacement } from '../steps';
import { useTourSteps } from '../useTourSteps';

const CARD_WIDTH = 340;
const CARD_MARGIN = 16;

/**
 * The guided tutorial overlay: dims the app, spotlights the element for the
 * current step, and shows an explanatory card with Back / Next / Skip. It
 * navigates the router so the described feature is on screen as it's explained.
 * Rendered once in the app shell; inert unless the tour is active.
 */
export function TourOverlay() {
  const isActive = useTutorialStore((s) => s.isActive);
  const stepIndex = useTutorialStore((s) => s.stepIndex);
  const next = useTutorialStore((s) => s.next);
  const prev = useTutorialStore((s) => s.prev);
  const stop = useTutorialStore((s) => s.stop);

  const steps = useTourSteps();
  const step = steps[stepIndex];
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardHeight, setCardHeight] = useState(300);

  // Navigate to the step's route so the feature is visible while explained.
  useEffect(() => {
    if (!isActive || !step?.route) return;
    if (step.route !== location.pathname) navigate(step.route);
  }, [isActive, step, location.pathname, navigate]);

  // Measure the spotlight target, retrying briefly while the route renders.
  useEffect(() => {
    if (!isActive) {
      setRect(null);
      return;
    }
    let raf = 0;
    let tries = 0;
    const measure = () => {
      if (!step?.target) {
        setRect(null);
        return;
      }
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else if (tries < 30) {
        tries += 1;
        raf = requestAnimationFrame(measure);
      } else {
        setRect(null);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [isActive, step, location.pathname]);

  // Focus the card and wire keyboard controls each step.
  useEffect(() => {
    if (!isActive) return;
    cardRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stop();
      else if (event.key === 'ArrowRight' || event.key === 'Enter') next();
      else if (event.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, stepIndex, next, prev, stop]);

  // Measure the card so it can be positioned fully on-screen (its height varies
  // with body length). Re-measures whenever the step or spotlight changes.
  useLayoutEffect(() => {
    if (!isActive) return;
    const height = cardRef.current?.offsetHeight;
    if (height && height !== cardHeight) setCardHeight(height);
  }, [isActive, stepIndex, rect, cardHeight]);

  if (!isActive || !step) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const placement: StepPlacement = step.placement ?? 'auto';
  const useCenter = placement === 'center' || rect === null;
  const cardStyle = useCenter
    ? undefined
    : positionCard(rect, placement, cardHeight);
  const pad = 6;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
    >
      {/* Spotlight or full dim. The cut-out uses a large box-shadow ring. */}
      {rect && !useCenter ? (
        <div
          aria-hidden
          className='pointer-events-none absolute rounded-lg ring-[3px] ring-white ring-offset-2 ring-offset-primary/50 transition-all duration-200'
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow:
              '0 0 0 9999px rgba(6, 30, 22, 0.96), 0 0 0 4px rgba(255, 255, 255, 0.95), 0 0 32px 10px rgba(63, 165, 123, 0.7)',
          }}
        />
      ) : (
        <div aria-hidden className='absolute inset-0 bg-[rgba(6,30,22,0.96)]' />
      )}

      {/* Blocks interaction with the app behind the tour; inert by design so a
          stray click never ends the tour (use Skip or Esc for that). */}
      <div aria-hidden className='absolute inset-0' />

      {/* Step card */}
      <div
        ref={cardRef}
        tabIndex={-1}
        aria-labelledby='tour-title'
        className={cn(
          'animate-scale-in w-[340px] max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface p-5 shadow-lg focus:outline-none',
          useCenter ? 'relative' : 'absolute',
        )}
        style={cardStyle}
      >
        <div className='flex items-center justify-between gap-3'>
          <span className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary'>
            <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-primary' />
            Guided tour
          </span>
          <span className='text-xs font-medium text-fg-muted'>
            {stepIndex + 1} / {steps.length}
          </span>
        </div>

        <h2 id='tour-title' className='mt-2 text-lg font-semibold text-fg'>
          {step.title}
        </h2>
        <p className='mt-1.5 text-sm leading-relaxed text-fg-muted'>
          {step.body}
        </p>

        {/* Progress */}
        <div
          className='mt-4 h-1 w-full overflow-hidden rounded-full bg-surface-muted'
          aria-hidden
        >
          <div
            className='h-full rounded-full bg-primary transition-all duration-300'
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className='mt-4 flex items-center justify-between gap-2'>
          <button
            type='button'
            onClick={() => stop()}
            className='rounded-md px-2.5 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg-body focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover'
          >
            Skip
          </button>
          <div className='flex items-center gap-2'>
            {!isFirst ? (
              <button
                type='button'
                onClick={() => prev()}
                className='rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover'
              >
                Back
              </button>
            ) : null}
            <button
              type='button'
              onClick={() => next()}
              className='rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Position the card next to the spotlight, clamped fully inside the viewport. */
function positionCard(
  rect: DOMRect,
  placement: StepPlacement,
  cardHeight: number,
): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const height = Math.min(cardHeight, vh - CARD_MARGIN * 2);

  const side =
    placement === 'right' || placement === 'bottom'
      ? placement
      : rect.left < 360
        ? 'right'
        : 'bottom';

  let left: number;
  let top: number;
  if (side === 'right') {
    left = rect.right + CARD_MARGIN;
    top = rect.top;
  } else {
    left = rect.left;
    top = rect.bottom + CARD_MARGIN;
  }

  // If the card would overflow the bottom, place it above the target instead so
  // its actions (Back / Next) stay on-screen. Fall back to a clamped position.
  if (top + height > vh - CARD_MARGIN) {
    const aboveTop = rect.top - height - CARD_MARGIN;
    top = aboveTop >= CARD_MARGIN ? aboveTop : vh - height - CARD_MARGIN;
  }

  // Final clamp within the viewport with a small margin.
  left = Math.min(Math.max(CARD_MARGIN, left), vw - CARD_WIDTH - CARD_MARGIN);
  top = Math.min(Math.max(CARD_MARGIN, top), vh - height - CARD_MARGIN);
  return { left, top };
}
