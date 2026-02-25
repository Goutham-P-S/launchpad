
import { z } from "zod";

export const createDataSyncSchema = z.object({
  status: z.string(),
  startTime: z.string(),
});

export const updateDataSyncSchema = createDataSyncSchema.partial();
