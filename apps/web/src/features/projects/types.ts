import type { z } from 'zod';

import type {
  CreateProjectSchema,
  ProjectListSchema,
  ProjectPrioritySchema,
  ProjectSchema,
  ProjectStatusSchema,
} from './schemas';

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectList = z.infer<typeof ProjectListSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type ProjectPriority = z.infer<typeof ProjectPrioritySchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  status?: ProjectStatus;
  search?: string;
}

export interface UpdateProjectInput {
  startDate: string | null;
  targetEndDate: string | null;
  expectedTeamSize: number | null;
  version: number;
}

export interface UpdateProjectDetailsInput {
  name: string;
  description: string | null;
  businessObjective: string | null;
  priority: ProjectPriority;
  version: number;
}
