import { describe, expect, it } from "vitest";
import { getRequestUserId } from "@/server/http/request-context";

describe("getRequestUserId", () => {
  it("prefers header user id", () => {
    const req = { headers: new Headers({ "x-user-id": "header-id" }) } as any;
    expect(getRequestUserId(req, "query-id")).toBe("header-id");
  });

  it("falls back to query user id", () => {
    const req = { headers: new Headers() } as any;
    expect(getRequestUserId(req, "query-id")).toBe("query-id");
  });
});
