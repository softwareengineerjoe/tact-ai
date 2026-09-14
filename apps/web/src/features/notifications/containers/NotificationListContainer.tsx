import { useState } from 'react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  toast,
} from '@/components/shared';
import { useMarkNotificationRead } from '../api/useMarkNotificationRead';
import { useNotifications } from '../api/useNotifications';
import { NotificationListView } from '../components/NotificationListView';

/**
 * Owns the notifications lifecycle: loading / error / empty / success plus the
 * mark-read mutation with visible success/error feedback (MASTER FR-018).
 */
export function NotificationListContainer() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isPending, isError, error, refetch } =
    useNotifications(unreadOnly);
  const markRead = useMarkNotificationRead();

  if (isPending) {
    return (
      <LoadingState label='Loading notifications' variant='skeleton' rows={5} />
    );
  }
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const handleMarkRead = (id: string) => {
    markRead.mutate(id, {
      onSuccess: () => toast.success('Notification marked as read'),
      onError: (mutationError) => toast.error(mutationError.message),
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <p className='text-sm text-fg-muted'>
          {data.unread_count} unread of {data.total}
        </p>
        <div className='flex items-center gap-2'>
          <FilterButton
            label='All'
            isActive={!unreadOnly}
            onClick={() => setUnreadOnly(false)}
          />
          <FilterButton
            label='Unread'
            isActive={unreadOnly}
            onClick={() => setUnreadOnly(true)}
          />
        </div>
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          title={
            unreadOnly ? 'No unread notifications' : 'No notifications yet'
          }
          description="You're all caught up."
        />
      ) : (
        <NotificationListView
          notifications={data.items}
          onMarkRead={handleMarkRead}
          pendingId={markRead.isPending ? markRead.variables : undefined}
        />
      )}
    </div>
  );
}

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={isActive}
      className={
        isActive
          ? 'rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg'
          : 'rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted'
      }
    >
      {label}
    </button>
  );
}
