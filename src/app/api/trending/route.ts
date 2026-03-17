import { TRENDING_TICKERS } from "@/lib/constants";
import { fetchTrendingSummary } from "@/lib/valyu";
import type { TrendingTicker } from "@/types";

/** Cache TTL: 6 hours. 13F data is quarterly, Form 4 trickles in every few days. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cache: { data: TrendingTicker[]; timestamp: number } | null = null;
let isRefreshing = false;

async function refreshCache() {
  if (isRefreshing) return;
  isRefreshing = true;

  try {
    const results = await Promise.allSettled(
      TRENDING_TICKERS.map((symbol) => fetchTrendingSummary(symbol))
    );

    const tickers: TrendingTicker[] = results
      .filter(
        (r): r is PromiseFulfilledResult<TrendingTicker> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value);

    if (tickers.length > 0) {
      cache = { data: tickers, timestamp: Date.now() };
    }
  } catch (error) {
    console.error("Cache refresh error:", error);
  } finally {
    isRefreshing = false;
  }
}

function isCacheFresh(): boolean {
  return cache !== null && Date.now() - cache.timestamp < CACHE_TTL_MS;
}

export async function GET() {
  // Cache hit — return instantly
  if (cache && cache.data.length > 0) {
    if (!isCacheFresh()) {
      refreshCache();
    }

    return Response.json(cache.data, {
      headers: {
        "X-Cache": isCacheFresh() ? "HIT" : "STALE",
        "X-Cache-Age": String(Math.round((Date.now() - cache.timestamp) / 1000)),
      },
    });
  }

  // Cache miss — fetch all in parallel, collect results, THEN stream them out sequentially
  const results = await Promise.allSettled(
    TRENDING_TICKERS.map((symbol) => fetchTrendingSummary(symbol))
  );

  const tickers: TrendingTicker[] = results
    .filter(
      (r): r is PromiseFulfilledResult<TrendingTicker> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  // Populate cache
  if (tickers.length > 0) {
    cache = { data: tickers, timestamp: Date.now() };
  }

  // Stream the collected results as NDJSON
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const ticker of tickers) {
        controller.enqueue(encoder.encode(JSON.stringify(ticker) + "\n"));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Cache": "MISS",
    },
  });
}
