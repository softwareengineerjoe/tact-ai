import { useMemo } from 'react';

import { useHasPermission } from '@/hooks/usePermissions';
import { TOUR_STEPS, type TourStep } from './steps';

/**
 * The tour steps the current role can actually use. Steps gated by a permission
 * the caller lacks are dropped so the tour never points at a hidden feature.
 */
export function useTourSteps(): readonly TourStep[] {
  const hasPermission = useHasPermission();
  return useMemo(
    () =>
      TOUR_STEPS.filter(
        (step) => !step.permission || hasPermission(step.permission),
      ),
    [hasPermission],
  );
}
