import { calculateCompositeScore } from "@/lib/scoring";
import type { RawStockMetrics } from "@/types/stock";

const mockStocks: RawStockMetrics[] = [
  {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    peRatio: 28,
    pbRatio: 42,
    psRatio: 7,
    evEbitda: 20,
    pegRatio: 2.1,
    grossMargin: 46,
    netMargin: 25,
    roe: 150,
    roa: 29,
    revenueGrowthYoy: 6,
    epsGrowth: 9,
    fcfGrowth: 8,
    debtToEquity: 1.5,
    currentRatio: 1.1,
    interestCoverage: 30,
    fcfYield: 3.6,
    week52Position: 0.72,
    rsi: 49,
    priceVs200DayMa: 7,
    analystConsensus: 77,
    newsSentiment: 63,
    insiderBuyingScore: 40,
  },
  {
    ticker: "MSFT",
    companyName: "Microsoft Corporation",
    sector: "Technology",
    peRatio: 31,
    pbRatio: 11,
    psRatio: 12,
    evEbitda: 22,
    pegRatio: 2,
    grossMargin: 69,
    netMargin: 36,
    roe: 34,
    roa: 18,
    revenueGrowthYoy: 13,
    epsGrowth: 16,
    fcfGrowth: 12,
    debtToEquity: 0.35,
    currentRatio: 1.4,
    interestCoverage: 38,
    fcfYield: 2.9,
    week52Position: 0.63,
    rsi: 46,
    priceVs200DayMa: 4,
    analystConsensus: 84,
    newsSentiment: 74,
    insiderBuyingScore: 52,
  },
  {
    ticker: "GOOGL",
    companyName: "Alphabet Inc.",
    sector: "Communication Services",
    peRatio: 24,
    pbRatio: 6.2,
    psRatio: 6.1,
    evEbitda: 16,
    pegRatio: 1.4,
    grossMargin: 58,
    netMargin: 24,
    roe: 28,
    roa: 16,
    revenueGrowthYoy: 12,
    epsGrowth: 18,
    fcfGrowth: 10,
    debtToEquity: 0.1,
    currentRatio: 1.8,
    interestCoverage: 50,
    fcfYield: 4.2,
    week52Position: 0.49,
    rsi: 41,
    priceVs200DayMa: -2,
    analystConsensus: 86,
    newsSentiment: 68,
    insiderBuyingScore: 64,
  }
];

export function getMockStockMetrics(ticker: string) {
  return mockStocks.find((stock) => stock.ticker === ticker) ?? null;
}

export function getMockTopStocks() {
  return mockStocks
    .map((stock) => ({
      ticker: stock.ticker,
      companyName: stock.companyName,
      sector: stock.sector,
      analysis: calculateCompositeScore(stock),
    }))
    .sort((a, b) => b.analysis.total - a.analysis.total);
}
