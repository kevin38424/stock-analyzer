import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  parseJsonBody: vi.fn(),
  parseWithSchema: vi.fn(),
  badRequest: vi.fn((m: string) => ({ kind: "bad", m })),
  ok: vi.fn((d: unknown) => ({ kind: "ok", d })),
  serverError: vi.fn((m: string) => ({ kind: "err", m })),
  getRequestUserId: vi.fn(),
  getDefaultSettings: vi.fn(() => ({ defaults: true })),
  getSettingsData: vi.fn(),
  upsertSettingsData: vi.fn(),
}));

vi.mock("@/server/http/parsing", () => ({ parseJsonBody: mocks.parseJsonBody, parseWithSchema: mocks.parseWithSchema }));
vi.mock("@/server/http/response", () => ({ badRequest: mocks.badRequest, ok: mocks.ok, serverError: mocks.serverError }));
vi.mock("@/server/http/request-context", () => ({ getRequestUserId: mocks.getRequestUserId }));
vi.mock("@/server/settings/get-settings-data", () => ({
  getDefaultSettings: mocks.getDefaultSettings,
  getSettingsData: mocks.getSettingsData,
  upsertSettingsData: mocks.upsertSettingsData,
}));

import { GET, PATCH } from "@/app/api/settings/route";

describe("/api/settings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET validates malformed userId", async () => {
    mocks.getRequestUserId.mockReturnValue("not-a-uuid");
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({
      kind: "bad",
      m: "Invalid query parameters.",
    });
  });

  it("GET returns defaults when userId is not provided", async () => {
    mocks.getRequestUserId.mockReturnValue(null);
    mocks.getSettingsData.mockResolvedValue({ x: 1 });
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({
      kind: "ok",
      d: { defaults: true },
    });
    expect(mocks.getSettingsData).not.toHaveBeenCalled();
  });

  it("GET returns settings", async () => {
    mocks.getRequestUserId.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
    mocks.getSettingsData.mockResolvedValue({ x: 1 });
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({ kind: "ok", d: { x: 1 } });
  });

  it("PATCH validations", async () => {
    mocks.getRequestUserId.mockReturnValue(null);
    await expect(PATCH({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({
      kind: "bad",
      m: "A valid userId is required.",
    });

    mocks.getRequestUserId.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
    mocks.parseJsonBody.mockResolvedValueOnce(null);
    await expect(PATCH({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({
      kind: "bad",
      m: "Invalid JSON body.",
    });

    mocks.parseJsonBody.mockResolvedValueOnce({});
    mocks.parseWithSchema.mockReturnValueOnce(null);
    await expect(PATCH({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({
      kind: "bad",
      m: "Invalid settings payload.",
    });

    mocks.parseJsonBody.mockResolvedValueOnce({});
    mocks.parseWithSchema.mockReturnValueOnce({});
    await expect(PATCH({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({
      kind: "bad",
      m: "At least one settings section is required.",
    });
  });

  it("PATCH success and error", async () => {
    mocks.getRequestUserId.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
    mocks.parseJsonBody.mockResolvedValue({});
    mocks.parseWithSchema.mockReturnValue({ profile: { fullName: "A" } });
    mocks.getSettingsData.mockResolvedValue({ done: true });
    await expect(PATCH({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({
      kind: "ok",
      d: { done: true },
    });
    expect(mocks.upsertSettingsData).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000", {
      profile: { fullName: "A" },
      preferences: undefined,
      notifications: undefined,
    });

    mocks.upsertSettingsData.mockRejectedValueOnce(new Error("fail"));
    await expect(PATCH({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({
      kind: "err",
      m: "fail",
    });

    mocks.upsertSettingsData.mockRejectedValueOnce("bad");
    await expect(PATCH({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({
      kind: "err",
      m: "Failed to update settings.",
    });
  });
});
