// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  mockEnableMfa: vi.fn(),
  mockInvalidateSessions: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}));
vi.mock("@/features/settings/mocks/settings-mocks", () => ({
  mockEnableMfa: mocks.mockEnableMfa,
  mockInvalidateSessions: mocks.mockInvalidateSessions,
}));

import { useSecurityActions } from "@/features/settings/hooks/useSecurityActions";

describe("useSecurityActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQueryClient.mockReturnValue({ invalidateQueries: mocks.invalidateQueries });
    mocks.useMutation
      .mockReturnValueOnce({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() })
      .mockReturnValueOnce({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() });
  });

  it("wires both security mutations", async () => {
    renderHook(() => useSecurityActions("u1"));

    const firstMutation = mocks.useMutation.mock.calls[0][0];
    const secondMutation = mocks.useMutation.mock.calls[1][0];

    await firstMutation.mutationFn(true);
    await secondMutation.mutationFn();

    expect(mocks.mockEnableMfa).toHaveBeenCalledWith({ enabled: true });
    expect(mocks.mockInvalidateSessions).toHaveBeenCalled();
  });
});
