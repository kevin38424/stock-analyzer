import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(80).optional().default(""),
  category: z.enum(["all", "stocks", "etfs", "options"]).default("all"),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  includeTrending: z.coerce.boolean().default(true),
  userId: z.string().uuid().nullable().default(null),
});
