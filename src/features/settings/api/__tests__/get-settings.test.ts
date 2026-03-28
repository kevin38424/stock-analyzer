import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSettings } from "@/features/settings/api/get-settings";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("getSettings", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("uses base route when userId is missing", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ profile: {} }),
    });

    await getSettings();
    expect(fetchMock).toHaveBeenCalledWith("/api/settings", {
      method: "GET",
      cache: "no-store",
    });
  });

  it("serializes userId query param", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ profile: {} }),
    });

    await getSettings({ userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/settings?userId=8c11f4ee-7dae-4675-aea7-63942f0665d0",
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

    await expect(getSettings()).rejects.toThrow("Boom.");
  });
});
