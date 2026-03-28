"use client";

import { useQuery } from "@tanstack/react-query";
import { getHomeDashboard } from "@/features/home/api/get-home-dashboard";
import type { HomeDashboardResponse } from "@/features/home/types/dashboard";

export type UseHomeDashboardOptions = {
  userId?: string | null;
  includeWatchlist?: boolean;
  enabled?: boolean;
  refetchInterval?: number;
};

export function useHomeDashboard(options: UseHomeDashboardOptions = {}) {
  const includeWatchlist = options.includeWatchlist ?? true;
  const query = useQuery<HomeDashboardResponse, Error>({
    queryKey: ["home-dashboard", options.userId ?? null, includeWatchlist],
    queryFn: () =>
      getHomeDashboard({
        userId: options.userId ?? null,
        includeWatchlist,
      }),
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval ?? 15_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
