import type { z } from 'zod';

import type {
  AssignmentSchema,
  AssignmentCreateResultSchema,
  RecommendationCandidateSchema,
  RoleRequirementSchema,
} from './schemas';

export type RoleRequirement = z.infer<typeof RoleRequirementSchema>;
export type RecommendationCandidate = z.infer<
  typeof RecommendationCandidateSchema
>;
export type Assignment = z.infer<typeof AssignmentSchema>;
export type AssignmentCreateResult = z.infer<
  typeof AssignmentCreateResultSchema
>;

export interface RecommendationParams {
  projectId: string;
  roleRequirementId: string;
  periodStart: string;
  periodEnd: string;
  limit?: number;
}

export interface ReserveInput {
  projectId: string;
  roleRequirementId: string;
  employeeId: string;
  allocationPercent: number;
  expiresAt: string;
}

export interface AssignInput {
  projectId: string;
  roleRequirementId: string;
  employeeId: string;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  overrideReason?: string;
}

export interface RemoveInput {
  projectId: string;
  assignmentId: string;
  version: number;
}
