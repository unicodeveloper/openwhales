"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { TrendingTicker } from "@/types";

interface TrendingCardProps {
  data: TrendingTicker;
}

const directionConfig = {
  buying: { label: "Net Buying", color: "text-green-500", dot: "bg-green-500" },
  selling: { label: "Net Selling", color: "text-red-500", dot: "bg-red-500" },
  mixed: { label: "Mixed", color: "text-amber-500", dot: "bg-amber-500" },
  none: { label: "No Activity", color: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export function TrendingCard({ data }: TrendingCardProps) {
  const dir = directionConfig[data.insiderActivity.netDirection] || directionConfig.none;

  return (
    <Link href={`/ticker/${data.symbol}`} className="group block">
      <div className="relative h-full rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-slate-600 hover:bg-card/80">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold font-mono tracking-tight text-foreground">
              ${data.symbol}
            </h3>
            {data.insiderActivity.recentCount > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dir.dot}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${dir.color}`}>
                  {dir.label}
                </span>
              </div>
            )}
          </div>
          <span className="p-1.5 rounded-md border border-border text-muted-foreground group-hover:border-slate-500 group-hover:text-foreground transition-colors">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Top Holders */}
        {data.topHolders.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Top Holders
            </span>
            {data.topHolders.slice(0, 3).map((holder, i) => (
              <div key={`${holder.name}-${i}`} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-muted-foreground/60 w-3 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm truncate text-foreground/80">{holder.name}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0 tabular-nums">
                  {formatValue(holder.valueUsd)}
                </span>
              </div>
            ))}
          </div>
        )}

        {data.topHolders.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Click to analyze smart money activity
          </p>
        )}
      </div>
    </Link>
  );
}

function formatValue(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value}`;
}
