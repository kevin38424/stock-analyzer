import type { WatchlistQuery, WatchlistSegment } from "@/features/watchlist/types/watchlist";
import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/server/supabase-server";
import { logServerError } from "@/server/observability/log-server-error";
import { getWatchlistPageData } from "@/server/watchlist/get-watchlist-page-data-live";
import { resolveCompany } from "@/server/watchlist/watchlist-repository";
import type { SupabaseClient } from "@supabase/supabase-js";

const missingSupabaseMessage =
  "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.";

export type WatchlistCreateInput = {
  userId: string;
  ticker?: string;
  companyId?: string;
  segment: WatchlistSegment;
  thesis?: string;
};

export type WatchlistUpdateInput = {
  userId: string;
  ticker?: string;
  companyId?: string;
  segment?: WatchlistSegment;
  thesis?: string | null;
};

export type WatchlistDeleteInput = {
  userId: string;
  ticker?: string;
  companyId?: string;
};

export type WatchlistMutationResult =
  | { kind: "ok"; data: unknown; status?: number }
  | { kind: "not_found"; message: string }
  | { kind: "error"; message: string };

function toServiceErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return missingSupabaseMessage;
}

async function resolveCompanyOrNotFound(
  supabase: SupabaseClient,
  input: Pick<WatchlistCreateInput, "ticker" | "companyId">,
): Promise<{ kind: "ok"; companyId: string } | { kind: "not_found"; message: string }> {
  const company = await resolveCompany(supabase, {
    companyId: input.companyId,
    ticker: input.ticker,
  });

  if (!company) {
    return {
      kind: "not_found",
      message: "Company not found for the provided ticker/companyId.",
    };
  }

  return { kind: "ok", companyId: company.id };
}

export async function fetchWatchlistPageData(query: WatchlistQuery) {
  return getWatchlistPageData(query);
}

export async function createOrUpdateWatchlistItem(input: WatchlistCreateInput): Promise<WatchlistMutationResult> {
  if (!hasServerSupabaseEnv()) {
    return {
      kind: "ok",
      data: {
        success: true,
        data: {
          id: "mock-watchlist-item",
          user_id: input.userId,
          ticker: input.ticker?.toUpperCase() ?? null,
          company_id: input.companyId ?? null,
          segment: input.segment,
          thesis: input.thesis ?? null,
          thesis_updated_at: input.thesis ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
        },
      },
      status: 201,
    };
  }

  try {
    const supabase = createServerSupabaseClient();
    const resolved = await resolveCompanyOrNotFound(supabase, input);
    if (resolved.kind !== "ok") {
      return resolved;
    }

    const nowIso = new Date().toISOString();

    const { data: updatedRows, error: updateError } = await supabase
      .from("user_favorites")
      .update({
        segment: input.segment,
        thesis: input.thesis ?? null,
        thesis_updated_at: input.thesis ? nowIso : null,
      })
      .eq("user_id", input.userId)
      .eq("company_id", resolved.companyId)
      .select("id, user_id, ticker, company_id, segment, thesis, thesis_updated_at, created_at")
      .limit(1);

    if (updateError) {
      return { kind: "error", message: updateError.message };
    }

    if (updatedRows && updatedRows.length > 0) {
      return {
        kind: "ok",
        data: { success: true, data: updatedRows[0] },
        status: 200,
      };
    }

    const { data: inserted, error: insertError } = await supabase
      .from("user_favorites")
      .insert({
        user_id: input.userId,
        company_id: resolved.companyId,
        segment: input.segment,
        thesis: input.thesis ?? null,
        thesis_updated_at: input.thesis ? nowIso : null,
      })
      .select("id, user_id, ticker, company_id, segment, thesis, thesis_updated_at, created_at")
      .single();

    if (insertError) {
      return { kind: "error", message: insertError.message };
    }

    return {
      kind: "ok",
      data: { success: true, data: inserted },
      status: 201,
    };
  } catch (error) {
    logServerError("watchlist.createOrUpdateWatchlistItem", error, {
      userId: input.userId,
      ticker: input.ticker,
      companyId: input.companyId,
    });
    return { kind: "error", message: toServiceErrorMessage(error) };
  }
}

export async function patchWatchlistItem(input: WatchlistUpdateInput): Promise<WatchlistMutationResult> {
  if (!hasServerSupabaseEnv()) {
    return {
      kind: "ok",
      data: {
        success: true,
        data: {
          user_id: input.userId,
          ticker: input.ticker?.toUpperCase() ?? null,
          company_id: input.companyId ?? null,
          segment: input.segment ?? "all_holdings",
          thesis: input.thesis ?? null,
          thesis_updated_at: new Date().toISOString(),
        },
      },
    };
  }

  try {
    const supabase = createServerSupabaseClient();
    const resolved = await resolveCompanyOrNotFound(supabase, input);
    if (resolved.kind !== "ok") {
      return resolved;
    }

    const query = supabase.from("user_favorites").update({
      ...(input.segment ? { segment: input.segment } : {}),
      ...(input.thesis !== undefined
        ? {
            thesis: input.thesis,
            thesis_updated_at: new Date().toISOString(),
          }
        : {}),
    });

    const { data, error } = await query
      .eq("user_id", input.userId)
      .eq("company_id", resolved.companyId)
      .select("id, user_id, ticker, company_id, segment, thesis, thesis_updated_at, created_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { kind: "not_found", message: error.message };
      }

      return { kind: "error", message: error.message };
    }

    return { kind: "ok", data: { success: true, data } };
  } catch (error) {
    logServerError("watchlist.patchWatchlistItem", error, {
      userId: input.userId,
      ticker: input.ticker,
      companyId: input.companyId,
    });
    return { kind: "error", message: toServiceErrorMessage(error) };
  }
}

export async function removeWatchlistItem(input: WatchlistDeleteInput): Promise<WatchlistMutationResult> {
  if (!hasServerSupabaseEnv()) {
    return {
      kind: "ok",
      data: {
        success: true,
        data: {
          user_id: input.userId,
          ticker: input.ticker?.toUpperCase() ?? null,
          company_id: input.companyId ?? null,
        },
      },
    };
  }

  try {
    const supabase = createServerSupabaseClient();
    const resolved = await resolveCompanyOrNotFound(supabase, input);
    if (resolved.kind !== "ok") {
      return resolved;
    }

    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", input.userId)
      .eq("company_id", resolved.companyId);

    if (error) {
      return { kind: "error", message: error.message };
    }

    return { kind: "ok", data: { success: true } };
  } catch (error) {
    logServerError("watchlist.removeWatchlistItem", error, {
      userId: input.userId,
      ticker: input.ticker,
      companyId: input.companyId,
    });
    return { kind: "error", message: toServiceErrorMessage(error) };
  }
}
