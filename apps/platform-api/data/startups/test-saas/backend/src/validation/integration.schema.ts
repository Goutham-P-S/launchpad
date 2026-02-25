
import { z } from "zod";

export const createIntegrationSchema = z.object({
  sourceCrm: z.string(),
  destinationCrm: z.string(),
});

export const updateIntegrationSchema = createIntegrationSchema.partial();
