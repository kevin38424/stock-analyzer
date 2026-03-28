"use client";

import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/features/settings/api/get-settings";
import { getMockSettingsState } from "@/features/settings/mocks/settings-mocks";
import type { SettingsResponse } from "@/features/settings/types/settings";

export type UseSettingsOptions = {
  userId?: string | null;
  enabled?: boolean;
  refetchInterval?: number;
};

export function useSettings(options: UseSettingsOptions = {}) {
  const query = useQuery<SettingsResponse, Error>({
    queryKey: ["settings", options.userId ?? null],
    queryFn: () => {
      if (!options.userId) {
        return Promise.resolve(getMockSettingsState());
      }

      return getSettings({
        userId: options.userId,
      });
    },
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval ?? false,
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
