import type { z } from 'zod';

import type {
  NotificationListSchema,
  NotificationSchema,
  NotificationTypeSchema,
} from './schemas';

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationList = z.infer<typeof NotificationListSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
