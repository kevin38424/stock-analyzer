import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  notFound: vi.fn((m: string) => ({ kind: "nf", m })),
  ok: vi.fn((d: unknown) => ({ kind: "ok", d })),
  calculateCompositeScore: vi.fn(() => ({ total: 1 })),
  getMockStockMetrics: vi.fn(),
}));

vi.mock("@/server/http/response", () => ({ notFound: mocks.notFound, ok: mocks.ok }));
vi.mock("@/lib/scoring", () => ({ calculateCompositeScore: mocks.calculateCompositeScore }));
vi.mock("@/lib/mock-data", () => ({ getMockStockMetrics: mocks.getMockStockMetrics }));

import { GET } from "@/app/api/analyze/[ticker]/route";

describe("/api/analyze/[ticker] GET", () => {
  beforeEach(() => vi.clearAllMocks());

  it("not found", async () => {
    mocks.getMockStockMetrics.mockReturnValue(null);
    await expect(GET({} as any, { params: Promise.resolve({ ticker: "none" }) })).resolves.toEqual({ kind: "nf", m: "Ticker not found." });
  });

  it("returns analysis", async () => {
    mocks.getMockStockMetrics.mockReturnValue({ ticker: "AAPL" });
    await expect(GET({} as any, { params: Promise.resolve({ ticker: "aapl" }) })).resolves.toEqual({ kind: "ok", d: { ticker: "AAPL", analysis: { total: 1 }, metrics: { ticker: "AAPL" } } });
  });
});
