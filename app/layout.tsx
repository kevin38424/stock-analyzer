import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Value Screener",
  description: "Find potentially undervalued top 500 stocks with a custom scoring engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
