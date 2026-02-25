
import { z } from "zod";

export const createCustomerSchema = z.object({
  companyName: z.string(),
  contactEmail: z.string(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
