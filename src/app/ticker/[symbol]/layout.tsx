import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { TICKERS } from "@/lib/tickers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  const ticker = symbol.toUpperCase();
  const match = TICKERS.find((t) => t.symbol === ticker);
  const name = match?.name ?? ticker;

  const title = `$${ticker} — ${name}`;
  const description = `Institutional holders, insider transactions, and AI analysis for ${name} ($${ticker}). Powered by ${SITE_NAME}.`;

  return {
    title,
    description,
    openGraph: {
      title: `$${ticker} | ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `$${ticker} | ${SITE_NAME}`,
      description,
    },
  };
}

export default function TickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
