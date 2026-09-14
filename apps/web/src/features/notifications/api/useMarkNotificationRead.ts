import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificationsService } from '@/services/notificationsService';
import type { ApiError } from '@/services/httpClient';
import type { Notification } from '@/features/notifications/types';
import { notificationKeys } from './notificationKeys';

/** Mark a single notification as read (MASTER FR-018). */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation<Notification, ApiError, string>({
    mutationFn: (notificationId) => notificationsService.markRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
