"use client";

import { useState, useEffect } from "react";
import { useAuthHeaders } from "@/hooks/use-auth-headers";
import type { InvestorData } from "@/types";

interface UseInvestorDataReturn {
  data: InvestorData | null;
  isLoading: boolean;
  error: string | null;
}

export function useInvestorData(slug: string): UseInvestorDataReturn {
  const [data, setData] = useState<InvestorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headers = useAuthHeaders();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/investor-data", {
          method: "POST",
          headers,
          body: JSON.stringify({ slug }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to fetch investor data");
        }

        const investorData = await response.json();
        setData(investorData);
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
