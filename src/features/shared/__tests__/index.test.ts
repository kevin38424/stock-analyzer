import { describe, expect, it } from "vitest";
import { AppSidebar, AppTopbar, appLayoutClasses } from "@/features/shared";
import * as sharedIndex from "@/features/shared/index";

describe("shared exports", () => {
  it("exports shared modules", () => {
    expect(AppSidebar).toBeTypeOf("function");
    expect(AppTopbar).toBeTypeOf("function");
    expect(appLayoutClasses.page).toContain("min-h-screen");
    expect(sharedIndex.AppSidebar).toBeTypeOf("function");
  });
});
