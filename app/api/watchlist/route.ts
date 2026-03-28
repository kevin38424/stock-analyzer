import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const bodySchema = z.object({
  userId: z.string().uuid(),
  ticker: z.string().min(1).max(12),
  companyName: z.string().min(1).max(128),
  companyId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  const rawBody = await request.json();
  const parsed = bodySchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid watchlist payload." }, { status: 400 });
  }

  const body = parsed.data;
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.from("user_favorites").insert({
    user_id: body.userId,
    ticker: body.ticker,
    company_name: body.companyName,
    company_id: body.companyId ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
