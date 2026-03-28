import type { ScoreBreakdown as ScoreBreakdownType } from "@/types/stock";

export function ScoreBreakdown({
  scores,
}: {
  scores: Omit<ScoreBreakdownType, "total" | "recommendation" | "explanation">;
}) {
  const rows = [
    ["Valuation", scores.valuation],
    ["Profitability", scores.profitability],
    ["Growth", scores.growth],
    ["Financial Health", scores.financialHealth],
    ["Momentum", scores.momentum],
    ["Sentiment", scores.sentiment],
  ];

  return (
    <section className="card">
      <h2 className="text-xl font-semibold">Score breakdown</h2>
      <div className="mt-4 space-y-4">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>{label}</span>
              <span>{String(value)}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-800">
              <div className="h-3 rounded-full bg-white" style={{ width: `${String(value)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
