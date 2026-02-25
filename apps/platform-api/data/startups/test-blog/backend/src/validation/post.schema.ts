
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string(),
  body: z.string(),
  slug: z.string(),
  publishedDate: z.string(),
});

export const updatePostSchema = createPostSchema.partial();
