import type { SupabaseClient } from "@supabase/supabase-js";
import { createTradierClient } from "@/server/tradier/client";

export type TradierStreamStatus = "idle" | "connecting" | "streaming" | "reconnecting" | "error";

export type TradierStreamSubscribePayload = {
  symbols: string[];
  sessionid: string;
  filter?: Array<"trade" | "quote" | "summary" | "timesale" | "tradex">;
  linebreak?: boolean;
  validOnly?: boolean;
  advancedDetails?: boolean;
};

export function buildTradierStreamSubscribePayload(input: {
  sessionId: string;
  symbols: string[];
  filter?: Array<"trade" | "quote" | "summary" | "timesale" | "tradex">;
}): TradierStreamSubscribePayload {
  return {
    symbols: Array.from(new Set(input.symbols.map((symbol) => symbol.toUpperCase()))),
    sessionid: input.sessionId,
    filter: input.filter ?? ["quote", "trade", "summary"],
    linebreak: true,
    validOnly: true,
    advancedDetails: false,
  };
}

export async function createTradierStreamingSession(input: {
  token: string;
  baseUrl?: string;
}): Promise<{ sessionId: string; expiresAt: string }> {
  const client = createTradierClient({ token: input.token, baseUrl: input.baseUrl });
  return client.createMarketSession();
}

export async function upsertTradierStreamState(
  supabase: SupabaseClient,
  state: {
    status: TradierStreamStatus;
    sessionId?: string | null;
    sessionExpiresAt?: string | null;
    desiredSymbols?: string[];
    activeSymbols?: string[];
    lastHeartbeatAt?: string | null;
    lastError?: string | null;
  },
): Promise<void> {
  await supabase.from("market_stream_state").upsert(
    {
      id: true,
      provider: "tradier",
      status: state.status,
      session_id: state.sessionId ?? null,
      session_expires_at: state.sessionExpiresAt ?? null,
      desired_symbols: state.desiredSymbols ?? [],
      active_symbols: state.activeSymbols ?? [],
      last_heartbeat_at: state.lastHeartbeatAt ?? null,
      last_error: state.lastError ?? null,
      session_started_at: state.sessionId ? new Date().toISOString() : null,
    },
    { onConflict: "id" },
  );
}
