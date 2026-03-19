"use client";

import { useState, useEffect } from "react";
import { useAuthHeaders } from "@/hooks/use-auth-headers";
import type { FundData } from "@/types";

interface UseFundDataReturn {
  data: FundData | null;
  isLoading: boolean;
  error: string | null;
}

export function useFundData(slug: string): UseFundDataReturn {
  const [data, setData] = useState<FundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headers = useAuthHeaders();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/fund-data", {
          method: "POST",
          headers,
          body: JSON.stringify({ slug }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to fetch fund data");
        }

        const fundData = await response.json();
        setData(fundData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  return { data, isLoading, error };
}
