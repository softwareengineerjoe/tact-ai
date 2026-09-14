export const memberDashboardKeys = {
  all: ['member-dashboard'] as const,
  detail: (employeeId: string) =>
    [...memberDashboardKeys.all, employeeId] as const,
};
