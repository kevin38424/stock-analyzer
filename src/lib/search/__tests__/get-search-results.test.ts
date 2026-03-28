import { describe, expect, it } from "vitest";
import { getEmptySearchResponse, getSearchResults } from "@/lib/search/get-search-results";

describe("get-search-results", () => {
  it("returns empty response for blank query", () => {
    const response = getSearchResults("   ");
    expect(response).toEqual(getEmptySearchResponse(""));
  });

  it("returns ranked search results and category counts", () => {
    const response = getSearchResults("nv");
    expect(response.query).toBe("nv");
    expect(response.total).toBeGreaterThan(0);
    expect(response.results[0].ticker).toBe("NVDA");
    const allCount = response.categories.find((x) => x.key === "all")?.count;
    expect(allCount).toBe(response.total);

    const exact = getSearchResults("NVDA");
    expect(exact.results[0].ticker).toBe("NVDA");

    const bySector = getSearchResults("technology");
    expect(bySector.results.length).toBeGreaterThan(0);
  });

  it("matches by exchange and industry fields", () => {
    const byExchange = getSearchResults("opra");
    expect(byExchange.results.some((r) => r.assetType === "option")).toBe(true);

    const byIndustry = getSearchResults("foundries");
    expect(byIndustry.results[0].ticker).toBe("TSM");

    const bearishUniverse = getSearchResults("semiconductors");
    expect(bearishUniverse.results.some((r) => r.sentiment === "BEARISH")).toBe(true);
  });
});
