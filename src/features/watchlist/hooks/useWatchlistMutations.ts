"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWatchlistItem,
  deleteWatchlistItem,
  patchWatchlistItem,
  type CreateWatchlistItemParams,
  type DeleteWatchlistItemParams,
  type PatchWatchlistItemParams,
} from "@/features/watchlist/api/manage-watchlist";

export function useCreateWatchlistItem(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: Omit<CreateWatchlistItemParams, "userId">) => {
      if (!userId) {
        throw new Error("A valid userId is required to create a watchlist item.");
      }

      return createWatchlistItem({
        userId,
        ...payload,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watchlist-page"] });
    },
  });

  return {
    createWatchlistItem: mutation.mutate,
    createWatchlistItemAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function usePatchWatchlistItem(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: Omit<PatchWatchlistItemParams, "userId">) => {
      if (!userId) {
        throw new Error("A valid userId is required to update a watchlist item.");
      }

      return patchWatchlistItem({
        userId,
        ...payload,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watchlist-page"] });
    },
  });

  return {
    patchWatchlistItem: mutation.mutate,
    patchWatchlistItemAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useDeleteWatchlistItem(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: Omit<DeleteWatchlistItemParams, "userId">) => {
      if (!userId) {
        throw new Error("A valid userId is required to remove a watchlist item.");
      }

      return deleteWatchlistItem({
        userId,
        ...payload,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watchlist-page"] });
    },
  });

  return {
    deleteWatchlistItem: mutation.mutate,
    deleteWatchlistItemAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
