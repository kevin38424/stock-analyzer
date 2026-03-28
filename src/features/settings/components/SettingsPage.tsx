"use client";

import { Bell, Globe2, KeyRound, Loader2, ShieldCheck, UserRound, X } from "lucide-react";
import { FormEvent, type ReactNode, useMemo, useState } from "react";
import { AppSidebar, AppTopbar, appLayoutClasses, appTypographyClasses } from "@/features/shared";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { useUpdateSettings } from "@/features/settings/hooks/useUpdateSettings";
import { useUpdateProfile } from "@/features/settings/hooks/useUpdateProfile";
import { useSecurityActions } from "@/features/settings/hooks/useSecurityActions";
import { useApiTokenActions } from "@/features/settings/hooks/useApiTokenActions";
import { getMockApiTokens, type MockSettingsApiToken } from "@/features/settings/mocks/settings-mocks";
import type { SettingsResponse } from "@/features/settings/types/settings";

const settingsFallback: SettingsResponse = {
  profile: {
    fullName: "Alex Rivera",
    email: "alex.rivera@scoreengine.ai",
    region: "United States",
    timezone: "America/New_York",
  },
  subscription: {
    plan: "pro",
    status: "active",
    billingInterval: "monthly",
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
    mfaEnabled: true,
    lastPasswordChangedAt: "2026-01-25T10:00:00.000Z",
    activeSessions: 3,
  },
  apiAccess: {
    activeTokens: 2,
  },
};

type Tone = "success" | "error";

type Notice = {
  tone: Tone;
  message: string;
};

type ToggleRowProps = {
  label: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

type ModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
};

function titleCase(value: string) {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatPasswordAge(isoDate: string | null): { value: string; status: "good" | "warn" } {
  if (!isoDate) {
    return { value: "Unknown", status: "warn" };
  }

  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) {
    return { value: "Unknown", status: "warn" };
  }

  const days = Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));
  return {
    value: `${days} days ago`,
    status: days > 90 ? "warn" : "good",
  };
}

function ToggleRow({ label, description, enabled, disabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 py-4 last:border-b-0 last:pb-0">
      <div>
        <p className="text-base font-semibold text-slate-100">{label}</p>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      <button
        type="button"
        aria-pressed={enabled}
        disabled={disabled}
        onClick={onToggle}
        className={[
          "relative inline-flex h-7 w-12 items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50",
          enabled
            ? "border-cyan-300/60 bg-cyan-400/20"
            : "border-slate-700 bg-slate-800/80",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 rounded-full transition",
            enabled ? "translate-x-6 bg-cyan-300" : "translate-x-1 bg-slate-400",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function Modal({ open, title, description, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-[#081534] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const userId = process.env.NEXT_PUBLIC_SETTINGS_USER_ID ?? null;

  const { data, isLoading, isFetching, isError, error, refetch } = useSettings({ userId });
  const {
    updateSettingsAsync,
    isPending: isSaving,
  } = useUpdateSettings(userId);
  const {
    updateProfileAsync,
    isPending: isProfileSaving,
  } = useUpdateProfile(userId);
  const {
    enableMfaAsync,
    invalidateSessionsAsync,
    isPending: isSecuritySaving,
  } = useSecurityActions(userId);
  const {
    createApiTokenAsync,
    revokeApiTokenAsync,
    isPending: isTokenSaving,
  } = useApiTokenActions(userId);

  const [settingsState, setSettingsState] = useState<SettingsResponse>(settingsFallback);
  const [tokenRows, setTokenRows] = useState<MockSettingsApiToken[]>(() => getMockApiTokens());
  const [notice, setNotice] = useState<Notice | null>(null);

  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setSecurityModalOpen] = useState(false);
  const [isTokenModalOpen, setTokenModalOpen] = useState(false);

  const [profileDraft, setProfileDraft] = useState(settingsFallback.profile);
  const [tokenDraftName, setTokenDraftName] = useState("");
  const [latestPlainTextToken, setLatestPlainTextToken] = useState<string | null>(null);

  const settings = data ?? settingsState;
  const passwordAge = formatPasswordAge(settings.security.lastPasswordChangedAt);

  const activeTokenCount = useMemo(
    () => tokenRows.filter((token) => token.revokedAt == null).length,
    [tokenRows],
  );

  const isBusy = isSaving || isProfileSaving || isSecuritySaving || isTokenSaving;

  function setSuccess(message: string) {
    setNotice({ tone: "success", message });
  }

  function setFailure(message: string) {
    setNotice({ tone: "error", message });
  }

  function openProfileModal() {
    setProfileDraft(settings.profile);
    setProfileModalOpen(true);
  }

  async function applySettingsPatch(
    patch: Parameters<typeof updateSettingsAsync>[0],
    successMessage: string,
  ) {
    const previous = settings;
    const next: SettingsResponse = {
      ...settings,
      profile: patch.profile ? { ...settings.profile, ...patch.profile } : settings.profile,
      preferences: patch.preferences ? { ...settings.preferences, ...patch.preferences } : settings.preferences,
      notifications: patch.notifications ? { ...settings.notifications, ...patch.notifications } : settings.notifications,
    };

    setSettingsState(next);

    try {
      const updated = await updateSettingsAsync(patch);
      setSettingsState(updated);
      setSuccess(successMessage);
    } catch (mutationError) {
      setSettingsState(previous);
      setFailure(mutationError instanceof Error ? mutationError.message : "Unable to save settings.");
    }
  }

  async function onProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profileDraft.fullName.trim()) {
      setFailure("Full name is required.");
      return;
    }

    const previous = settings;
    setSettingsState({
      ...settings,
      profile: profileDraft,
    });

    try {
      await updateProfileAsync(profileDraft);
      setProfileModalOpen(false);
      setSuccess("Profile details updated.");
    } catch (mutationError) {
      setSettingsState(previous);
      setFailure(mutationError instanceof Error ? mutationError.message : "Unable to update profile.");
    }
  }

  async function onToggleMfa() {
    const previous = settings;
    const nextEnabled = !settings.security.mfaEnabled;

    setSettingsState({
      ...settings,
      security: {
        ...settings.security,
        mfaEnabled: nextEnabled,
      },
    });

    try {
      await enableMfaAsync(nextEnabled);
      setSuccess(nextEnabled ? "Two-factor authentication enabled." : "Two-factor authentication disabled.");
    } catch (mutationError) {
      setSettingsState(previous);
      setFailure(mutationError instanceof Error ? mutationError.message : "Unable to update MFA.");
    }
  }

  async function onInvalidateSessions() {
    const previous = settings;

    setSettingsState({
      ...settings,
      security: {
        ...settings.security,
        activeSessions: 1,
      },
    });

    try {
      await invalidateSessionsAsync();
      setSuccess("Other active sessions were signed out.");
    } catch (mutationError) {
      setSettingsState(previous);
      setFailure(mutationError instanceof Error ? mutationError.message : "Unable to invalidate sessions.");
    }
  }

  async function onCreateToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = tokenDraftName.trim();

    if (!trimmed) {
      setFailure("Token name is required.");
      return;
    }

    try {
      const created = await createApiTokenAsync({ name: trimmed, scopes: ["read"] });
      if (created && typeof created === "object" && "token" in created && created.token) {
        setTokenRows((prev) => [created.token as MockSettingsApiToken, ...prev]);
      }
      if (created && typeof created === "object" && "plainTextToken" in created) {
        setLatestPlainTextToken(String(created.plainTextToken));
      }
      setSettingsState((prev) => ({
        ...prev,
        apiAccess: {
          activeTokens: prev.apiAccess.activeTokens + 1,
        },
      }));
      setTokenDraftName("");
      setSuccess("New API token generated.");
    } catch (mutationError) {
      setFailure(mutationError instanceof Error ? mutationError.message : "Unable to generate token.");
    }
  }

  async function onRevokeToken(tokenId: string) {
    const previousTokens = tokenRows;
    const previousSettings = settings;

    setTokenRows((prev) =>
      prev.map((token) =>
        token.id === tokenId ? { ...token, revokedAt: token.revokedAt ?? new Date().toISOString() } : token,
      ),
    );
    setSettingsState({
      ...settings,
      apiAccess: {
        activeTokens: Math.max(0, settings.apiAccess.activeTokens - 1),
      },
    });

    try {
      await revokeApiTokenAsync(tokenId);
      setSuccess("API token revoked.");
    } catch (mutationError) {
      setTokenRows(previousTokens);
      setSettingsState(previousSettings);
      setFailure(mutationError instanceof Error ? mutationError.message : "Unable to revoke token.");
    }
  }

  return (
    <main className={appLayoutClasses.page}>
      <div className={appLayoutClasses.shell}>
        <AppSidebar activePage="settings" />

        <section className="flex min-h-screen flex-col">
          <AppTopbar searchPlaceholder="Search settings, alerts, or preferences..." />

          <div className={appLayoutClasses.content}>
            <div className="mb-4 min-h-[6.5rem] space-y-3">
              {isError ? (
                <div className="flex items-center justify-between rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                  <span>{error?.message ?? "Failed to load settings."}</span>
                  <button type="button" onClick={() => void refetch()} className="font-semibold text-red-100 underline">
                    Retry
                  </button>
                </div>
              ) : null}

              {notice ? (
                <div
                  className={[
                    "flex items-center justify-between rounded-lg px-4 py-3 text-sm",
                    notice.tone === "success"
                      ? "border border-emerald-500/40 bg-emerald-900/25 text-emerald-200"
                      : "border border-rose-500/50 bg-rose-950/35 text-rose-200",
                  ].join(" ")}
                >
                  <span>{notice.message}</span>
                  <button type="button" onClick={() => setNotice(null)} className="font-semibold underline">
                    Dismiss
                  </button>
                </div>
              ) : null}

              {!userId ? (
                <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                  Preview mode enabled. Interactions are backed by mock state.
                </div>
              ) : null}

              {isFetching && !isLoading ? (
                <div className="flex items-center justify-end gap-2 text-xs text-slate-300" aria-live="polite">
                  <Loader2 size={14} className="animate-spin" />
                  Updating settings...
                </div>
              ) : null}
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <header>
                  <p className={appTypographyClasses.eyebrow}>SETTINGS</p>
                  <h1 className={appTypographyClasses.pageTitle}>Profile & Preferences</h1>
                  <p className={appTypographyClasses.pageSubtitle}>
                    Manage your account, notification channels, and research workspace defaults.
                  </p>
                </header>

                <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#152447] text-slate-200">
                        <UserRound size={26} />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{settings.profile.fullName || "Your Profile"}</h2>
                        <p className="text-slate-400">{settings.profile.email || "Email not set"}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openProfileModal}
                      className="rounded-md border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200"
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <article className="rounded-lg border border-slate-800 bg-[#152447]/45 px-4 py-3">
                      <p className="text-xs tracking-[0.2em] text-slate-400">PLAN</p>
                      <p className="mt-2 text-lg font-semibold">{titleCase(settings.subscription.plan)}</p>
                    </article>
                    <article className="rounded-lg border border-slate-800 bg-[#152447]/45 px-4 py-3">
                      <p className="text-xs tracking-[0.2em] text-slate-400">REGION</p>
                      <p className="mt-2 text-lg font-semibold">{settings.profile.region}</p>
                    </article>
                    <article className="rounded-lg border border-slate-800 bg-[#152447]/45 px-4 py-3">
                      <p className="text-xs tracking-[0.2em] text-slate-400">TIMEZONE</p>
                      <p className="mt-2 text-lg font-semibold">{settings.profile.timezone}</p>
                    </article>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                  <div className="flex items-center gap-3">
                    <Globe2 size={18} className="text-cyan-300" />
                    <h2 className="text-xl font-semibold">Display Preferences</h2>
                  </div>
                  <div className="mt-4">
                    <ToggleRow
                      label="Compact table density"
                      description="Display more rows in ranking and watchlist tables."
                      enabled={settings.preferences.compactTableDensity}
                      disabled={isBusy}
                      onToggle={() =>
                        void applySettingsPatch(
                          {
                            preferences: {
                              compactTableDensity: !settings.preferences.compactTableDensity,
                            },
                          },
                          "Display density preference saved.",
                        )
                      }
                    />
                    <ToggleRow
                      label="Risk heatmap overlay"
                      description="Show risk intensity color overlays on score chips."
                      enabled={settings.preferences.riskHeatmapOverlay}
                      disabled={isBusy}
                      onToggle={() =>
                        void applySettingsPatch(
                          {
                            preferences: {
                              riskHeatmapOverlay: !settings.preferences.riskHeatmapOverlay,
                            },
                          },
                          "Risk heatmap preference saved.",
                        )
                      }
                    />
                    <ToggleRow
                      label="Pre-market reminder"
                      description="Send a reminder 15 minutes before market open."
                      enabled={settings.preferences.preMarketReminder}
                      disabled={isBusy}
                      onToggle={() =>
                        void applySettingsPatch(
                          {
                            preferences: {
                              preMarketReminder: !settings.preferences.preMarketReminder,
                            },
                          },
                          "Pre-market reminder preference saved.",
                        )
                      }
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-cyan-300" />
                    <h2 className="text-xl font-semibold">Notifications</h2>
                  </div>
                  <div className="mt-4">
                    <ToggleRow
                      label="Price movement alerts"
                      description="Notify when a tracked symbol moves more than 4% intraday."
                      enabled={settings.notifications.priceAlerts}
                      disabled={isBusy}
                      onToggle={() =>
                        void applySettingsPatch(
                          {
                            notifications: {
                              priceAlerts: !settings.notifications.priceAlerts,
                            },
                          },
                          "Price alerts preference saved.",
                        )
                      }
                    />
                    <ToggleRow
                      label="Score update digest"
                      description="Daily summary of score changes for your watchlist."
                      enabled={settings.notifications.scoreUpdateDigest}
                      disabled={isBusy}
                      onToggle={() =>
                        void applySettingsPatch(
                          {
                            notifications: {
                              scoreUpdateDigest: !settings.notifications.scoreUpdateDigest,
                            },
                          },
                          "Score digest preference saved.",
                        )
                      }
                    />
                    <ToggleRow
                      label="Earnings calendar updates"
                      description="Get notified before upcoming earnings for tracked symbols."
                      enabled={settings.notifications.earningsCalendarUpdates}
                      disabled={isBusy}
                      onToggle={() =>
                        void applySettingsPatch(
                          {
                            notifications: {
                              earningsCalendarUpdates: !settings.notifications.earningsCalendarUpdates,
                            },
                          },
                          "Earnings notification preference saved.",
                        )
                      }
                    />
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-emerald-300" />
                    <h2 className="text-xl font-semibold">Security Snapshot</h2>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg bg-[#152447]/45 px-4 py-3">
                      <p className="text-xs tracking-[0.18em] text-slate-400">Two-factor authentication</p>
                      <p className={`mt-1 text-lg font-semibold ${settings.security.mfaEnabled ? "text-emerald-300" : "text-amber-300"}`}>
                        {settings.security.mfaEnabled ? "Enabled" : "Not enabled"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#152447]/45 px-4 py-3">
                      <p className="text-xs tracking-[0.18em] text-slate-400">Last password update</p>
                      <p className={`mt-1 text-lg font-semibold ${passwordAge.status === "good" ? "text-emerald-300" : "text-amber-300"}`}>
                        {passwordAge.value}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#152447]/45 px-4 py-3">
                      <p className="text-xs tracking-[0.18em] text-slate-400">Active sessions</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-300">
                        {settings.security.activeSessions != null ? `${settings.security.activeSessions} devices` : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSecurityModalOpen(true)}
                    className="mt-4 w-full rounded-md border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold"
                  >
                    Manage Security
                  </button>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                  <div className="flex items-center gap-3">
                    <KeyRound size={18} className="text-cyan-300" />
                    <h2 className="text-xl font-semibold">API Access</h2>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    Create and rotate read-only API tokens for portfolio analytics exports.
                  </p>

                  <div className="mt-4 rounded-lg border border-slate-800 bg-[#0b1737] px-4 py-3">
                    <p className="text-xs tracking-[0.2em] text-slate-400">ACTIVE TOKENS</p>
                    <p className="app-data mt-1 text-2xl font-semibold">{Math.max(settings.apiAccess.activeTokens, activeTokenCount)}</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {tokenRows.slice(0, 3).map((token) => (
                      <div key={token.id} className="rounded-lg border border-slate-800 bg-[#152447]/35 px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-200">{token.name}</p>
                          {token.revokedAt ? (
                            <span className="text-xs text-amber-300">Revoked</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void onRevokeToken(token.id)}
                              className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{token.scopes.join(", ")} scope</p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setTokenModalOpen(true)}
                    className="mt-4 w-full rounded-md bg-cyan-300/90 px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    Generate New Token
                  </button>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </div>

      <Modal
        open={isProfileModalOpen}
        title="Edit Profile"
        description="Update personal details used across notifications and account summaries."
        onClose={() => setProfileModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={onProfileSubmit}>
          <label className="block text-sm text-slate-300">
            Full Name
            <input
              value={profileDraft.fullName}
              onChange={(event) => setProfileDraft((prev) => ({ ...prev, fullName: event.target.value }))}
              className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-[#0b1737] px-3 text-sm text-slate-100"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              value={profileDraft.email}
              onChange={(event) => setProfileDraft((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-[#0b1737] px-3 text-sm text-slate-100"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-slate-300">
              Region
              <input
                value={profileDraft.region}
                onChange={(event) => setProfileDraft((prev) => ({ ...prev, region: event.target.value }))}
                className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-[#0b1737] px-3 text-sm text-slate-100"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Timezone
              <input
                value={profileDraft.timezone}
                onChange={(event) => setProfileDraft((prev) => ({ ...prev, timezone: event.target.value }))}
                className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-[#0b1737] px-3 text-sm text-slate-100"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setProfileModalOpen(false)}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProfileSaving}
              className="rounded-md bg-cyan-300/90 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isSecurityModalOpen}
        title="Security Controls"
        description="Review sign-in protection and contain session risk from a single place."
        onClose={() => setSecurityModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-[#0b1737] p-4">
            <p className="text-sm font-semibold text-slate-200">Two-factor authentication</p>
            <p className="mt-1 text-xs text-slate-400">Adds an extra verification step to all sign-ins.</p>
            <button
              type="button"
              onClick={() => void onToggleMfa()}
              disabled={isSecuritySaving}
              className="mt-3 rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 disabled:opacity-60"
            >
              {settings.security.mfaEnabled ? "Disable MFA" : "Enable MFA"}
            </button>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0b1737] p-4">
            <p className="text-sm font-semibold text-slate-200">Session control</p>
            <p className="mt-1 text-xs text-slate-400">Sign out other sessions and keep only this device active.</p>
            <button
              type="button"
              onClick={() => void onInvalidateSessions()}
              disabled={isSecuritySaving}
              className="mt-3 rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 disabled:opacity-60"
            >
              Sign Out Other Sessions
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isTokenModalOpen}
        title="Generate API Token"
        description="Create a read-only token for exports or integration scripts."
        onClose={() => {
          setTokenModalOpen(false);
          setLatestPlainTextToken(null);
        }}
      >
        <form className="space-y-4" onSubmit={onCreateToken}>
          <label className="block text-sm text-slate-300">
            Token Name
            <input
              value={tokenDraftName}
              onChange={(event) => setTokenDraftName(event.target.value)}
              placeholder="Example: Portfolio Sync"
              className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-[#0b1737] px-3 text-sm text-slate-100"
            />
          </label>

          <div className="rounded-md border border-slate-800 bg-[#0b1737] px-3 py-2 text-xs text-slate-400">
            Scope: read (fixed in this phase)
          </div>

          {latestPlainTextToken ? (
            <div className="rounded-md border border-emerald-500/35 bg-emerald-900/20 px-3 py-2 text-xs text-emerald-200">
              Copy and save now: <span className="font-semibold">{latestPlainTextToken}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setTokenModalOpen(false)}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTokenSaving}
              className="rounded-md bg-cyan-300/90 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              Create Token
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
