// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  mockCreateApiToken: vi.fn(),
  mockRevokeApiToken: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}));
vi.mock("@/features/settings/mocks/settings-mocks", () => ({
  mockCreateApiToken: mocks.mockCreateApiToken,
  mockRevokeApiToken: mocks.mockRevokeApiToken,
}));

import { useApiTokenActions } from "@/features/settings/hooks/useApiTokenActions";

describe("useApiTokenActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQueryClient.mockReturnValue({ invalidateQueries: mocks.invalidateQueries });
    mocks.useMutation
      .mockReturnValueOnce({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() })
      .mockReturnValueOnce({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() });
  });

  it("wires create and revoke token mutations", async () => {
    renderHook(() => useApiTokenActions("u1"));

    const createMutation = mocks.useMutation.mock.calls[0][0];
    const revokeMutation = mocks.useMutation.mock.calls[1][0];

    await createMutation.mutationFn({ name: "New Key", scopes: ["read"] });
    await revokeMutation.mutationFn("tok_1");

    expect(mocks.mockCreateApiToken).toHaveBeenCalledWith({ name: "New Key", scopes: ["read"] });
    expect(mocks.mockRevokeApiToken).toHaveBeenCalledWith({ tokenId: "tok_1" });
  });
});
