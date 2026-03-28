import { describe, expect, it } from "vitest";
import { appLayoutClasses } from "@/features/shared/styles/layout";

describe("layout styles", () => {
  it("exports class map", () => {
    expect(appLayoutClasses.page).toContain("min-h-screen");
    expect(appLayoutClasses.shell).toContain("grid");
    expect(appLayoutClasses.content).toContain("px-6");
    expect(appLayoutClasses.panel).toContain("rounded-xl");
  });
});
