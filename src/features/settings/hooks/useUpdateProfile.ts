"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettings } from "@/features/settings/api/update-settings";
import { mockPatchSettings } from "@/features/settings/mocks/settings-mocks";
import type { SettingsResponse } from "@/features/settings/types/settings";

export type UpdateProfileInput = Partial<SettingsResponse["profile"]>;

export function useUpdateProfile(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!userId) {
        return mockPatchSettings({ profile: input });
      }

      return updateSettings({
        userId,
        payload: { profile: input },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", userId ?? null] });
    },
  });

  return {
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
