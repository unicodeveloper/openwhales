"use client";

import { useState, useEffect } from "react";
import type { TickerData } from "@/types";

interface UseTickerDataReturn {
  data: TickerData | null;
  isLoading: boolean;
  error: string | null;
}

export function useTickerData(symbol: string): UseTickerDataReturn {
  const [data, setData] = useState<TickerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch_data() {
      try {
        const response = await fetch("/api/ticker-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to fetch data");
        }

        const tickerData = await response.json();
        setData(tickerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }

    fetch_data();
  }, [symbol]);

  return { data, isLoading, error };
}
