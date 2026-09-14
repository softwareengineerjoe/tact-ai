import { useQuery } from '@tanstack/react-query';

import { notificationsService } from '@/services/notificationsService';
import type { ApiError } from '@/services/httpClient';
import type { NotificationList } from '@/features/notifications/types';
import { notificationKeys } from './notificationKeys';

/** List the current user's in-app notifications (MASTER FR-018). */
export function useNotifications(unreadOnly: boolean) {
  return useQuery<NotificationList, ApiError>({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: ({ signal }) => notificationsService.list(unreadOnly, signal),
    staleTime: 15_000,
  });
}
