import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NotificationListView } from '@/features/notifications/components/NotificationListView';
import type { Notification } from '@/features/notifications/types';

function makeNotification(overrides?: Partial<Notification>): Notification {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    type: 'ticket_blocked',
    title: 'A ticket is blocked',
    body: 'Wire up charts is blocked.',
    link: '/tickets',
    is_read: false,
    read_at: null,
    created_at: '2026-09-14T08:00:00.000Z',
    ...overrides,
  };
}

describe('NotificationListView', () => {
  it('renders the title, body, and a mark-read action for unread items', () => {
    render(
      <NotificationListView
        notifications={[makeNotification()]}
        onMarkRead={vi.fn()}
      />,
    );

    expect(screen.getByText('A ticket is blocked')).toBeInTheDocument();
    expect(screen.getByText('Wire up charts is blocked.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mark read' }),
    ).toBeInTheDocument();
  });

  it('hides the mark-read action for already-read items', () => {
    render(
      <NotificationListView
        notifications={[
          makeNotification({
            is_read: true,
            read_at: '2026-09-14T09:00:00.000Z',
          }),
        ]}
        onMarkRead={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Mark read' }),
    ).not.toBeInTheDocument();
  });

  it('calls onMarkRead with the notification id when clicked', async () => {
    const onMarkRead = vi.fn();
    render(
      <NotificationListView
        notifications={[makeNotification()]}
        onMarkRead={onMarkRead}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Mark read' }));

    expect(onMarkRead).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000001',
    );
  });
});
