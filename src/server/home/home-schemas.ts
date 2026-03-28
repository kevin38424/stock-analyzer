import { z } from "zod";

export const homeQuerySchema = z.object({
  includeWatchlist: z.coerce.boolean().default(true),
  userId: z.string().uuid().nullable().default(null),
});
