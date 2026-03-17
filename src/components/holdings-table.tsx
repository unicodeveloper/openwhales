"use client";

import type { InstitutionalHolder } from "@/types";

interface HoldingsTableProps {
  holders: InstitutionalHolder[];
}

const activityConfig = {
  increased: { label: "Increased", color: "text-emerald-500", bg: "bg-emerald-500", icon: "+" },
  decreased: { label: "Decreased", color: "text-red-500", bg: "bg-red-500", icon: "-" },
  new: { label: "New", color: "text-blue-500", bg: "bg-blue-500", icon: "★" },
  closed: { label: "Closed", color: "text-orange-500", bg: "bg-orange-500", icon: "✕" },
  unchanged: { label: "Unchanged", color: "text-gray-400", bg: "bg-gray-400", icon: "=" },
};

export function HoldingsTable({ holders }: HoldingsTableProps) {
  if (!holders.length) return null;

  const maxValue = Math.max(...holders.map((h) => h.value));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
            <th className="text-left py-3 pr-4 font-medium">#</th>
            <th className="text-left py-3 pr-4 font-medium">Fund / Manager</th>
            <th className="text-right py-3 pr-4 font-medium">Shares</th>
            <th className="text-right py-3 pr-4 font-medium">Value</th>
            <th className="text-left py-3 pr-4 font-medium">Activity</th>
            <th className="text-right py-3 font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {holders.map((holder, i) => {
            const cfg = activityConfig[holder.activity] || activityConfig.unchanged;
            const barWidth = maxValue > 0 ? (holder.value / maxValue) * 100 : 0;

            return (
              <tr
                key={`${holder.name}-${i}`}
                className="border-b border-border/30 hover:bg-muted/30 transition-colors group"
              >
                <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">
                  {i + 1}
                </td>
                <td className="py-3 pr-4 min-w-[180px]">
                  <div className="font-medium leading-snug">
                    {holder.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {holder.reportDate}
                  </div>
                </td>
                <td className="py-3 pr-4 text-right font-mono">
                  {formatShares(holder.shares)}
                </td>
                <td className="py-3 pr-4 text-right">
                  <div className="font-mono font-medium">{formatValue(holder.value)}</div>
                  <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} bg-opacity-10`}
                    style={{
                      backgroundColor: `color-mix(in srgb, currentColor 10%, transparent)`,
                    }}
                  >
                    <span className="text-[10px]">{cfg.icon}</span>
                    {cfg.label}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`font-mono text-xs font-medium ${
                      (holder.changePercent ?? 0) > 0
                        ? "text-emerald-500"
                        : (holder.changePercent ?? 0) < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {(holder.changePercent ?? 0) > 0 ? "+" : ""}
                    {(holder.changePercent ?? 0).toFixed(2)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatShares(shares: number): string {
  if (shares >= 1e9) return `${(shares / 1e9).toFixed(1)}B`;
  if (shares >= 1e6) return `${(shares / 1e6).toFixed(1)}M`;
  if (shares >= 1e3) return `${(shares / 1e3).toFixed(1)}K`;
  return shares.toLocaleString();
}
