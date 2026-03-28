import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMockTopStocks } from "@/lib/mock-data";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    limit: request.nextUrl.searchParams.get("limit") ?? "25",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameter: limit must be 1-100." }, { status: 400 });
  }

  return NextResponse.json({ results: getMockTopStocks().slice(0, parsed.data.limit) });
}
