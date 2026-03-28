import type { HomeDashboardResponse } from "@/features/home/types/dashboard";
import { fetchJson } from "@/lib/http/fetch-json";

export type GetHomeDashboardParams = {
  includeWatchlist?: boolean;
  userId?: string | null;
};

export async function getHomeDashboard(params: GetHomeDashboardParams = {}): Promise<HomeDashboardResponse> {
  const includeWatchlist = params.includeWatchlist ?? true;
  const searchParams = new URLSearchParams({
    includeWatchlist: String(includeWatchlist),
  });

  if (params.userId) {
    searchParams.set("userId", params.userId);
  }

  return fetchJson<HomeDashboardResponse>(`/api/home?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}
