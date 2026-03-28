import { StockDetailsPage } from "@/features/stocks";

export default async function StockTickerPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  let decodedTicker = ticker;
  try {
    decodedTicker = decodeURIComponent(ticker);
  } catch {
    decodedTicker = ticker;
  }
  return <StockDetailsPage ticker={decodedTicker.toUpperCase()} />;
}
