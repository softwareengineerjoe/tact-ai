import { useEffect, useRef } from 'react';

import {
  consumeTutorialStartRequest,
  hasCompletedTutorial,
  useTutorialStore,
} from '@/stores/tutorialStore';

import { useTourSteps } from '../useTourSteps';

/**
 * Top-bar control that starts the guided tour, and auto-launches it for
 * first-time visitors or when entering the demo from the landing page. Placed
 * in the app header; can be clicked anytime to replay the tour.
 */
export function TourLauncher() {
  const start = useTutorialStore((s) => s.start);
  const isActive = useTutorialStore((s) => s.isActive);
  const steps = useTourSteps();
  const autoStarted = useRef(false);

  // Auto-start: explicitly requested from the landing page, or first-ever visit.
  useEffect(() => {
    if (autoStarted.current || steps.length === 0) return;
    autoStarted.current = true;
    const requested = consumeTutorialStartRequest();
    if (requested || !hasCompletedTutorial()) {
      start(steps.length);
    }
  }, [steps.length, start]);

  return (
    <button
      type='button'
      data-tour='tour-launcher'
      onClick={() => start(steps.length)}
      disabled={isActive}
      className='inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm font-medium text-fg-body transition-colors hover:border-primary/40 hover:bg-primary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-1 disabled:opacity-50 sm:px-3'
    >
      <CompassIcon className='h-4 w-4 text-primary' aria-hidden />
      <span className='hidden sm:inline'>Take a tour</span>
    </button>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <circle cx='12' cy='12' r='9' />
      <path d='m15.5 8.5-2 5-5 2 2-5z' />
    </svg>
  );
}
