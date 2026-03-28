import "./globals.css";
import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import { Providers } from "@/app/Providers";

export const metadata: Metadata = {
  title: "Value Screener",
  description: "Find potentially undervalued top 500 stocks with a custom scoring engine.",
};

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} ${manrope.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
