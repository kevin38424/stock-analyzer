import { describe, expect, it, vi } from "vitest";
import { resolveCompany } from "@/server/watchlist/watchlist-repository";

function makeSupabase(result: { data: any; error: any }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eqTicker = vi.fn().mockReturnValue({ maybeSingle });
  const eqId = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq: (field: string) => (field === "id" ? { maybeSingle } : { maybeSingle }) });
  const from = vi.fn().mockReturnValue({ select, eq: (field: string) => (field === "id" ? { maybeSingle } : { maybeSingle }) });
  return { from } as any;
}

describe("resolveCompany", () => {
  it("resolves by companyId", async () => {
    const supabase = makeSupabase({ data: { id: "1", ticker: "AAPL", company_name: "Apple" }, error: null });
    await expect(resolveCompany(supabase, { companyId: "1" })).resolves.toEqual({
      id: "1",
      ticker: "AAPL",
      companyName: "Apple",
    });
  });

  it("resolves by uppercased ticker", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: "1", ticker: "AAPL", company_name: "Apple" }, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const supabase = { from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) }) } as any;

    const out = await resolveCompany(supabase, { ticker: "aapl" });
    expect(out?.ticker).toBe("AAPL");
    expect(eq).toHaveBeenCalledWith("ticker", "AAPL");
  });

  it("returns null for missing input or query failures", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "x" } });
    const supabase = { from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle }) }) }) } as any;

    await expect(resolveCompany(supabase, { ticker: "x" })).resolves.toBeNull();
    await expect(resolveCompany(supabase, {})).resolves.toBeNull();
  });

  it("returns null for companyId query failures", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "x" } });
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle }) }),
      }),
    } as any;
    await expect(resolveCompany(supabase, { companyId: "bad-id" })).resolves.toBeNull();
  });
});
