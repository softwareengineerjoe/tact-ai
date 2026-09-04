export const assistantKeys = {
  all: ['assistant'] as const,
  sessions: () => [...assistantKeys.all, 'session'] as const,
  session: (sessionId: string) =>
    [...assistantKeys.sessions(), sessionId] as const,
};
