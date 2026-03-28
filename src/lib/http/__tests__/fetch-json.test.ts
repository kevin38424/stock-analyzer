import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchJson } from "@/lib/http/fetch-json";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function makeResponse(input: { ok: boolean; status?: number; contentType?: string; body?: unknown }) {
  return {
    ok: input.ok,
    status: input.status ?? 200,
    headers: {
      get: () => input.contentType ?? "application/json",
    },
    json: async () => input.body,
  };
}

describe("fetchJson", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("returns parsed json for successful responses", async () => {
    fetchMock.mockResolvedValue(makeResponse({ ok: true, body: { ok: true } }));
    await expect(fetchJson<{ ok: boolean }>("/api/example")).resolves.toEqual({ ok: true });
  });

  it("throws payload error message when present", async () => {
    fetchMock.mockResolvedValue(makeResponse({ ok: false, status: 400, body: { error: "Bad request." } }));
    await expect(fetchJson("/api/example")).rejects.toThrow("Bad request.");
  });

  it("throws status message for non-json errors", async () => {
    fetchMock.mockResolvedValue(makeResponse({ ok: false, status: 503, contentType: "text/plain", body: null }));
    await expect(fetchJson("/api/example")).rejects.toThrow("Request failed with status 503.");
  });
});
