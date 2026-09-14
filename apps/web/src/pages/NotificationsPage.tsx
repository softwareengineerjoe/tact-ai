import { PageHeader } from '@/components/shared';
import { BellIcon } from '@/components/icons';
import { NotificationListContainer } from '@/features/notifications';

export function NotificationsPage() {
  return (
    <main aria-labelledby='notifications-title'>
      <PageHeader
        id='notifications-title'
        icon={<BellIcon className='h-5 w-5' />}
        title='Notifications'
        description='In-app alerts about your projects, tickets, and team.'
      />
      <NotificationListContainer />
    </main>
  );
}
