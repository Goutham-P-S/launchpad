
import { z } from "zod";

export const createCustomerSchema = z.object({
  username: z.string(),
  email: z.string(),
  passwordHash: z.string(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
