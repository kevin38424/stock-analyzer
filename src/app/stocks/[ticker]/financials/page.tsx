import Link from "next/link";
import { AppSidebar, AppTopbar, appLayoutClasses, appTypographyClasses } from "@/features/shared";

export default async function StockFinancialsPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const normalizedTicker = decodeURIComponent(ticker).toUpperCase();

  return (
    <main className={appLayoutClasses.page}>
      <div className={appLayoutClasses.shell}>
        <AppSidebar activePage="top-stocks" />

        <section className="flex min-h-screen flex-col">
          <AppTopbar />

          <div className={appLayoutClasses.content}>
            <p className={appTypographyClasses.eyebrow}>FINANCIAL STATEMENTS</p>
            <h1 className={appTypographyClasses.pageTitle}>{normalizedTicker} Statements</h1>
            <p className={appTypographyClasses.pageSubtitle}>
              Detailed Income Statement, Balance Sheet, and Cash Flow views are coming next.
            </p>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/75 p-6 text-slate-300">
              <p className="text-base">
                This page is reserved for full statement drill-down. The stock details page already links here
                so the navigation flow is complete.
              </p>
              <Link
                href={`/stocks/${encodeURIComponent(normalizedTicker)}`}
                className="mt-4 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Back to Stock Details
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
