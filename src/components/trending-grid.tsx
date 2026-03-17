"use client";

import { TrendingCard } from "./trending-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrendingData } from "@/hooks/use-trending-data";
import { TRENDING_TICKERS } from "@/lib/constants";

export function TrendingGrid() {
  const { data, isLoading, error } = useTrendingData();

  if (error && data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Unable to load trending data. Try refreshing the page.
      </p>
    );
  }

  const remainingSkeletons = isLoading
    ? TRENDING_TICKERS.length - data.length
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((ticker) => (
        <TrendingCard key={ticker.symbol} data={ticker} />
      ))}
      {Array.from({ length: remainingSkeletons }).map((_, i) => (
        <Skeleton key={`skeleton-${i}`} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}
