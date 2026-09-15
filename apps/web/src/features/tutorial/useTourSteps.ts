import { useMemo } from 'react';

import { getActiveDemoRole, getDemoRoleLabel } from '@/app/auth/demoRole';
import { useHasPermission } from '@/hooks/usePermissions';
import {
  TOUR_STEPS,
  buildFinishStep,
  buildWelcomeStep,
  type TourStep,
} from './steps';

/**
 * The tour steps the current role can actually use. Steps gated by a permission
 * the caller lacks are dropped so the tour never points at a hidden feature, and
 * the opening/closing steps are framed around the active demo role so the
 * visitor always knows which persona they're exploring.
 */
export function useTourSteps(): readonly TourStep[] {
  const hasPermission = useHasPermission();
  return useMemo(() => {
    const roleKey = getActiveDemoRole();
    const roleLabel = getDemoRoleLabel(roleKey);
    return TOUR_STEPS.filter(
      (step) => !step.permission || hasPermission(step.permission),
    ).map((step) => {
      if (step.id === 'welcome') return buildWelcomeStep(roleKey, roleLabel);
      if (step.id === 'finish') return buildFinishStep(roleLabel);
      return step;
    });
  }, [hasPermission]);
}
