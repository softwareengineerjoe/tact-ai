import type {
  TicketPriority,
  TicketStatus,
  TicketType,
} from '@/features/tickets/types';

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  epic: 'Epic',
  user_story: 'User Story',
  task: 'Task',
  bug: 'Bug',
  improvement: 'Improvement',
  support_issue: 'Support Issue',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// The board columns and their order (MASTER FR-010 main flow).
export const BOARD_COLUMNS: readonly TicketStatus[] = [
  'backlog',
  'ready',
  'in_progress',
  'blocked',
  'in_review',
  'done',
];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  backlog: 'Backlog',
  ready: 'Ready',
  in_progress: 'In progress',
  blocked: 'Blocked',
  in_review: 'In review',
  done: 'Done',
  cancelled: 'Cancelled',
};

// Legal next statuses per the service state machine (kept in sync with backend).
export const ALLOWED_NEXT: Record<TicketStatus, readonly TicketStatus[]> = {
  backlog: ['ready', 'cancelled'],
  ready: ['in_progress', 'backlog', 'cancelled'],
  in_progress: ['in_review', 'blocked', 'cancelled'],
  blocked: ['in_progress', 'cancelled'],
  in_review: ['done', 'in_progress', 'cancelled'],
  done: [],
  cancelled: [],
};
