import { ok } from "@/server/http/response";
import { getMarketStatusSnapshot } from "@/server/market-data/market-status";

export async function GET() {
  const status = await getMarketStatusSnapshot();
  return ok({
    status,
    available: Boolean(status),
  });
}
