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

import { useUpdateProfile } from "@/features/settings/hooks/useUpdateProfile";

describe("useUpdateProfile", () => {
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

  it("uses api update when userId exists", async () => {
    renderHook(() => useUpdateProfile("5b1578ce-f86a-4cab-960f-91f5f9498f7e"));
    const mutationConfig = mocks.useMutation.mock.calls[0][0];

    await mutationConfig.mutationFn({ fullName: "Jane" });
    expect(mocks.updateSettings).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      payload: { profile: { fullName: "Jane" } },
    });
  });

  it("uses mock update when userId missing", async () => {
    renderHook(() => useUpdateProfile(null));
    const mutationConfig = mocks.useMutation.mock.calls[0][0];

    await mutationConfig.mutationFn({ region: "US" });
    expect(mocks.mockPatchSettings).toHaveBeenCalledWith({ profile: { region: "US" } });
  });
});
