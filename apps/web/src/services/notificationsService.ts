import { request } from '@/services/httpClient';
import {
  NotificationListSchema,
  NotificationSchema,
} from '@/features/notifications/schemas';

export const notificationsService = {
  list: (unreadOnly: boolean, signal?: AbortSignal) =>
    request(
      `/notifications?unread_only=${unreadOnly ? 'true' : 'false'}`,
      NotificationListSchema,
      { signal },
    ),

  markRead: (notificationId: string) =>
    request(`/notifications/${notificationId}/read`, NotificationSchema, {
      method: 'POST',
    }),
};
