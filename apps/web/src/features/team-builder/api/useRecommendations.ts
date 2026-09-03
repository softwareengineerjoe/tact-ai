import { useQuery } from '@tanstack/react-query';

import { teamService } from '@/services/teamService';
import type { ApiError } from '@/services/httpClient';
import type {
  RecommendationCandidate,
  RecommendationParams,
} from '@/features/team-builder/types';
import { teamKeys } from './teamKeys';

/**
 * Runs the deterministic Project Fit Score engine (MASTER FR-009). Enabled only
 * once a role requirement is selected. The POST reads authorized data; the score
 * is computed server-side.
 */
export function useRecommendations(params: RecommendationParams | null) {
  return useQuery<RecommendationCandidate[], ApiError>({
    queryKey: teamKeys.recommendations(
      params ?? {
        projectId: '',
        roleRequirementId: '',
        periodStart: '',
        periodEnd: '',
      },
    ),
    queryFn: ({ signal }) => teamService.recommend(params!, signal),
    enabled: params !== null,
    staleTime: 30_000,
  });
}
