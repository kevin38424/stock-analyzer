import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMockStockDetails } from "@/lib/mock-stock-details";

const querySchema = z.object({
  range: z.enum(["1D", "1W", "1M", "1Y", "ALL"]).default("1M"),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await context.params;
  const parsed = querySchema.safeParse({
    range: request.nextUrl.searchParams.get("range") ?? "1M",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameter: range must be one of 1D, 1W, 1M, 1Y, ALL." },
      { status: 400 },
    );
  }

  const details = getMockStockDetails(ticker.toUpperCase(), parsed.data.range);

  if (!details) {
    return NextResponse.json({ error: "Ticker not found." }, { status: 404 });
  }

  return NextResponse.json(details);
}
