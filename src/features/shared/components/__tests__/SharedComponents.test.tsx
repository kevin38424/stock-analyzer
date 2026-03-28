// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/features/shared/components/AppSidebar";
import { AppTopbar } from "@/features/shared/components/AppTopbar";

describe("shared components", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders sidebar links and settings button", () => {
    render(<AppSidebar activePage="settings" />);
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/");
  });

  it("topbar submits empty and non-empty searches", () => {
    const mockRouterPush = useRouter().push as any;
    mockRouterPush.mockReset();
    render(<AppTopbar searchRoute="/search" searchValue="" />);

    fireEvent.submit(screen.getByRole("textbox").closest("form") as HTMLFormElement);
    expect(mockRouterPush).toHaveBeenCalledWith("/search");

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "AAPL" } });
    fireEvent.submit(screen.getByRole("textbox").closest("form") as HTMLFormElement);
    expect(mockRouterPush).toHaveBeenCalledWith("/search?q=AAPL");
  });

  it("topbar syncs external searchValue prop", () => {
    const { rerender } = render(<AppTopbar searchValue="MSFT" />);
    expect(screen.getByDisplayValue("MSFT")).toBeInTheDocument();
    rerender(<AppTopbar searchValue="NVDA" />);
    expect(screen.getByDisplayValue("NVDA")).toBeInTheDocument();
  });

  it("topbar uses default navigation for alerts and profile", () => {
    const mockRouterPush = useRouter().push as any;
    mockRouterPush.mockReset();
    render(<AppTopbar />);

    fireEvent.click(screen.getByRole("button", { name: "Open alerts" }));
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(mockRouterPush).toHaveBeenCalledWith("/watchlist");
    expect(mockRouterPush).toHaveBeenCalledWith("/settings");
  });

  it("topbar invokes explicit callbacks when provided", () => {
    const onAlertsClick = vi.fn();
    const onThemeClick = vi.fn();
    const onProfileClick = vi.fn();

    render(
      <AppTopbar
        onAlertsClick={onAlertsClick}
        onThemeClick={onThemeClick}
        onProfileClick={onProfileClick}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Open alerts" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme mode" }));
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(onAlertsClick).toHaveBeenCalledTimes(1);
    expect(onThemeClick).toHaveBeenCalledTimes(1);
    expect(onProfileClick).toHaveBeenCalledTimes(1);
  });
});
