import { NextRequest, NextResponse } from "next/server";
import { calculateCompositeScore } from "@/lib/scoring";
import { getMockStockMetrics } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await context.params;
  const metrics = getMockStockMetrics(ticker.toUpperCase());

  if (!metrics) {
    return NextResponse.json({ error: "Ticker not found." }, { status: 404 });
  }

  const analysis = calculateCompositeScore(metrics);
  return NextResponse.json({ ticker: ticker.toUpperCase(), analysis, metrics });
}
