// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/shared", () => ({
  AppSidebar: () => <div>sidebar</div>,
  AppTopbar: () => <div>topbar</div>,
  SettingsSkeleton: () => <div>settings-skeleton</div>,
  appLayoutClasses: { page: "p", shell: "s", content: "c" },
  appTypographyClasses: {
    eyebrow: "eyebrow",
    pageSubtitle: "pageSubtitle",
    sectionTitle: "sectionTitle",
    pageTitle: "pageTitle",
  },
}));

vi.mock("@/features/settings/hooks/useSettings", () => ({
  useSettings: () => ({
    data: {
      profile: {
        fullName: "Alex Rivera",
        email: "alex.rivera@scoreengine.ai",
        region: "United States",
        timezone: "America/New_York",
      },
      subscription: {
        plan: "pro",
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
        mfaEnabled: true,
        lastPasswordChangedAt: null,
        activeSessions: 2,
      },
      apiAccess: {
        activeTokens: 1,
      },
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/features/settings/hooks/useUpdateSettings", () => ({
  useUpdateSettings: () => ({
    updateSettingsAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

vi.mock("@/features/settings/hooks/useUpdateProfile", () => ({
  useUpdateProfile: () => ({
    updateProfileAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

vi.mock("@/features/settings/hooks/useSecurityActions", () => ({
  useSecurityActions: () => ({
    enableMfaAsync: vi.fn().mockResolvedValue({}),
    invalidateSessionsAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

vi.mock("@/features/settings/hooks/useApiTokenActions", () => ({
  useApiTokenActions: () => ({
    createApiTokenAsync: vi.fn().mockResolvedValue({}),
    revokeApiTokenAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

vi.mock("@/features/settings/mocks/settings-mocks", () => ({
  getMockApiTokens: () => [],
}));

import { SettingsPage } from "@/features/settings/components/SettingsPage";

describe("SettingsPage", () => {
  it("renders settings sections", () => {
    render(<SettingsPage />);
    expect(screen.getByText(/Profile & Preferences/)).toBeInTheDocument();
    expect(screen.getByText(/Display Preferences/)).toBeInTheDocument();
    expect(screen.getByText(/Notifications/)).toBeInTheDocument();
    expect(screen.getByText(/Security Snapshot/)).toBeInTheDocument();
  });
});
