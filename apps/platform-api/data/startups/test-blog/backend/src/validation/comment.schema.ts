
import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.string(),
  publishedDate: z.string(),
});

export const updateCommentSchema = createCommentSchema.partial();
