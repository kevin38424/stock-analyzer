import { z } from "zod";

export const settingsQuerySchema = z.object({
  userId: z.string().uuid().nullable().default(null),
});

export const settingsPatchSchema = z.object({
  profile: z
    .object({
      fullName: z.string().max(120).optional(),
      email: z.string().email().max(180).optional(),
      region: z.string().max(120).optional(),
      timezone: z.string().max(80).optional(),
    })
    .optional(),
  preferences: z
    .object({
      compactTableDensity: z.boolean().optional(),
      riskHeatmapOverlay: z.boolean().optional(),
      preMarketReminder: z.boolean().optional(),
    })
    .optional(),
  notifications: z
    .object({
      priceAlerts: z.boolean().optional(),
      scoreUpdateDigest: z.boolean().optional(),
      earningsCalendarUpdates: z.boolean().optional(),
    })
    .optional(),
});
