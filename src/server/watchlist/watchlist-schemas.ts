import { z } from "zod";

export const watchlistSegments = ["all_holdings", "tech_growth", "dividends", "speculative"] as const;

export const watchlistQuerySchema = z.object({
  userId: z.string().uuid().nullable().default(null),
  segment: z.enum(watchlistSegments).default("all_holdings"),
  sortBy: z
    .enum(["score_desc", "score_asc", "delta_desc", "delta_asc", "price_desc", "price_asc"])
    .default("score_desc"),
});

export const watchlistCreateSchema = z
  .object({
    userId: z.string().uuid(),
    ticker: z.string().trim().min(1).max(12).optional(),
    companyId: z.string().uuid().optional(),
    segment: z.enum(watchlistSegments).default("all_holdings"),
    thesis: z.string().trim().max(600).optional(),
  })
  .refine((data) => Boolean(data.ticker || data.companyId), {
    message: "Either ticker or companyId is required.",
  });

export const watchlistPatchSchema = z
  .object({
    userId: z.string().uuid(),
    ticker: z.string().trim().min(1).max(12).optional(),
    companyId: z.string().uuid().optional(),
    segment: z.enum(watchlistSegments).optional(),
    thesis: z.string().trim().max(600).nullable().optional(),
  })
  .refine((data) => Boolean(data.ticker || data.companyId), {
    message: "Either ticker or companyId is required.",
  })
  .refine((data) => data.segment !== undefined || data.thesis !== undefined, {
    message: "At least one field to update is required.",
  });

export const watchlistDeleteSchema = z
  .object({
    userId: z.string().uuid(),
    ticker: z.string().trim().min(1).max(12).optional(),
    companyId: z.string().uuid().optional(),
  })
  .refine((data) => Boolean(data.ticker || data.companyId), {
    message: "Either ticker or companyId is required.",
  });
