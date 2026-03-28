export type SettingsResponse = {
  profile: {
    fullName: string;
    email: string;
    region: string;
    timezone: string;
  };
  subscription: {
    plan: string;
    status: string;
    billingInterval: string | null;
    currentPeriodEnd: string | null;
  };
  preferences: {
    compactTableDensity: boolean;
    riskHeatmapOverlay: boolean;
    preMarketReminder: boolean;
  };
  notifications: {
    priceAlerts: boolean;
    scoreUpdateDigest: boolean;
    earningsCalendarUpdates: boolean;
  };
  security: {
    mfaEnabled: boolean;
    lastPasswordChangedAt: string | null;
    activeSessions: number | null;
  };
  apiAccess: {
    activeTokens: number;
  };
};
