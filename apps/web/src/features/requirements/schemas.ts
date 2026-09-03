import { z } from 'zod';

export const RequirementFormSchema = z.object({
  roleName: z.string().min(1, 'Role name is required').max(160),
  headcount: z.coerce.number().int().min(1, 'At least 1 person').max(99),
  allocationPercent: z.coerce.number().int().min(0).max(100),
  description: z.string().max(2000).optional(),
  requiredSkills: z.array(z.string().min(1)),
  preferredSkills: z.array(z.string().min(1)),
});

export type RequirementFormValues = z.infer<typeof RequirementFormSchema>;
