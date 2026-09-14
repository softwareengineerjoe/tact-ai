import type { z } from 'zod';

import type { WeeklyStatusReportSchema } from './schemas';

export type WeeklyStatusReport = z.infer<typeof WeeklyStatusReportSchema>;
