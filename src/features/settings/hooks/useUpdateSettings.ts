"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettings, type UpdateSettingsPayload } from "@/features/settings/api/update-settings";
import { mockPatchSettings } from "@/features/settings/mocks/settings-mocks";

export function useUpdateSettings(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: UpdateSettingsPayload) => {
      if (!userId) {
        return mockPatchSettings(payload);
      }

      return updateSettings({ userId, payload });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", userId ?? null] });
    },
  });

  return {
    updateSettings: mutation.mutate,
    updateSettingsAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
