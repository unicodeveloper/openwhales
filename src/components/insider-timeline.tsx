"use client";

import type { InsiderTx } from "@/types";

interface InsiderTimelineProps {
  transactions: InsiderTx[];
}

const typeConfig = {
  buy: { label: "Buy", color: "border-emerald-500", bg: "bg-emerald-500", text: "text-emerald-500", dot: "bg-emerald-500" },
  sell: { label: "Sell", color: "border-red-500", bg: "bg-red-500", text: "text-red-500", dot: "bg-red-500" },
  gift: { label: "Gift", color: "border-purple-500", bg: "bg-purple-500", text: "text-purple-500", dot: "bg-purple-500" },
  exercise: { label: "Exercise", color: "border-amber-500", bg: "bg-amber-500", text: "text-amber-500", dot: "bg-amber-500" },
  award: { label: "Award", color: "border-cyan-500", bg: "bg-cyan-500", text: "text-cyan-500", dot: "bg-cyan-500" },
  other: { label: "Other", color: "border-gray-400", bg: "bg-gray-400", text: "text-gray-400", dot: "bg-gray-400" },
};

export function InsiderTimeline({ transactions }: InsiderTimelineProps) {
  if (!transactions.length) return null;

  const maxValue = Math.max(...transactions.map((t) => Math.abs(t.value)));

  return (
    <div className="space-y-0">
      {transactions.map((tx, i) => {
        const cfg = typeConfig[tx.type] || typeConfig.other;
        const barWidth = maxValue > 0 ? (Math.abs(tx.value) / maxValue) * 100 : 0;

        return (
          <div
            key={`${tx.name}-${tx.date}-${i}`}
            className="group relative flex items-stretch gap-3 sm:gap-4 hover:bg-muted/30 transition-colors rounded-lg px-2 sm:px-3 py-2.5 sm:py-3"
          >
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center w-3 sm:w-4 shrink-0">
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${cfg.dot} ring-4 ring-background z-10 shrink-0 mt-1`} />
              {i < transactions.length - 1 && (
                <div className="w-px flex-1 bg-border/60 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-xs sm:text-sm truncate max-w-[160px] sm:max-w-none">
                      {tx.name}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}
                      style={{
                        backgroundColor: `color-mix(in srgb, currentColor 12%, transparent)`,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {tx.title} &middot; {tx.date}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:block sm:text-right shrink-0">
                  <div className={`font-mono text-xs sm:text-sm font-semibold ${cfg.text}`}>
                    {tx.type === "buy" ? "+" : tx.type === "sell" ? "-" : ""}
                    {formatValue(Math.abs(tx.value))}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                    {formatShares(tx.shares)} @ ${tx.pricePerShare.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Value bar */}
              <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cfg.bg} opacity-60 transition-all duration-500`}
                  style={{ width: `${Math.max(barWidth, 2)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatValue(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  if (value === 0) return "$0";
  return `$${value.toLocaleString()}`;
}

function formatShares(shares: number): string {
  if (shares >= 1e6) return `${(shares / 1e6).toFixed(1)}M`;
  if (shares >= 1e3) return `${(shares / 1e3).toFixed(1)}K`;
  return shares.toLocaleString();
}
