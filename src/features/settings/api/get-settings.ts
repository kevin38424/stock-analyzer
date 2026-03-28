import { fetchJson } from "@/lib/http/fetch-json";
import type { SettingsResponse } from "@/features/settings/types/settings";

export type GetSettingsParams = {
  userId?: string | null;
};

export async function getSettings(params: GetSettingsParams = {}): Promise<SettingsResponse> {
  const searchParams = new URLSearchParams();

  if (params.userId) {
    searchParams.set("userId", params.userId);
  }

  const query = searchParams.toString();
  const url = query ? `/api/settings?${query}` : "/api/settings";

  return fetchJson<SettingsResponse>(url, {
    method: "GET",
    cache: "no-store",
  });
}
