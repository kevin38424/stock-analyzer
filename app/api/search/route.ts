import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({ q: z.string().min(1) });

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const parsed = querySchema.safeParse({ q: query });

  if (!parsed.success) {
    return NextResponse.json({ error: "Query is required." }, { status: 400 });
  }

  // TODO: Replace with real provider call and top-500 filtering logic.
  const results = [
    { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", isTop500: true },
    { ticker: "MSFT", name: "Microsoft Corporation", sector: "Technology", isTop500: true },
  ].filter((item) =>
    [item.ticker, item.name].some((value) => value.toLowerCase().includes(parsed.data.q.toLowerCase())),
  );

  return NextResponse.json({ results });
}
