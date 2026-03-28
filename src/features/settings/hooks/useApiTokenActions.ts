"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockCreateApiToken, mockRevokeApiToken } from "@/features/settings/mocks/settings-mocks";

export type CreateApiTokenInput = {
  name: string;
  scopes?: string[];
};

export function useApiTokenActions(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (input: CreateApiTokenInput) => {
      return mockCreateApiToken(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", userId ?? null] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      return mockRevokeApiToken({ tokenId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", userId ?? null] });
    },
  });

  return {
    createApiToken: createMutation.mutate,
    createApiTokenAsync: createMutation.mutateAsync,
    revokeApiToken: revokeMutation.mutate,
    revokeApiTokenAsync: revokeMutation.mutateAsync,
    isPending: createMutation.isPending || revokeMutation.isPending,
    isError: createMutation.isError || revokeMutation.isError,
    error: createMutation.error ?? revokeMutation.error,
    reset: () => {
      createMutation.reset();
      revokeMutation.reset();
    },
  };
}
