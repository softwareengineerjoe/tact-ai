import type {
  FeedbackCategory,
  FeedbackStatus,
  FeedbackVisibility,
} from '@/features/feedback/types';

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  recognition: 'Recognition',
  strength: 'Strength',
  improvement_area: 'Improvement area',
  coaching: 'Coaching',
  project_contribution: 'Project contribution',
  follow_up: 'Follow-up',
};

export const FEEDBACK_VISIBILITY_LABELS: Record<FeedbackVisibility, string> = {
  manager_only: 'Manager only',
  manager_and_employee: 'Manager and employee',
  project_leadership: 'Project leadership',
  hr_partner: 'HR partner',
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  shared: 'Shared',
  acknowledged: 'Acknowledged',
  closed: 'Closed',
};
