import type {
  InsiderTransaction,
  RangeOption,
  StockDetailsResponse,
} from "@/features/stocks/types/stock-details";
import { getMockStockDetails } from "@/server/mock-stock-details";
import { logServerError } from "@/server/observability/log-server-error";
import {
  toStockDetailsAnalystRecommendation,
  toStockDetailsPeerRating,
  toStockDetailsRatingLabel,
} from "@/server/recommendations";
import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/server/supabase-server";

type CompanyRow = {
  id: string;
  ticker: string;
  company_name: string;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  headquarters: string | null;
};

type QuoteRow = {
  price: number | null;
  previous_close: number | null;
  change_percent: number | null;
  fetched_at: string;
};

type ScoreRow = {
  valuation_score: number;
  profitability_score: number;
  growth_score: number;
  health_score: number;
  momentum_score: number;
  total_score: number;
  recommendation: string | null;
};

type PriceBarRow = {
  trading_date: string;
  close: number;
};

type TechnicalRow = {
  trading_date: string;
  sma_200: number | null;
};

type HighlightsRow = {
  attractive_points: string[] | null;
  risk_points: string[] | null;
};

type FinancialSnapshotRow = {
  pe_ratio: number | null;
  ev_ebitda: number | null;
  price_to_sales: number | null;
  gross_margin: number | null;
  net_margin: number | null;
  roe: number | null;
  revenue_growth_3y: number | null;
  eps_growth_3y: number | null;
  fcf_growth_3y: number | null;
};

type AnalystRow = {
  recommendation: string | null;
  analyst_count: number | null;
  target_high: number | null;
  target_median: number | null;
  target_low: number | null;
};

type NewsRow = {
  id: string;
  kind: string;
  published_at: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  url: string | null;
};

type InsiderRow = {
  id: string;
  insider_name: string;
  insider_role: string | null;
  transaction_date: string;
  transaction_type: string;
  shares: number | null;
  value_usd: number | null;
};

type PeerBaseRow = {
  company_id: string;
  ticker: string;
  total_score: number;
  recommendation: string | null;
};

type PeerCompanyRow = {
  id: string;
  market_cap: number | null;
};

type PeerMetricRow = {
  company_id: string;
  pe_ratio: number | null;
  period_end: string;
};

function rangeToLimit(range: RangeOption): number {
  if (range === "1D") return 1;
  if (range === "1W") return 5;
  if (range === "1M") return 22;
  if (range === "1Y") return 252;
  return 400;
}

function toNewsKind(kind: string): StockDetailsResponse["news"][number]["kind"] {
  const normalized = kind.trim().toUpperCase();
  return normalized === "ANALYSIS" ? "ANALYSIS" : "MARKET NEWS";
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "N/A";
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function formatMultiple(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "N/A";
  return `${value.toFixed(1)}x`;
}

function toMarketCapTrillions(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0;
  return value / 1_000_000_000_000;
}

function toInsiderLabel(row: InsiderRow): string {
  const action = row.transaction_type.trim().toLowerCase();
  if (action.includes("sell")) return "Sold";
  if (action.includes("buy")) return "Bought";
  if (action.includes("exercise")) return "Exercised Options";
  return row.transaction_type;
}

function toInsiderValueLabel(row: InsiderRow): string {
  if (row.value_usd != null && Number.isFinite(row.value_usd)) {
    const millions = row.value_usd / 1_000_000;
    return `$${millions.toFixed(1)}M`;
  }
  if (row.shares != null && Number.isFinite(row.shares)) {
    return `${Math.round(row.shares / 1000)}k Shares`;
  }
  return "N/A";
}

function toInsiderTone(row: InsiderRow): InsiderTransaction["tone"] {
  return row.transaction_type.toLowerCase().includes("sell") ? "sell" : "buy";
}

export async function getStockDetailsDataLive(input: {
  ticker: string;
  range: RangeOption;
}): Promise<StockDetailsResponse | null> {
  const normalizedTicker = input.ticker.toUpperCase();
  if (!hasServerSupabaseEnv()) {
    return getMockStockDetails(normalizedTicker, input.range);
  }

  try {
    const supabase = createServerSupabaseClient();
    const companyResult = await supabase
      .from("companies")
      .select("id,ticker,company_name,exchange,sector,industry,headquarters")
      .eq("ticker", normalizedTicker)
      .maybeSingle();

    if (companyResult.error || !companyResult.data) {
      return getMockStockDetails(normalizedTicker, input.range);
    }

    const company = companyResult.data as CompanyRow;
    const limit = rangeToLimit(input.range);

    const [
      quoteResult,
      scoreResult,
      barsResult,
      technicalsResult,
      highlightsResult,
      financialResult,
      analystResult,
      newsResult,
      insiderResult,
      peersResult,
    ] = await Promise.all([
      supabase
        .from("v_company_quotes_latest")
        .select("price,previous_close,change_percent,fetched_at")
        .eq("company_id", company.id)
        .maybeSingle(),
      supabase
        .from("v_stock_scores_latest")
        .select("valuation_score,profitability_score,growth_score,health_score,momentum_score,total_score,recommendation")
        .eq("company_id", company.id)
        .maybeSingle(),
      supabase
        .from("stock_price_history_daily")
        .select("trading_date,close")
        .eq("company_id", company.id)
        .order("trading_date", { ascending: false })
        .limit(limit),
      supabase
        .from("stock_technicals_daily")
        .select("trading_date,sma_200")
        .eq("company_id", company.id)
        .order("trading_date", { ascending: false })
        .limit(limit),
      supabase
        .from("stock_highlights_daily")
        .select("attractive_points,risk_points")
        .eq("company_id", company.id)
        .order("as_of_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("financial_metric_snapshots")
        .select("pe_ratio,ev_ebitda,price_to_sales,gross_margin,net_margin,roe,revenue_growth_3y,eps_growth_3y,fcf_growth_3y")
        .eq("company_id", company.id)
        .eq("period_type", "TTM")
        .order("period_end", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("analyst_consensus_snapshots")
        .select("recommendation,analyst_count,target_high,target_median,target_low")
        .eq("company_id", company.id)
        .order("as_of_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("company_news")
        .select("id,kind,published_at,title,summary,image_url,url")
        .eq("company_id", company.id)
        .order("published_at", { ascending: false })
        .limit(5),
      supabase
        .from("insider_transactions")
        .select("id,insider_name,insider_role,transaction_date,transaction_type,shares,value_usd")
        .eq("company_id", company.id)
        .order("transaction_date", { ascending: false })
        .limit(5),
      supabase
        .from("v_top_stock_cards_latest")
        .select("company_id,ticker,total_score,recommendation")
        .eq("valuation_style", "growth")
        .eq("sector", company.sector ?? "")
        .order("total_score", { ascending: false })
        .limit(8),
    ]);

    const quote = (quoteResult.data ?? null) as QuoteRow | null;
    const score = (scoreResult.data ?? null) as ScoreRow | null;
    const bars = ((barsResult.data ?? []) as PriceBarRow[]).slice().reverse();
    const technicals = ((technicalsResult.data ?? []) as TechnicalRow[]).slice().reverse();
    const highlights = (highlightsResult.data ?? null) as HighlightsRow | null;
    const financial = (financialResult.data ?? null) as FinancialSnapshotRow | null;
    const analyst = (analystResult.data ?? null) as AnalystRow | null;
    const news = (newsResult.data ?? []) as NewsRow[];
    const insider = (insiderResult.data ?? []) as InsiderRow[];
    const peersRaw = (peersResult.data ?? []) as PeerBaseRow[];

    const technicalByDate = new Map(technicals.map((row) => [row.trading_date, row]));
    const points = bars.map((bar) => ({
      date: bar.trading_date,
      price: Number(bar.close),
      sma200: Number(technicalByDate.get(bar.trading_date)?.sma_200 ?? bar.close),
    }));

    const peerIds = peersRaw.map((row) => row.company_id);
    const [peerCompaniesResult, peerMetricsResult] = await Promise.all([
      peerIds.length
        ? supabase.from("companies").select("id,market_cap").in("id", peerIds)
        : Promise.resolve({ data: [] as PeerCompanyRow[], error: null }),
      peerIds.length
        ? supabase
            .from("financial_metric_snapshots")
            .select("company_id,pe_ratio,period_end")
            .eq("period_type", "TTM")
            .in("company_id", peerIds)
            .order("period_end", { ascending: false })
        : Promise.resolve({ data: [] as PeerMetricRow[], error: null }),
    ]);

    const marketCapByCompany = new Map(
      ((peerCompaniesResult.data ?? []) as PeerCompanyRow[]).map((row) => [row.id, row.market_cap]),
    );
    const peByCompany = new Map<string, number>();
    for (const row of (peerMetricsResult.data ?? []) as PeerMetricRow[]) {
      if (!peByCompany.has(row.company_id) && row.pe_ratio != null) {
        peByCompany.set(row.company_id, row.pe_ratio);
      }
    }

    const peerComparison = peersRaw.slice(0, 3).map((row) => ({
      ticker: row.ticker,
      score: Math.round(Number(row.total_score)),
      pe: Number(peByCompany.get(row.company_id) ?? 0),
      marketCapUsdTrillion: toMarketCapTrillions(marketCapByCompany.get(row.company_id)),
      rating: toStockDetailsPeerRating(row.recommendation),
    }));

    const insiderActivity = insider.map((row) => ({
      id: row.id,
      name: row.insider_name,
      role: row.insider_role ?? "",
      date: row.transaction_date,
      actionLabel: toInsiderLabel(row),
      valueLabel: toInsiderValueLabel(row),
      tone: toInsiderTone(row),
    }));

    const net3mSellUsd = insider.reduce((sum, row) => {
      const value = row.value_usd ?? 0;
      return row.transaction_type.toLowerCase().includes("sell") ? sum + value : sum - value;
    }, 0);

    const lastPrice = Number(quote?.price ?? points.at(-1)?.price ?? 0);
    const previousClose = quote?.previous_close;
    const change = previousClose && previousClose > 0 ? lastPrice - previousClose : 0;
    const changePercent = Number(
      quote?.change_percent ??
        (previousClose && previousClose > 0 ? (change / previousClose) * 100 : 0),
    );

    return {
      ticker: company.ticker,
      companyName: company.company_name,
      exchange: company.exchange ?? "NASDAQ",
      sector: company.sector ?? "Unknown",
      industry: company.industry ?? "Unknown",
      headquarters: company.headquarters ?? "Unknown",
      priceSummary: {
        lastPrice,
        change,
        changePercent,
        asOf: quote?.fetched_at ?? new Date().toISOString(),
      },
      rating: {
        score: Math.round(Number(score?.total_score ?? 0)),
        outOf: 100,
        label: toStockDetailsRatingLabel(score?.recommendation),
      },
      pricePerformance: {
        range: input.range,
        points,
      },
      scoreBreakdown: [
        { key: "valuation", label: "Valuation", weightPct: 30, score: Math.round(Number(score?.valuation_score ?? 0)) },
        { key: "profitability", label: "Profitability", weightPct: 20, score: Math.round(Number(score?.profitability_score ?? 0)) },
        { key: "growth", label: "Growth", weightPct: 20, score: Math.round(Number(score?.growth_score ?? 0)) },
        { key: "health", label: "Health", weightPct: 15, score: Math.round(Number(score?.health_score ?? 0)) },
        { key: "momentum", label: "Momentum", weightPct: 10, score: Math.round(Number(score?.momentum_score ?? 0)) },
      ],
      highlights: {
        attractive: highlights?.attractive_points?.length
          ? highlights.attractive_points
          : ["Strong profitability profile relative to peers."],
        risks: highlights?.risk_points?.length
          ? highlights.risk_points
          : ["Macro and valuation volatility may increase downside risk."],
      },
      financialMetrics: [
        {
          title: "VALUATION",
          badge: "Elevated",
          badgeTone: "amber",
          rows: [
            { label: "P/E Ratio (TTM)", value: formatMultiple(financial?.pe_ratio) },
            { label: "EV/EBITDA", value: formatMultiple(financial?.ev_ebitda) },
            { label: "Price / Sales", value: formatMultiple(financial?.price_to_sales) },
          ],
        },
        {
          title: "PROFITABILITY",
          badge: "Elite",
          badgeTone: "emerald",
          rows: [
            { label: "Gross Margin", value: formatPercent(financial?.gross_margin) },
            { label: "Net Margin", value: formatPercent(financial?.net_margin) },
            { label: "ROE", value: formatPercent(financial?.roe) },
          ],
        },
        {
          title: "GROWTH (3Y)",
          badge: "Strong",
          badgeTone: "emerald",
          rows: [
            { label: "Revenue Growth", value: formatPercent(financial?.revenue_growth_3y) },
            { label: "EPS Growth", value: formatPercent(financial?.eps_growth_3y) },
            { label: "FCF Growth", value: formatPercent(financial?.fcf_growth_3y) },
          ],
        },
      ],
      peerComparison,
      analystConsensus: {
        recommendation: toStockDetailsAnalystRecommendation(analyst?.recommendation),
        analystCount: Number(analyst?.analyst_count ?? 0),
        targetHigh: Number(analyst?.target_high ?? 0),
        targetMedian: Number(analyst?.target_median ?? 0),
        targetLow: Number(analyst?.target_low ?? 0),
      },
      news: news.map((row) => ({
        id: row.id,
        kind: toNewsKind(row.kind),
        publishedAt: row.published_at,
        title: row.title,
        summary: row.summary ?? "",
        imageUrl: row.image_url ?? undefined,
        url: row.url ?? undefined,
      })),
      insiderActivity: {
        transactions: insiderActivity,
        net3mSellUsd: Math.round(net3mSellUsd),
      },
      meta: {
        generatedAt: new Date().toISOString(),
        sourceCoverage: [
          "supabase:companies",
          "supabase:v_company_quotes_latest",
          "supabase:v_stock_scores_latest",
          "supabase:stock_price_history_daily",
          "supabase:stock_technicals_daily",
          "supabase:financial_metric_snapshots",
          "supabase:analyst_consensus_snapshots",
          "supabase:company_news",
          "supabase:insider_transactions",
        ],
        isMock: false,
      },
    };
  } catch (error) {
    logServerError("stocks.getStockDetailsDataLive", error, { ticker: normalizedTicker, range: input.range });
    return getMockStockDetails(normalizedTicker, input.range);
  }
}
