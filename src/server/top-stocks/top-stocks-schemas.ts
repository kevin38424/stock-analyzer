import { z } from "zod";

export const topStocksQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
  favoritesOnly: z.coerce.boolean().default(false),
  minScore: z.coerce.number().min(0).max(100).default(0),
  maxScore: z.coerce.number().min(0).max(100).default(100),
  sector: z.string().default("all"),
  valuationStyle: z.enum(["growth", "value", "income"]).default("growth"),
  userId: z.string().uuid().nullable().default(null),
});
