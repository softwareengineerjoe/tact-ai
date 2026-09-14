export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (unreadOnly: boolean) =>
    [...notificationKeys.lists(), { unreadOnly }] as const,
};
