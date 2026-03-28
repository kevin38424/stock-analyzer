import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ok: vi.fn((data: unknown) => ({ kind: "ok", data })),
  getMarketStatusSnapshot: vi.fn(),
}));

vi.mock("@/server/http/response", () => ({
  ok: mocks.ok,
}));

vi.mock("@/server/market-data/market-status", () => ({
  getMarketStatusSnapshot: mocks.getMarketStatusSnapshot,
}));

import { GET } from "@/app/api/market/status/route";

describe("/api/market/status GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unavailable when no tradier status is configured", async () => {
    mocks.getMarketStatusSnapshot.mockResolvedValue(null);
    await expect(GET()).resolves.toEqual({
      kind: "ok",
      data: {
        status: null,
        available: false,
      },
    });
  });

  it("returns status payload", async () => {
    mocks.getMarketStatusSnapshot.mockResolvedValue({
      asOf: "2026-03-28T15:00:00.000Z",
      state: "open",
      nextOpen: "2026-03-29T13:30:00.000Z",
      nextClose: "2026-03-28T20:00:00.000Z",
      tradingDayStatus: "open",
      tradingDayDescription: "Regular Trading Hours",
    });

    await expect(GET()).resolves.toEqual({
      kind: "ok",
      data: {
        status: {
          asOf: "2026-03-28T15:00:00.000Z",
          state: "open",
          nextOpen: "2026-03-29T13:30:00.000Z",
          nextClose: "2026-03-28T20:00:00.000Z",
          tradingDayStatus: "open",
          tradingDayDescription: "Regular Trading Hours",
        },
        available: true,
      },
    });
  });
});
