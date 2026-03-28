import { getMockTopStocks } from "@/lib/mock-data";
import { round } from "@/lib/utils";
import type {
  HomeDashboardResponse,
  HomeTopStockRow,
  HomeWatchlistRow,
  ScoreDistributionBin,
} from "@/types/home/dashboard";

const latestQuotes: Record<string, { price: number; changePercent: number }> = {
  AAPL: { price: 189.44, changePercent: 0.84 },
  MSFT: { price: 410.1, changePercent: 1.02 },
  GOOGL: { price: 152.26, changePercent: 1.32 },
  NVDA: { price: 873.22, changePercent: 3.55 },
  AMZN: { price: 172.3, changePercent: 0.78 },
  TSLA: { price: 168.3, changePercent: -1.84 },
  META: { price: 491.2, changePercent: 0.12 },
  "BRK.B": { price: 408.15, changePercent: 0 },
};

const watchlistTickers = ["TSLA", "META", "GOOGL", "BRK.B"] as const;

function buildScoreDistribution(scores: number[]): ScoreDistributionBin[] {
  const bins: ScoreDistributionBin[] = [];
  for (let start = 0; start < 100; start += 10) {
    const end = start + 9;
    const count = scores.filter((score) => score >= start && score <= end).length;
    bins.push({ binStart: start, binEnd: end, count });
  }
  return bins;
}

function toTopStockRows(limit = 4): HomeTopStockRow[] {
  return getMockTopStocks()
    .slice(0, limit)
    .map((row, index) => {
      const quote = latestQuotes[row.ticker] ?? { price: 0, changePercent: 0 };
      return {
        rank: index + 1,
        ticker: row.ticker,
        companyName: row.companyName,
        sector: row.sector,
        score: row.analysis.total,
        recommendation: row.analysis.recommendation,
        price: quote.price,
        changePercent: quote.changePercent,
      };
    });
}

function normalizeWatchlistSignal(
  recommendation: HomeTopStockRow["recommendation"] | undefined,
): HomeWatchlistRow["signal"] {
  if (recommendation === "Strong Buy") return "Strong Buy";
  if (recommendation === "Buy") return "Buy";
  if (recommendation === "Watch") return "Watch";
  return "Hold";
}

function toWatchlistRows(): HomeWatchlistRow[] {
  const analysisByTicker = new Map(getMockTopStocks().map((row) => [row.ticker, row.analysis]));
  return watchlistTickers.map((ticker) => {
    const analysis = analysisByTicker.get(ticker);
    const quote = latestQuotes[ticker] ?? { price: 0, changePercent: 0 };
    return {
      ticker,
      companyName:
        {
          TSLA: "Tesla, Inc.",
          META: "Meta Platforms",
          GOOGL: "Alphabet Inc.",
          "BRK.B": "Berkshire Hathaway",
        }[ticker] ?? ticker,
      score: analysis?.total ?? 76,
      signal: normalizeWatchlistSignal(analysis?.recommendation),
      price: quote.price,
      changePercent: quote.changePercent,
    };
  });
}

export function getHomeDashboardData(): HomeDashboardResponse {
  const topRows = toTopStockRows(4);
  const all = getMockTopStocks();
  const scores = all.map((row) => row.analysis.total);
  const averageScore = scores.length === 0 ? 0 : round(scores.reduce((sum, value) => sum + value, 0) / scores.length, 1);
  const strongBuys = all.filter((row) => row.analysis.recommendation === "Strong Buy").length;

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      stocksAnalyzed: 8_492,
      stocksAnalyzedDelta: 12,
      strongBuys,
      strongBuysPercent: round((strongBuys / 8_492) * 100, 1),
      averageScore,
      mostImprovedTicker: "NVDA",
      mostImprovedDeltaScore: 14,
      watchlistAlerts: 3,
    },
    topStocks: topRows,
    watchlistPreview: toWatchlistRows(),
    sectorPerformance: [
      { sector: "Technology", changePercent: 2.4 },
      { sector: "Finance", changePercent: 0.8 },
      { sector: "Healthcare", changePercent: -1.2 },
    ],
    scoreDistribution: buildScoreDistribution(scores),
    insight: {
      title: "PRO INSIGHT",
      message:
        "NVDA score increased by 4 points due to institutional inflow. Bullish momentum building.",
    },
  };
}
