import type { RangeOption, StockDetailsResponse } from "@/features/stocks/types/stock-details";

const monthlyPricePoints = [
  { date: "2026-01-24", price: 180.5, sma200: 176.2 },
  { date: "2026-01-27", price: 181.4, sma200: 176.5 },
  { date: "2026-01-30", price: 178.1, sma200: 176.8 },
  { date: "2026-02-03", price: 179.3, sma200: 177.0 },
  { date: "2026-02-06", price: 183.6, sma200: 177.4 },
  { date: "2026-02-10", price: 186.8, sma200: 177.8 },
  { date: "2026-02-13", price: 182.0, sma200: 178.1 },
  { date: "2026-02-18", price: 176.7, sma200: 178.4 },
  { date: "2026-02-21", price: 177.5, sma200: 178.6 },
  { date: "2026-02-25", price: 184.8, sma200: 179.0 },
  { date: "2026-02-28", price: 188.6, sma200: 179.4 },
  { date: "2026-03-04", price: 191.2, sma200: 179.8 },
  { date: "2026-03-07", price: 186.3, sma200: 180.1 },
  { date: "2026-03-11", price: 182.1, sma200: 180.5 },
  { date: "2026-03-14", price: 185.0, sma200: 180.7 },
  { date: "2026-03-18", price: 189.4, sma200: 181.1 },
];

const mockByTicker: Record<string, Omit<StockDetailsResponse, "pricePerformance" | "meta">> = {
  AAPL: {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Electronics",
    industry: "Hardware",
    headquarters: "Cupertino, CA",
    priceSummary: {
      lastPrice: 189.43,
      change: 2.45,
      changePercent: 1.31,
      asOf: "2026-03-18T16:00:00-04:00",
    },
    rating: {
      score: 88,
      outOf: 100,
      label: "Strong Buy",
    },
    scoreBreakdown: [
      { key: "valuation", label: "Valuation", weightPct: 30, score: 72 },
      { key: "profitability", label: "Profitability", weightPct: 20, score: 94 },
      { key: "growth", label: "Growth", weightPct: 20, score: 85 },
      { key: "health", label: "Health", weightPct: 15, score: 91 },
      { key: "momentum", label: "Momentum", weightPct: 10, score: 64 },
    ],
    highlights: {
      attractive: [
        "Dominant ecosystem and high services retention create resilient recurring cash flow.",
        "Large free cash flow supports buybacks and consistent dividend growth.",
        "Best-in-class ROIC signals durable execution and capital allocation discipline.",
      ],
      risks: [
        "Supply chain concentration in China increases geopolitical and operational sensitivity.",
        "Current valuation trades above long-run averages and raises compression risk.",
        "Platform-related regulation could pressure high-margin services monetization.",
      ],
    },
    financialMetrics: [
      {
        title: "VALUATION",
        badge: "Elevated",
        badgeTone: "amber",
        rows: [
          { label: "P/E Ratio (TTM)", value: "28.4x" },
          { label: "EV/EBITDA", value: "22.1x" },
          { label: "Price / Sales", value: "7.8x" },
        ],
      },
      {
        title: "PROFITABILITY",
        badge: "Elite",
        badgeTone: "emerald",
        rows: [
          { label: "Gross Margin", value: "44.1%" },
          { label: "Net Margin", value: "25.3%" },
          { label: "ROE", value: "160.1%" },
        ],
      },
      {
        title: "GROWTH (3Y)",
        badge: "Strong",
        badgeTone: "emerald",
        rows: [
          { label: "Revenue Growth", value: "+12.4%" },
          { label: "EPS Growth", value: "+18.7%" },
          { label: "FCF Growth", value: "+9.2%" },
        ],
      },
    ],
    peerComparison: [
      { ticker: "AAPL", score: 88, pe: 28.4, marketCapUsdTrillion: 2.94, rating: "STRONG BUY" },
      { ticker: "MSFT", score: 82, pe: 34.1, marketCapUsdTrillion: 3.05, rating: "BUY" },
      { ticker: "GOOGL", score: 76, pe: 24.5, marketCapUsdTrillion: 1.82, rating: "WATCH" },
    ],
    analystConsensus: {
      recommendation: "Buy",
      analystCount: 42,
      targetHigh: 240,
      targetMedian: 210.5,
      targetLow: 175,
    },
    news: [
      {
        id: "n1",
        kind: "MARKET NEWS",
        publishedAt: "2026-03-18T14:00:00-04:00",
        title: "Apple Vision Pro Demand Exceeds Initial Forecasts in Early Retail Trials",
        summary:
          "Early data suggests stronger attachment rates for services and support plans than initial channel assumptions.",
        url: "https://www.apple.com/newsroom/",
      },
      {
        id: "n2",
        kind: "ANALYSIS",
        publishedAt: "2026-03-18T11:00:00-04:00",
        title: "Dividend Sustainability Check: Free Cash Flow Coverage Remains Healthy",
        summary:
          "Latest projections indicate dividend growth remains covered by free cash flow with room for opportunistic buybacks.",
        url: "https://www.sec.gov/edgar/browse/?CIK=320193",
      },
    ],
    insiderActivity: {
      transactions: [
        {
          id: "i1",
          name: "Tim Cook",
          role: "CEO",
          date: "2026-01-12",
          actionLabel: "Sold (Planned)",
          valueLabel: "$2.1M",
          tone: "sell",
        },
        {
          id: "i2",
          name: "Luca Maestri",
          role: "CFO",
          date: "2025-12-28",
          actionLabel: "Exercised Options",
          valueLabel: "45k Shares",
          tone: "buy",
        },
      ],
      net3mSellUsd: 4800000,
    },
  },
};

function pointsForRange(range: RangeOption) {
  if (range === "1D") return monthlyPricePoints.slice(-1);
  if (range === "1W") return monthlyPricePoints.slice(-5);
  if (range === "1M") return monthlyPricePoints;
  if (range === "1Y") return monthlyPricePoints;
  return monthlyPricePoints;
}

export function getMockStockDetails(ticker: string, range: RangeOption): StockDetailsResponse | null {
  const data = mockByTicker[ticker.toUpperCase()];
  if (!data) return null;

  return {
    ...data,
    pricePerformance: {
      range,
      points: pointsForRange(range),
    },
    meta: {
      generatedAt: new Date().toISOString(),
      sourceCoverage: ["financials", "prices", "analyst", "news", "insider"],
      isMock: true,
    },
  };
}
