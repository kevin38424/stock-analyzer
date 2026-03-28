import { describe, expect, it } from "vitest";
import { HomeDashboard, useHomeDashboard } from "@/features/home";
import * as homeIndex from "@/features/home/index";

describe("home export", () => {
  it("exports home dashboard", () => {
    expect(HomeDashboard).toBeTypeOf("function");
    expect(homeIndex.HomeDashboard).toBeTypeOf("function");
    expect(useHomeDashboard).toBeTypeOf("function");
    expect(homeIndex.useHomeDashboard).toBeTypeOf("function");
  });
});
