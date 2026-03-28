// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  refetch: vi.fn().mockResolvedValue(undefined),
  useStockSearch: vi.fn(),
}));

vi.mock("@/features/stocks/hooks/useStockSearch", () => ({ useStockSearch: mocks.useStockSearch }));

import { SearchBar } from "@/features/stocks/components/SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useStockSearch.mockReturnValue({
      data: { results: [] },
      isFetching: false,
      isError: false,
      refetch: mocks.refetch,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows no matches and error states", () => {
    mocks.useStockSearch.mockReturnValueOnce({
      data: { results: [] },
      isFetching: false,
      isError: true,
      refetch: mocks.refetch,
    });
    render(<SearchBar />);
    expect(screen.getByText(/Search failed/)).toBeInTheDocument();
  });

  it("submits, trims, and refetches on same query", async () => {
    render(<SearchBar />);
    const input = screen.getByRole("textbox");
    const form = input.closest("form") as HTMLFormElement;

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(form);

    fireEvent.change(input, { target: { value: "AAPL" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mocks.useStockSearch).toHaveBeenCalledWith({ query: "AAPL" });
    });
    expect(screen.getByText("No matches found.")).toBeInTheDocument();

    fireEvent.submit(form);
    await waitFor(() => {
      expect(mocks.refetch).toHaveBeenCalled();
    });
  });

  it("renders result rows and empty state", () => {
    mocks.useStockSearch.mockReturnValueOnce({
      data: { results: [{ ticker: "AAPL", name: "Apple", sector: "Technology" }] },
      isFetching: false,
      isError: false,
      refetch: mocks.refetch,
    });
    render(<SearchBar />);
    expect(screen.getByText(/AAPL/)).toBeInTheDocument();
    expect(screen.queryByText("No matches found.")).not.toBeInTheDocument();
  });

  it("renders no matches and loading label branches", () => {
    mocks.useStockSearch.mockReturnValueOnce({
      data: { results: [] },
      isFetching: true,
      isError: false,
      refetch: mocks.refetch,
    });
    render(<SearchBar />);
    expect(screen.getByRole("button", { name: "Searching..." })).toBeInTheDocument();
  });

  it("handles undefined query data", () => {
    mocks.useStockSearch.mockReturnValueOnce({
      data: undefined,
      isFetching: false,
      isError: false,
      refetch: mocks.refetch,
    });
    render(<SearchBar />);
    expect(screen.queryByText("No matches found.")).not.toBeInTheDocument();
  });
});
