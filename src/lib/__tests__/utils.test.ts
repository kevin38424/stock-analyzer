import { describe, expect, it } from "vitest";
import { average, clamp, round } from "@/lib/utils";

describe("utils", () => {
  it("clamp bounds numbers", () => {
    expect(clamp(120)).toBe(100);
    expect(clamp(-5)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("average handles empty and filled arrays", () => {
    expect(average([])).toBe(0);
    expect(average([2, 4, 6])).toBe(4);
  });

  it("round respects decimals", () => {
    expect(round(1.2345)).toBe(1.23);
    expect(round(1.2355, 3)).toBe(1.236);
  });
});
