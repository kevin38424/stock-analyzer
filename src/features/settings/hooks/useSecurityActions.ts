"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockEnableMfa, mockInvalidateSessions } from "@/features/settings/mocks/settings-mocks";

export function useSecurityActions(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  const enableMfaMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return mockEnableMfa({ enabled });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", userId ?? null] });
    },
  });

  const invalidateSessionsMutation = useMutation({
    mutationFn: async () => {
      return mockInvalidateSessions();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", userId ?? null] });
    },
  });

  return {
    enableMfa: enableMfaMutation.mutate,
    enableMfaAsync: enableMfaMutation.mutateAsync,
    invalidateSessions: invalidateSessionsMutation.mutate,
    invalidateSessionsAsync: invalidateSessionsMutation.mutateAsync,
    isPending: enableMfaMutation.isPending || invalidateSessionsMutation.isPending,
    isError: enableMfaMutation.isError || invalidateSessionsMutation.isError,
    error: enableMfaMutation.error ?? invalidateSessionsMutation.error,
    reset: () => {
      enableMfaMutation.reset();
      invalidateSessionsMutation.reset();
    },
  };
}
