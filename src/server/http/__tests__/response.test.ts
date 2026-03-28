import { describe, expect, it } from "vitest";
import { badRequest, notFound, ok, serverError } from "@/server/http/response";

async function read(res: Response) {
  return { status: res.status, body: await res.json() };
}

describe("api responses", () => {
  it("returns ok response", async () => {
    const res = ok({ a: 1 }, 201);
    await expect(read(res)).resolves.toEqual({ status: 201, body: { a: 1 } });
  });

  it("returns error helpers", async () => {
    await expect(read(badRequest("bad"))).resolves.toEqual({ status: 400, body: { error: "bad" } });
    await expect(read(notFound("no"))).resolves.toEqual({ status: 404, body: { error: "no" } });
    await expect(read(serverError("oops"))).resolves.toEqual({ status: 500, body: { error: "oops" } });
  });
});
