// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  updateSettings: vi.fn(),
  mockPatchSettings: vi.fn(),
  invalidateQueries: vi.fn(),
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  reset: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}));
vi.mock("@/features/settings/api/update-settings", () => ({
  updateSettings: mocks.updateSettings,
}));
vi.mock("@/features/settings/mocks/settings-mocks", () => ({
  mockPatchSettings: mocks.mockPatchSettings,
}));

import { useUpdateSettings } from "@/features/settings/hooks/useUpdateSettings";

describe("useUpdateSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQueryClient.mockReturnValue({ invalidateQueries: mocks.invalidateQueries });
    mocks.useMutation.mockReturnValue({
      mutate: mocks.mutate,
      mutateAsync: mocks.mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: mocks.reset,
    });
  });

  it("wires mutation and invalidates settings query on success", async () => {
    renderHook(() => useUpdateSettings("5b1578ce-f86a-4cab-960f-91f5f9498f7e"));

    const mutationConfig = mocks.useMutation.mock.calls[0][0];
    await mutationConfig.onSuccess();

    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["settings", "5b1578ce-f86a-4cab-960f-91f5f9498f7e"],
    });
  });

  it("uses mock patch when userId is missing", async () => {
    renderHook(() => useUpdateSettings(null));

    const mutationConfig = mocks.useMutation.mock.calls[0][0];
    await mutationConfig.mutationFn({ preferences: { compactTableDensity: false } });
    expect(mocks.mockPatchSettings).toHaveBeenCalledWith({
      preferences: { compactTableDensity: false },
    });
  });

  it("calls updateSettings for valid user", async () => {
    mocks.updateSettings.mockResolvedValue({ ok: true });
    renderHook(() => useUpdateSettings("5b1578ce-f86a-4cab-960f-91f5f9498f7e"));

    const mutationConfig = mocks.useMutation.mock.calls[0][0];
    await mutationConfig.mutationFn({ notifications: { priceAlerts: false } });

    expect(mocks.updateSettings).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      payload: { notifications: { priceAlerts: false } },
    });
  });
});
