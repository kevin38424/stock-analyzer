import { NextRequest } from "next/server";
import { queryParamsWithDefaults } from "@/server/http/parsing";
import { badRequest, ok } from "@/server/http/response";
import { marketQuotesQuerySchema } from "@/server/market-data/market-data-schemas";
import { ensureFreshQuotesForTickers } from "@/server/market-data/quote-sync";

export async function GET(request: NextRequest) {
  const parsed = marketQuotesQuerySchema.safeParse(
    queryParamsWithDefaults(request.nextUrl.searchParams, {
      symbols: "",
      maxAgeSeconds: undefined,
    }),
  );

  if (!parsed.success) {
    return badRequest("Invalid query parameters. Use symbols=AAPL,MSFT and optional maxAgeSeconds=60.");
  }

  const tickers = parsed.data.symbols
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => symbol.length > 0);

  if (tickers.length === 0) {
    return badRequest("At least one symbol is required.");
  }

  const quotes = await ensureFreshQuotesForTickers(tickers, {
    maxAgeSeconds: parsed.data.maxAgeSeconds,
    runKind: "on_demand",
  });

  return ok({
    requested: tickers,
    quotes: tickers
      .map((ticker) => quotes.get(ticker))
      .filter((quote): quote is NonNullable<typeof quote> => Boolean(quote)),
  });
}
