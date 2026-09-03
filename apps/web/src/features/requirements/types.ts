export interface CreateRequirementInput {
  roleName: string;
  headcount: number;
  allocationPercent: number;
  description?: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

export interface UpdateRequirementInput extends CreateRequirementInput {
  requirementId: string;
  version: number;
}
