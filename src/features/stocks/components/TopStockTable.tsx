import { getMockTopStocks } from "@/lib/mock-data";

export function TopStockTable() {
  const rows = getMockTopStocks();

  return (
    <section className="card overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Great stocks to buy</h2>
          <p className="text-sm text-slate-400">Ranked within the top 500 universe using your composite score.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-3 pr-4">Ticker</th>
              <th className="pb-3 pr-4">Company</th>
              <th className="pb-3 pr-4">Sector</th>
              <th className="pb-3 pr-4">Score</th>
              <th className="pb-3 pr-4">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.ticker} className="border-t border-slate-800">
                <td className="py-3 pr-4 font-medium">{row.ticker}</td>
                <td className="py-3 pr-4">{row.companyName}</td>
                <td className="py-3 pr-4 text-slate-400">{row.sector}</td>
                <td className="py-3 pr-4">{row.analysis.total}</td>
                <td className="py-3 pr-4">{row.analysis.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
