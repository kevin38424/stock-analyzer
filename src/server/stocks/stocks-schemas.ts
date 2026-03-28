import { z } from "zod";

export const stockDetailsQuerySchema = z.object({
  range: z.enum(["1D", "1W", "1M", "1Y", "ALL"]).default("1M"),
});
