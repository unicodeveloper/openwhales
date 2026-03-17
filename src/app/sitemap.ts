import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { TICKERS } from "@/lib/tickers";

export default function sitemap(): MetadataRoute.Sitemap {
  const tickerPages = TICKERS.map((t) => ({
    url: `${SITE_URL}/ticker/${t.symbol}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...tickerPages,
  ];
}
