"use client";

import { useState, useEffect } from "react";
import type { TrendingTicker } from "@/types";

interface UseTrendingDataReturn {
  data: TrendingTicker[];
  isLoading: boolean;
  error: string | null;
}

export function useTrendingData(): UseTrendingDataReturn {
  const [data, setData] = useState<TrendingTicker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const response = await fetch("/api/trending");
        if (!response.ok) {
          throw new Error("Failed to fetch trending data");
        }

        const contentType = response.headers.get("Content-Type") || "";

        // Cache hit — returns JSON array
        if (contentType.includes("application/json")) {
          const tickers = await response.json();
          setData(tickers);
          return;
        }

        // Cache miss — NDJSON stream, render each ticker as it arrives
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const ticker = JSON.parse(line) as TrendingTicker;
              setData((prev) => [...prev, ticker]);
            } catch {
              // skip malformed lines
            }
          }
        }

        if (buffer.trim()) {
          try {
            const ticker = JSON.parse(buffer) as TrendingTicker;
            setData((prev) => [...prev, ticker]);
          } catch {
            // skip
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load trending data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrending();
  }, []);

  return { data, isLoading, error };
}
