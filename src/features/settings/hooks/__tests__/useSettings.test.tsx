// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  getSettings: vi.fn(),
  getMockSettingsState: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }));
vi.mock("@/features/settings/api/get-settings", () => ({ getSettings: mocks.getSettings }));
vi.mock("@/features/settings/mocks/settings-mocks", () => ({ getMockSettingsState: mocks.getMockSettingsState }));

import { useSettings } from "@/features/settings/hooks/useSettings";

describe("useSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMockSettingsState.mockReturnValue({ profile: {} });
    mocks.useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    });
  });

  it("uses stable query keys", () => {
    renderHook(() => useSettings({ userId: null }));
    expect(mocks.useQuery.mock.calls[0][0].queryKey).toEqual(["settings", null]);

    renderHook(() => useSettings({ userId: "u-1" }));
    expect(mocks.useQuery.mock.calls[1][0].queryKey).toEqual(["settings", "u-1"]);
  });

  it("uses disabled refetchInterval by default", () => {
    renderHook(() => useSettings());
    expect(mocks.useQuery.mock.calls[0][0].refetchInterval).toBe(false);
  });

  it("passes params to api and respects enabled", async () => {
    renderHook(() =>
      useSettings({
        userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
        enabled: false,
      }),
    );

    const options = mocks.useQuery.mock.calls[0][0];
    expect(options.enabled).toBe(false);
    await options.queryFn();
    expect(mocks.getSettings).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
    });
  });

  it("uses mock state when userId is missing", async () => {
    renderHook(() => useSettings({ userId: null }));

    const options = mocks.useQuery.mock.calls[0][0];
    await options.queryFn();
    expect(mocks.getMockSettingsState).toHaveBeenCalled();
    expect(mocks.getSettings).not.toHaveBeenCalled();
  });
});
