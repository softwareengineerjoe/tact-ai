export const reportKeys = {
  all: ['reports'] as const,
  weeklyStatus: (projectId: string) =>
    [...reportKeys.all, 'weekly-status', projectId] as const,
};
