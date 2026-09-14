import type { Notification } from '@/features/notifications/types';

interface NotificationListViewProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  pendingId?: string;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Presentational list of in-app notifications (MASTER FR-018). Pure. */
export function NotificationListView({
  notifications,
  onMarkRead,
  pendingId,
}: NotificationListViewProps) {
  return (
    <ul className='space-y-2'>
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className='flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-4 shadow-xs'
        >
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              {!notification.is_read ? (
                <span
                  aria-hidden
                  className='h-2 w-2 shrink-0 rounded-full bg-primary'
                />
              ) : null}
              <p className='font-medium text-fg'>{notification.title}</p>
              {!notification.is_read ? (
                <span className='sr-only'>Unread</span>
              ) : null}
            </div>
            {notification.body ? (
              <p className='mt-1 text-sm text-fg-muted'>{notification.body}</p>
            ) : null}
            <p className='mt-1 text-xs text-fg-muted'>
              {formatWhen(notification.created_at)}
            </p>
          </div>
          {!notification.is_read ? (
            <button
              type='button'
              onClick={() => onMarkRead(notification.id)}
              disabled={pendingId === notification.id}
              className='shrink-0 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg-body transition-colors hover:bg-surface-muted disabled:opacity-60'
            >
              {pendingId === notification.id ? 'Marking…' : 'Mark read'}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
