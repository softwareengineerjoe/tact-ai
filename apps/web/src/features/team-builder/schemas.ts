import { z } from 'zod';

export const AssignmentStatusSchema = z.enum([
  'recommended',
  'reserved',
  'pending_approval',
  'confirmed',
  'active',
  'ended',
  'rejected',
  'expired',
  'declined',
  'cancelled',
]);

export const RoleRequirementSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  project_id: z.string().uuid(),
  role_name: z.string(),
  headcount: z.number().int(),
  allocation_percent: z.number().int(),
  description: z.string().nullable(),
  required_skills: z.array(z.string()),
  preferred_skills: z.array(z.string()),
  version: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const RoleRequirementListSchema = z.array(RoleRequirementSchema);

export const RecommendationCandidateSchema = z.object({
  employee_id: z.string().uuid(),
  display_name: z.string(),
  role_requirement_id: z.string().uuid(),
  project_fit_score: z.number().int(),
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  remaining_capacity_percent: z.number().int(),
  data_freshness: z.string().datetime().nullable(),
  warnings: z.array(z.string()),
  recommendation_reason: z.string(),
  supervisor_name: z.string().nullable(),
});

export const RecommendationListSchema = z.array(RecommendationCandidateSchema);

export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  project_id: z.string().uuid(),
  role_requirement_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  status: AssignmentStatusSchema,
  allocation_percent: z.number().int(),
  start_date: z.string().datetime().nullable(),
  end_date: z.string().datetime().nullable(),
  expires_at: z.string().datetime().nullable(),
  override_reason: z.string().nullable(),
  version: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  employee_display_name: z.string().nullable(),
  supervisor_name: z.string().nullable(),
});

export const AssignmentListSchema = z.array(AssignmentSchema);

export const AssignmentCreateResultSchema = z.object({
  assignment: AssignmentSchema,
  warnings: z.array(z.string()),
});
