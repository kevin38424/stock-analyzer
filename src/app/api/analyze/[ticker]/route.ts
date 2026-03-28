import { NextRequest } from "next/server";
import { notFound, ok } from "@/server/http/response";
import { calculateCompositeScore } from "@/lib/scoring";
import { getMockStockMetrics } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await context.params;
  const metrics = getMockStockMetrics(ticker.toUpperCase());

  if (!metrics) {
    return notFound("Ticker not found.");
  }

  const analysis = calculateCompositeScore(metrics);
  return ok({ ticker: ticker.toUpperCase(), analysis, metrics });
}
