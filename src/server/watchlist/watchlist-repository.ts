import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolvedCompany = {
  id: string;
  ticker: string;
  companyName: string;
};

export async function resolveCompany(
  supabase: SupabaseClient,
  input: { companyId?: string; ticker?: string },
): Promise<ResolvedCompany | null> {
  if (input.companyId) {
    const { data, error } = await supabase
      .from("companies")
      .select("id, ticker, company_name")
      .eq("id", input.companyId)
      .maybeSingle();

    if (error || !data) return null;
    return { id: data.id, ticker: data.ticker, companyName: data.company_name };
  }

  if (input.ticker) {
    const ticker = input.ticker.toUpperCase();
    const { data, error } = await supabase
      .from("companies")
      .select("id, ticker, company_name")
      .eq("ticker", ticker)
      .maybeSingle();

    if (error || !data) return null;
    return { id: data.id, ticker: data.ticker, companyName: data.company_name };
  }

  return null;
}
