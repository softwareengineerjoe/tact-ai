import type { RecommendationParams } from '@/features/team-builder/types';

export const teamKeys = {
  all: ['team'] as const,
  requirements: (projectId: string) =>
    [...teamKeys.all, 'requirements', projectId] as const,
  roster: (projectId: string) =>
    [...teamKeys.all, 'roster', projectId] as const,
  recommendations: (params: RecommendationParams) =>
    [...teamKeys.all, 'recommendations', params] as const,
};
