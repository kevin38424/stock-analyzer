"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addStockToWatchlist,
  removeStockFromWatchlist,
  type StockWatchlistCreateInput,
  type StockWatchlistRemoveInput,
} from "@/features/stocks/api/mutate-stock-watchlist";

export function useStockWatchlistActions() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (input: StockWatchlistCreateInput) => addStockToWatchlist(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["watchlist-page"] });
      void queryClient.invalidateQueries({ queryKey: ["stock-details", variables.ticker.toUpperCase()] });
      void queryClient.invalidateQueries({ queryKey: ["top-stocks-page"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (input: StockWatchlistRemoveInput) => removeStockFromWatchlist(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["watchlist-page"] });
      void queryClient.invalidateQueries({ queryKey: ["stock-details", variables.ticker.toUpperCase()] });
      void queryClient.invalidateQueries({ queryKey: ["top-stocks-page"] });
    },
  });

  return {
    addToWatchlist: addMutation.mutateAsync,
    removeFromWatchlist: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    addError: addMutation.error,
    removeError: removeMutation.error,
  };
}
