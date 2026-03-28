import type { SettingsResponse } from "@/features/settings/types/settings";

export type MockSettingsApiToken = {
  id: string;
  name: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

type SettingsPatch = {
  profile?: Partial<SettingsResponse["profile"]>;
  preferences?: Partial<SettingsResponse["preferences"]>;
  notifications?: Partial<SettingsResponse["notifications"]>;
};

const defaultSettingsState: SettingsResponse = {
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

const defaultApiTokenState: MockSettingsApiToken[] = [
  {
    id: "tok_1",
    name: "Portfolio Export",
    scopes: ["read"],
    createdAt: "2026-01-10T12:00:00.000Z",
    lastUsedAt: "2026-03-20T15:30:00.000Z",
    revokedAt: null,
  },
  {
    id: "tok_2",
    name: "Dashboard Sync",
    scopes: ["read"],
    createdAt: "2026-02-04T08:10:00.000Z",
    lastUsedAt: null,
    revokedAt: null,
  },
];

let mockSettingsState: SettingsResponse = structuredClone(defaultSettingsState);
let mockApiTokenState: MockSettingsApiToken[] = structuredClone(defaultApiTokenState);

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getMockSettingsState(): SettingsResponse {
  return structuredClone(mockSettingsState);
}

export function getMockApiTokens(): MockSettingsApiToken[] {
  return structuredClone(mockApiTokenState);
}

export async function mockPatchSettings(input: SettingsPatch): Promise<SettingsResponse> {
  await delay();

  mockSettingsState = {
    ...mockSettingsState,
    profile: input.profile ? { ...mockSettingsState.profile, ...input.profile } : mockSettingsState.profile,
    preferences: input.preferences
      ? { ...mockSettingsState.preferences, ...input.preferences }
      : mockSettingsState.preferences,
    notifications: input.notifications
      ? { ...mockSettingsState.notifications, ...input.notifications }
      : mockSettingsState.notifications,
  };

  return getMockSettingsState();
}

export async function mockEnableMfa(input: { enabled: boolean }) {
  await delay();
  mockSettingsState = {
    ...mockSettingsState,
    security: {
      ...mockSettingsState.security,
      mfaEnabled: input.enabled,
    },
  };

  return {
    ok: true,
    mfaEnabled: input.enabled,
  };
}

export async function mockInvalidateSessions() {
  await delay();
  mockSettingsState = {
    ...mockSettingsState,
    security: {
      ...mockSettingsState.security,
      activeSessions: 1,
    },
  };

  return {
    ok: true,
    activeSessions: 1,
  };
}

export async function mockCreateApiToken(input: { name: string; scopes?: string[] }) {
  await delay();
  const created: MockSettingsApiToken = {
    id: `tok_${Date.now()}`,
    name: input.name,
    scopes: input.scopes ?? ["read"],
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    revokedAt: null,
  };

  mockApiTokenState = [created, ...mockApiTokenState];
  mockSettingsState = {
    ...mockSettingsState,
    apiAccess: {
      activeTokens: mockApiTokenState.filter((token) => token.revokedAt == null).length,
    },
  };

  return {
    ok: true,
    token: created,
    plainTextToken: `se_${Math.random().toString(36).slice(2)}`,
  };
}

export async function mockRevokeApiToken(input: { tokenId: string }) {
  await delay();

  mockApiTokenState = mockApiTokenState.map((token) =>
    token.id === input.tokenId ? { ...token, revokedAt: token.revokedAt ?? new Date().toISOString() } : token,
  );
  mockSettingsState = {
    ...mockSettingsState,
    apiAccess: {
      activeTokens: mockApiTokenState.filter((token) => token.revokedAt == null).length,
    },
  };

  return {
    ok: true,
    tokenId: input.tokenId,
  };
}
