import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getHomeDashboardData } from "@/lib/home/get-home-dashboard-data";

const querySchema = z.object({
  includeWatchlist: z.coerce.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    includeWatchlist: request.nextUrl.searchParams.get("includeWatchlist") ?? "true",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const data = getHomeDashboardData();
  if (!parsed.data.includeWatchlist) {
    return NextResponse.json({ ...data, watchlistPreview: [] });
  }

  return NextResponse.json(data);
}
