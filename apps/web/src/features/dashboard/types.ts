import type { z } from 'zod';

import type { DashboardSchema } from './schemas';

export type Dashboard = z.infer<typeof DashboardSchema>;
