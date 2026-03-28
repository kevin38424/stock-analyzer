import { z } from "zod";

export const marketQuotesQuerySchema = z.object({
  symbols: z.string().min(1),
  maxAgeSeconds: z.coerce.number().int().min(1).max(300).optional(),
});
