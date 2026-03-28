import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseJsonBody, parseQueryParams, parseWithSchema } from "@/server/http/parsing";

describe("api parsing", () => {
  it("parseJsonBody returns parsed JSON", async () => {
    const req = { json: async () => ({ ok: true }) } as any;
    await expect(parseJsonBody(req)).resolves.toEqual({ ok: true });
  });

  it("parseJsonBody returns null on invalid JSON", async () => {
    const req = { json: async () => { throw new Error("bad"); } } as any;
    await expect(parseJsonBody(req)).resolves.toBeNull();
  });

  it("parseWithSchema validates and returns null on failure", () => {
    const schema = z.object({ n: z.number() });
    expect(parseWithSchema({ n: 2 }, schema)).toEqual({ n: 2 });
    expect(parseWithSchema({ n: "2" }, schema)).toBeNull();
  });

  it("parseQueryParams maps from request params", () => {
    const req = { nextUrl: { searchParams: new URLSearchParams("a=3") } } as any;
    const schema = z.object({ a: z.coerce.number().min(1) });
    expect(parseQueryParams(req, schema, (p) => ({ a: p.get("a") }))).toEqual({ a: 3 });

    const invalidSchema = z.object({ a: z.number().min(5) });
    expect(parseQueryParams(req, invalidSchema, () => ({ a: 1 }))).toBeNull();
  });
});
