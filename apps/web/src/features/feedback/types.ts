import type { z } from 'zod';

import type {
  FeedbackCategorySchema,
  FeedbackSchema,
  FeedbackStatusSchema,
  FeedbackVisibilitySchema,
} from './schemas';

export type Feedback = z.infer<typeof FeedbackSchema>;
export type FeedbackCategory = z.infer<typeof FeedbackCategorySchema>;
export type FeedbackVisibility = z.infer<typeof FeedbackVisibilitySchema>;
export type FeedbackStatus = z.infer<typeof FeedbackStatusSchema>;

export interface CreateFeedbackInput {
  projectId: string;
  employeeId: string;
  category: FeedbackCategory;
  visibility: FeedbackVisibility;
  body: string;
}

export interface AcknowledgeFeedbackInput {
  feedbackId: string;
  projectId: string;
}
