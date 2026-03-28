import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateSettings } from "@/features/settings/api/update-settings";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("updateSettings", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("sends PATCH with query userId and json body", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ profile: {} }),
    });

    await updateSettings({
      userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0",
      payload: {
        preferences: { compactTableDensity: false },
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/settings?userId=8c11f4ee-7dae-4675-aea7-63942f0665d0",
      {
        method: "PATCH",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { compactTableDensity: false } }),
      },
    );
  });

  it("throws for non-2xx responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "Invalid settings payload." }),
    });

    await expect(
      updateSettings({ userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0", payload: {} }),
    ).rejects.toThrow("Invalid settings payload.");
  });
});
