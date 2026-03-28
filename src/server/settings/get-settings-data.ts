import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/server/supabase-server";
import type { SettingsResponse } from "@/features/settings/types/settings";
import { logServerError } from "@/server/observability/log-server-error";

export function getDefaultSettings(): SettingsResponse {
  return {
    profile: {
      fullName: "",
      email: "",
      region: "United States",
      timezone: "America/New_York",
    },
    subscription: {
      plan: "free",
      status: "active",
      billingInterval: null,
      currentPeriodEnd: null,
    },
    preferences: {
      compactTableDensity: true,
      riskHeatmapOverlay: true,
      preMarketReminder: false,
    },
    notifications: {
      priceAlerts: true,
      scoreUpdateDigest: true,
      earningsCalendarUpdates: false,
    },
    security: {
      mfaEnabled: false,
      lastPasswordChangedAt: null,
      activeSessions: null,
    },
    apiAccess: {
      activeTokens: 0,
    },
  };
}

export async function getSettingsData(userId: string): Promise<SettingsResponse> {
  if (!hasServerSupabaseEnv()) {
    return getDefaultSettings();
  }

  try {
    const supabase = createServerSupabaseClient();

    const [profileResult, subscriptionResult, preferencesResult, securityResult, tokenResult] = await Promise.all([
      supabase.from("user_profiles").select("full_name, email, region, timezone").eq("user_id", userId).maybeSingle(),
      supabase
        .from("user_subscriptions")
        .select("plan_code, plan_status, billing_interval, current_period_end")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_preferences")
        .select(
          "compact_table_density, risk_heatmap_overlay, pre_market_reminder, price_alerts, score_update_digest, earnings_calendar_updates",
        )
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_security_state")
        .select("mfa_enabled, last_password_changed_at")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_api_tokens")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("revoked_at", null),
    ]);

    const defaults = getDefaultSettings();

    return {
      profile: {
        fullName: profileResult.data?.full_name ?? defaults.profile.fullName,
        email: profileResult.data?.email ?? defaults.profile.email,
        region: profileResult.data?.region ?? defaults.profile.region,
        timezone: profileResult.data?.timezone ?? defaults.profile.timezone,
      },
      subscription: {
        plan: subscriptionResult.data?.plan_code ?? defaults.subscription.plan,
        status: subscriptionResult.data?.plan_status ?? defaults.subscription.status,
        billingInterval: subscriptionResult.data?.billing_interval ?? defaults.subscription.billingInterval,
        currentPeriodEnd: subscriptionResult.data?.current_period_end ?? defaults.subscription.currentPeriodEnd,
      },
      preferences: {
        compactTableDensity:
          preferencesResult.data?.compact_table_density ?? defaults.preferences.compactTableDensity,
        riskHeatmapOverlay: preferencesResult.data?.risk_heatmap_overlay ?? defaults.preferences.riskHeatmapOverlay,
        preMarketReminder: preferencesResult.data?.pre_market_reminder ?? defaults.preferences.preMarketReminder,
      },
      notifications: {
        priceAlerts: preferencesResult.data?.price_alerts ?? defaults.notifications.priceAlerts,
        scoreUpdateDigest: preferencesResult.data?.score_update_digest ?? defaults.notifications.scoreUpdateDigest,
        earningsCalendarUpdates:
          preferencesResult.data?.earnings_calendar_updates ?? defaults.notifications.earningsCalendarUpdates,
      },
      security: {
        mfaEnabled: securityResult.data?.mfa_enabled ?? defaults.security.mfaEnabled,
        lastPasswordChangedAt:
          securityResult.data?.last_password_changed_at ?? defaults.security.lastPasswordChangedAt,
        activeSessions: defaults.security.activeSessions,
      },
      apiAccess: {
        activeTokens: tokenResult.count ?? defaults.apiAccess.activeTokens,
      },
    };
  } catch (error) {
    logServerError("settings.getSettingsData", error, { userId });
    return getDefaultSettings();
  }
}

export async function upsertSettingsData(
  userId: string,
  input: {
    profile?: Partial<SettingsResponse["profile"]>;
    preferences?: Partial<SettingsResponse["preferences"]>;
    notifications?: Partial<SettingsResponse["notifications"]>;
  },
): Promise<void> {
  if (!hasServerSupabaseEnv()) {
    return;
  }

  const supabase = createServerSupabaseClient();

  if (input.profile) {
    const profilePayload: Record<string, unknown> = {};
    if (input.profile.fullName !== undefined) profilePayload.full_name = input.profile.fullName;
    if (input.profile.email !== undefined) profilePayload.email = input.profile.email;
    if (input.profile.region !== undefined) profilePayload.region = input.profile.region;
    if (input.profile.timezone !== undefined) profilePayload.timezone = input.profile.timezone;

    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProfile) {
      if (Object.keys(profilePayload).length > 0) {
        await supabase.from("user_profiles").update(profilePayload).eq("user_id", userId);
      }
    } else {
      await supabase.from("user_profiles").insert({ user_id: userId, ...profilePayload });
    }
  }

  if (input.preferences || input.notifications) {
    const preferencePayload: Record<string, unknown> = {};
    if (input.preferences?.compactTableDensity !== undefined) {
      preferencePayload.compact_table_density = input.preferences.compactTableDensity;
    }
    if (input.preferences?.riskHeatmapOverlay !== undefined) {
      preferencePayload.risk_heatmap_overlay = input.preferences.riskHeatmapOverlay;
    }
    if (input.preferences?.preMarketReminder !== undefined) {
      preferencePayload.pre_market_reminder = input.preferences.preMarketReminder;
    }
    if (input.notifications?.priceAlerts !== undefined) {
      preferencePayload.price_alerts = input.notifications.priceAlerts;
    }
    if (input.notifications?.scoreUpdateDigest !== undefined) {
      preferencePayload.score_update_digest = input.notifications.scoreUpdateDigest;
    }
    if (input.notifications?.earningsCalendarUpdates !== undefined) {
      preferencePayload.earnings_calendar_updates = input.notifications.earningsCalendarUpdates;
    }

    const { data: existingPreferences } = await supabase
      .from("user_preferences")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingPreferences) {
      if (Object.keys(preferencePayload).length > 0) {
        await supabase.from("user_preferences").update(preferencePayload).eq("user_id", userId);
      }
    } else {
      await supabase.from("user_preferences").insert({ user_id: userId, ...preferencePayload });
    }
  }
}
