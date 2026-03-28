import { describe, expect, it } from "vitest";
import {
  WatchlistPage,
  useCreateWatchlistItem,
  useDeleteWatchlistItem,
  useFavoriteList,
  usePatchWatchlistItem,
  useWatchlistExport,
  useWatchlistPagination,
  useWatchlistPage,
  useWatchlistRealtimeMock,
} from "@/features/watchlist";
import * as watchlistIndex from "@/features/watchlist/index";

describe("watchlist export", () => {
  it("exports watchlist page", () => {
    expect(WatchlistPage).toBeTypeOf("function");
    expect(useWatchlistPage).toBeTypeOf("function");
    expect(useFavoriteList).toBeTypeOf("function");
    expect(useWatchlistPagination).toBeTypeOf("function");
    expect(useWatchlistExport).toBeTypeOf("function");
    expect(useWatchlistRealtimeMock).toBeTypeOf("function");
    expect(useCreateWatchlistItem).toBeTypeOf("function");
    expect(usePatchWatchlistItem).toBeTypeOf("function");
    expect(useDeleteWatchlistItem).toBeTypeOf("function");
    expect(watchlistIndex.WatchlistPage).toBeTypeOf("function");
    expect(watchlistIndex.useWatchlistPage).toBeTypeOf("function");
    expect(watchlistIndex.useFavoriteList).toBeTypeOf("function");
    expect(watchlistIndex.useWatchlistPagination).toBeTypeOf("function");
    expect(watchlistIndex.useWatchlistExport).toBeTypeOf("function");
    expect(watchlistIndex.useWatchlistRealtimeMock).toBeTypeOf("function");
    expect(watchlistIndex.useCreateWatchlistItem).toBeTypeOf("function");
    expect(watchlistIndex.usePatchWatchlistItem).toBeTypeOf("function");
    expect(watchlistIndex.useDeleteWatchlistItem).toBeTypeOf("function");
  });
});
