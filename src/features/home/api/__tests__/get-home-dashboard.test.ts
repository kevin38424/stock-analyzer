import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHomeDashboard } from "@/features/home/api/get-home-dashboard";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("getHomeDashboard", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("uses includeWatchlist=true by default", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ generatedAt: "x" }),
    });

    await getHomeDashboard();
    expect(fetchMock).toHaveBeenCalledWith("/api/home?includeWatchlist=true", {
      method: "GET",
      cache: "no-store",
    });
  });

  it("serializes includeWatchlist and userId", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ generatedAt: "x" }),
    });

    await getHomeDashboard({ includeWatchlist: false, userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/home?includeWatchlist=false&userId=8c11f4ee-7dae-4675-aea7-63942f0665d0",
      { method: "GET", cache: "no-store" },
    );
  });

  it("throws for non-2xx responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "Boom." }),
    });

    await expect(getHomeDashboard()).rejects.toThrow("Boom.");
  });
});
