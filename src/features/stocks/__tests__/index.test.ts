import { describe, expect, it } from "vitest";
import {
  ScoreBreakdown,
  SearchBar,
  SearchResultsPage,
  StockDetailsPage,
  TopStockTable,
  TopStocksView,
  useSearchResults,
  useStockSearch,
} from "@/features/stocks";
import * as stocksIndex from "@/features/stocks/index";

describe("stocks exports", () => {
  it("exports stock modules", () => {
    expect(SearchBar).toBeTypeOf("function");
    expect(TopStockTable).toBeTypeOf("function");
    expect(ScoreBreakdown).toBeTypeOf("function");
    expect(TopStocksView).toBeTypeOf("function");
    expect(StockDetailsPage).toBeTypeOf("function");
    expect(SearchResultsPage).toBeTypeOf("function");
    expect(useSearchResults).toBeTypeOf("function");
    expect(useStockSearch).toBeTypeOf("function");
    expect(stocksIndex.SearchBar).toBeTypeOf("function");
  });
});
