import { z } from "zod";

export const IRv1Schema = z.object({
  kind: z.literal("workflow"),
  version: z.literal("v1"),
  flows: z.array(z.object({
    name: z.string().min(1),
    trigger: z.object({
      type: z.literal("cron"),
      everyMinutes: z.number().min(1).max(1440),
    }),
    source: z.object({
      type: z.literal("http"),
      path: z.string().startsWith("/"),
    }),
    action: z.object({
      type: z.enum(["llm-analysis", "notification"]),
      instruction: z.string().min(5),
    }),
    sink: z.object({
      type: z.enum(["platform-api", "mock-email"]),
      path: z.string().startsWith("/").optional(),
    }),
  })),
});
