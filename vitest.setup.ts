import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: any) =>
    React.createElement("a", { href: typeof href === "string" ? href : "", ...rest }, children),
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-body", className: "font-body" }),
  Space_Grotesk: () => ({ variable: "--font-display", className: "font-display" }),
  JetBrains_Mono: () => ({ variable: "--font-data", className: "font-data" }),
}));

export { push as mockRouterPush };
