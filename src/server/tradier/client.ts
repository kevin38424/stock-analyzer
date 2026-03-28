type TradierQuoteItem = {
  symbol?: string;
  description?: string;
  exch?: string;
  type?: string;
  last?: number | string;
  prevclose?: number | string;
  change_percentage?: number | string;
  market_cap?: number | string;
  volume?: number | string;
  open?: number | string;
  high?: number | string;
  low?: number | string;
  close?: number | string | null;
  bid?: number | string;
  ask?: number | string;
  bid_date?: number | string;
  ask_date?: number | string;
  trade_date?: number | string;
};

type TradierQuotesResponse = {
  quotes?: {
    quote?: TradierQuoteItem | TradierQuoteItem[];
  };
};

type TradierSearchResult = {
  symbol?: string;
  description?: string;
  exch?: string;
  type?: string;
};

type TradierSearchResponse = {
  securities?: {
    security?: TradierSearchResult | TradierSearchResult[];
  };
};

type TradierHistoryDay = {
  date?: string;
  open?: number | string;
  high?: number | string;
  low?: number | string;
  close?: number | string;
  volume?: number | string;
};

type TradierHistoryResponse = {
  history?: {
    day?: TradierHistoryDay | TradierHistoryDay[];
  };
};

type TradierTimesale = {
  time?: string;
  timestamp?: number | string;
  price?: number | string;
  volume?: number | string;
};

type TradierTimesalesResponse = {
  series?: {
    data?: TradierTimesale | TradierTimesale[];
  };
};

type TradierClockResponse = {
  clock?: {
    state?: string;
    timestamp?: string;
    next_open?: string;
    next_close?: string;
  };
};

type TradierCalendarResponse = {
  calendar?: {
    days?: {
      day?: Array<{
        date?: string;
        status?: string;
        description?: string;
        premarket?: { start?: string; end?: string };
        open?: { start?: string; end?: string };
        postmarket?: { start?: string; end?: string };
      }>;
    };
  };
};

type TradierStreamingSessionResponse = {
  stream?: {
    sessionid?: string;
  };
};

export type TradierSymbolType = "stock" | "option" | "etf" | "index" | string;

export type TradierSearchSecurity = {
  symbol: string;
  description: string;
  exchange: string | null;
  type: TradierSymbolType;
};

export type TradierQuoteSnapshot = {
  symbol: string;
  description: string | null;
  exchange: string | null;
  type: TradierSymbolType | null;
  price: number;
  previousClose: number | null;
  changePercent: number | null;
  marketCap: number | null;
  volume: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  bid: number | null;
  ask: number | null;
  asOf: string;
};

export type TradierHistoryBar = {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
};

export type TradierTimesalePoint = {
  time: string;
  timestamp: number | null;
  price: number | null;
  volume: number | null;
};

export type TradierMarketClock = {
  state: string | null;
  timestamp: string | null;
  nextOpen: string | null;
  nextClose: string | null;
};

export type TradierMarketCalendarDay = {
  date: string;
  status: string | null;
  description: string | null;
  premarket: { start: string | null; end: string | null };
  open: { start: string | null; end: string | null };
  postmarket: { start: string | null; end: string | null };
};

export type TradierClient = {
  searchSecurities: (query: string) => Promise<TradierSearchSecurity[]>;
  lookupSecurities: (query: string) => Promise<TradierSearchSecurity[]>;
  getQuotes: (symbols: string[], options?: { greeks?: boolean }) => Promise<TradierQuoteSnapshot[]>;
  postQuotes: (symbols: string[], options?: { greeks?: boolean }) => Promise<TradierQuoteSnapshot[]>;
  getQuotesAuto: (
    symbols: string[],
    options?: { greeks?: boolean; postThreshold?: number },
  ) => Promise<TradierQuoteSnapshot[]>;
  getHistory: (input: {
    symbol: string;
    interval?: "daily" | "weekly" | "monthly";
    start?: string;
    end?: string;
  }) => Promise<TradierHistoryBar[]>;
  getTimeSales: (input: {
    symbol: string;
    interval?: "tick" | "1min" | "5min" | "15min";
    start?: string;
    end?: string;
    sessionFilter?: "all" | "open";
  }) => Promise<TradierTimesalePoint[]>;
  getMarketClock: () => Promise<TradierMarketClock>;
  getMarketCalendar: (input?: { month?: number; year?: number }) => Promise<TradierMarketCalendarDay[]>;
  createMarketSession: () => Promise<{ sessionId: string; expiresAt: string }>;
};

type CreateTradierClientInput = {
  token: string;
  baseUrl?: string;
};

type RequestOptions = {
  method?: "GET" | "POST";
  params?: URLSearchParams;
  formBody?: URLSearchParams;
};

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function asNumber(value: number | string | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toIsoFromEpoch(value: number | string | null | undefined): string {
  const numeric = asNumber(value);
  if (numeric == null) return new Date().toISOString();
  const date = new Date(numeric);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function dedupeSymbols(symbols: string[]): string[] {
  return Array.from(
    new Set(
      symbols
        .map((symbol) => symbol.trim().toUpperCase())
        .filter((symbol) => symbol.length > 0),
    ),
  );
}

function normalizeSearchResults(payload: TradierSearchResponse): TradierSearchSecurity[] {
  return toArray(payload.securities?.security)
    .map((row) => {
      const symbol = row.symbol?.trim().toUpperCase();
      if (!symbol) return null;

      return {
        symbol,
        description: row.description?.trim() ?? symbol,
        exchange: row.exch?.trim() || null,
        type: (row.type?.trim().toLowerCase() ?? "stock") as TradierSymbolType,
      };
    })
    .filter((row): row is TradierSearchSecurity => Boolean(row));
}

function normalizeQuotes(payload: TradierQuotesResponse): TradierQuoteSnapshot[] {
  return toArray(payload.quotes?.quote)
    .map((row) => {
      const symbol = row.symbol?.trim().toUpperCase();
      const price = asNumber(row.last);
      if (!symbol || price == null || price <= 0) return null;

      const previousClose = asNumber(row.prevclose);
      const changePercentFromPayload = asNumber(row.change_percentage);
      const changePercentDerived =
        previousClose != null && previousClose > 0
          ? ((price - previousClose) / previousClose) * 100
          : null;
      const asOf =
        row.trade_date != null
          ? toIsoFromEpoch(row.trade_date)
          : row.ask_date != null
            ? toIsoFromEpoch(row.ask_date)
            : row.bid_date != null
              ? toIsoFromEpoch(row.bid_date)
              : new Date().toISOString();

      return {
        symbol,
        description: row.description ?? null,
        exchange: row.exch ?? null,
        type: row.type?.toLowerCase() ?? null,
        price,
        previousClose: previousClose != null && previousClose > 0 ? previousClose : null,
        changePercent: changePercentFromPayload ?? changePercentDerived,
        marketCap: asNumber(row.market_cap),
        volume: asNumber(row.volume),
        open: asNumber(row.open),
        high: asNumber(row.high),
        low: asNumber(row.low),
        close: asNumber(row.close),
        bid: asNumber(row.bid),
        ask: asNumber(row.ask),
        asOf,
      };
    })
    .filter((row): row is TradierQuoteSnapshot => Boolean(row));
}

function normalizeHistory(payload: TradierHistoryResponse): TradierHistoryBar[] {
  return toArray(payload.history?.day)
    .map((row) => {
      const date = row.date?.trim();
      if (!date) return null;
      return {
        date,
        open: asNumber(row.open),
        high: asNumber(row.high),
        low: asNumber(row.low),
        close: asNumber(row.close),
        volume: asNumber(row.volume),
      };
    })
    .filter((row): row is TradierHistoryBar => Boolean(row));
}

function normalizeTimesales(payload: TradierTimesalesResponse): TradierTimesalePoint[] {
  return toArray(payload.series?.data)
    .map((row) => {
      const time = row.time?.trim();
      if (!time) return null;

      return {
        time,
        timestamp: asNumber(row.timestamp),
        price: asNumber(row.price),
        volume: asNumber(row.volume),
      };
    })
    .filter((row): row is TradierTimesalePoint => Boolean(row));
}

function normalizeClock(payload: TradierClockResponse): TradierMarketClock {
  return {
    state: payload.clock?.state ?? null,
    timestamp: payload.clock?.timestamp ?? null,
    nextOpen: payload.clock?.next_open ?? null,
    nextClose: payload.clock?.next_close ?? null,
  };
}

function normalizeCalendar(payload: TradierCalendarResponse): TradierMarketCalendarDay[] {
  return (payload.calendar?.days?.day ?? [])
    .map((row) => {
      const date = row.date?.trim();
      if (!date) return null;

      return {
        date,
        status: row.status ?? null,
        description: row.description ?? null,
        premarket: {
          start: row.premarket?.start ?? null,
          end: row.premarket?.end ?? null,
        },
        open: {
          start: row.open?.start ?? null,
          end: row.open?.end ?? null,
        },
        postmarket: {
          start: row.postmarket?.start ?? null,
          end: row.postmarket?.end ?? null,
        },
      };
    })
    .filter((row): row is TradierMarketCalendarDay => Boolean(row));
}

export function createTradierClient(input: CreateTradierClientInput): TradierClient {
  const endpoint = (input.baseUrl ?? "https://api.tradier.com/v1").replace(/\/+$/, "");

  async function requestJson<T>(path: string, options?: RequestOptions): Promise<T> {
    const method = options?.method ?? "GET";
    const url = new URL(`${endpoint}${path}`);
    if (options?.params) {
      url.search = options.params.toString();
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${input.token}`,
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      },
      body: options?.formBody?.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Tradier request failed (${method} ${path}): ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async function getQuotesInternal(
    symbols: string[],
    options?: { greeks?: boolean; method?: "GET" | "POST" },
  ): Promise<TradierQuoteSnapshot[]> {
    const normalizedSymbols = dedupeSymbols(symbols);
    if (normalizedSymbols.length === 0) return [];

    const greeks = options?.greeks ?? false;
    const symbolsValue = normalizedSymbols.join(",");
    const method = options?.method ?? "GET";

    if (method === "POST") {
      const payload = await requestJson<TradierQuotesResponse>("/markets/quotes", {
        method: "POST",
        formBody: new URLSearchParams({
          symbols: symbolsValue,
          greeks: String(greeks),
        }),
      });
      return normalizeQuotes(payload);
    }

    const payload = await requestJson<TradierQuotesResponse>("/markets/quotes", {
      params: new URLSearchParams({
        symbols: symbolsValue,
        greeks: String(greeks),
      }),
    });
    return normalizeQuotes(payload);
  }

  return {
    async searchSecurities(query) {
      const q = query.trim();
      if (!q) return [];
      const payload = await requestJson<TradierSearchResponse>("/markets/search", {
        params: new URLSearchParams({ q }),
      });
      return normalizeSearchResults(payload);
    },

    async lookupSecurities(query) {
      const q = query.trim();
      if (!q) return [];
      const payload = await requestJson<TradierSearchResponse>("/markets/lookup", {
        params: new URLSearchParams({ q }),
      });
      return normalizeSearchResults(payload);
    },

    getQuotes(symbols, options) {
      return getQuotesInternal(symbols, { greeks: options?.greeks, method: "GET" });
    },

    postQuotes(symbols, options) {
      return getQuotesInternal(symbols, { greeks: options?.greeks, method: "POST" });
    },

    getQuotesAuto(symbols, options) {
      const threshold = options?.postThreshold ?? 40;
      const method: "GET" | "POST" = dedupeSymbols(symbols).length > threshold ? "POST" : "GET";
      return getQuotesInternal(symbols, { greeks: options?.greeks, method });
    },

    async getHistory(inputValue) {
      const payload = await requestJson<TradierHistoryResponse>("/markets/history", {
        params: new URLSearchParams({
          symbol: inputValue.symbol.trim().toUpperCase(),
          interval: inputValue.interval ?? "daily",
          ...(inputValue.start ? { start: inputValue.start } : {}),
          ...(inputValue.end ? { end: inputValue.end } : {}),
        }),
      });
      return normalizeHistory(payload);
    },

    async getTimeSales(inputValue) {
      const payload = await requestJson<TradierTimesalesResponse>("/markets/timesales", {
        params: new URLSearchParams({
          symbol: inputValue.symbol.trim().toUpperCase(),
          interval: inputValue.interval ?? "1min",
          ...(inputValue.start ? { start: inputValue.start } : {}),
          ...(inputValue.end ? { end: inputValue.end } : {}),
          ...(inputValue.sessionFilter ? { session_filter: inputValue.sessionFilter } : {}),
        }),
      });
      return normalizeTimesales(payload);
    },

    async getMarketClock() {
      const payload = await requestJson<TradierClockResponse>("/markets/clock");
      return normalizeClock(payload);
    },

    async getMarketCalendar(inputValue) {
      const payload = await requestJson<TradierCalendarResponse>("/markets/calendar", {
        params: new URLSearchParams({
          ...(inputValue?.month != null ? { month: String(inputValue.month) } : {}),
          ...(inputValue?.year != null ? { year: String(inputValue.year) } : {}),
        }),
      });
      return normalizeCalendar(payload);
    },

    async createMarketSession() {
      const payload = await requestJson<TradierStreamingSessionResponse>("/markets/events/session", {
        method: "POST",
      });
      const sessionId = payload.stream?.sessionid;
      if (!sessionId) {
        throw new Error("Tradier stream session response missing sessionid.");
      }

      return {
        sessionId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      };
    },
  };
}

export function createTradierClientFromEnv(): TradierClient | null {
  const token = process.env.TRADIER_API_TOKEN?.trim();
  if (!token) return null;
  return createTradierClient({
    token,
    baseUrl: process.env.TRADIER_BASE_URL,
  });
}
