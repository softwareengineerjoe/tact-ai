export const feedbackKeys = {
  all: ['feedback'] as const,
  lists: () => [...feedbackKeys.all, 'list'] as const,
  project: (projectId: string) => [...feedbackKeys.lists(), projectId] as const,
};
