"use client";

interface BuySellChartProps {
  buyCount: number;
  sellCount: number;
  totalBuyValue: number;
  totalSellValue: number;
}

export function BuySellChart({
  buyCount,
  sellCount,
  totalBuyValue,
  totalSellValue,
}: BuySellChartProps) {
  const total = buyCount + sellCount;
  const buyPercent = total > 0 ? (buyCount / total) * 100 : 50;
  const sellPercent = total > 0 ? (sellCount / total) * 100 : 50;

  const totalValue = totalBuyValue + totalSellValue;
  const buyValuePercent = totalValue > 0 ? (totalBuyValue / totalValue) * 100 : 50;
  const sellValuePercent = totalValue > 0 ? (totalSellValue / totalValue) * 100 : 50;

  // SVG donut chart
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const buyArc = (buyPercent / 100) * circumference;
  const sellArc = circumference - buyArc;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Donut Chart — Transaction Count */}
      <div className="flex flex-col items-center">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
          Insider Transactions
        </h4>
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              className="text-red-500/20"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              className="text-emerald-500"
              strokeDasharray={`${buyArc} ${sellArc}`}
              strokeDashoffset={circumference * 0.25}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.8s ease-out" }}
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              className="text-red-500"
              strokeDasharray={`${sellArc} ${buyArc}`}
              strokeDashoffset={circumference * 0.25 - buyArc}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.8s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{total}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm">
              <span className="font-semibold">{buyCount}</span>{" "}
              <span className="text-muted-foreground">Buys</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm">
              <span className="font-semibold">{sellCount}</span>{" "}
              <span className="text-muted-foreground">Sells</span>
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Bar — Value Split */}
      <div className="flex flex-col justify-center">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
          Transaction Value
        </h4>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-emerald-500 font-medium">Buys</span>
              <span className="font-mono font-semibold">{formatValue(totalBuyValue)}</span>
            </div>
            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${buyValuePercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-red-500 font-medium">Sells</span>
              <span className="font-mono font-semibold">{formatValue(totalSellValue)}</span>
            </div>
            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
                style={{ width: `${sellValuePercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Net Flow</span>
            <span
              className={`font-mono font-bold text-base ${
                totalBuyValue >= totalSellValue ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {totalBuyValue >= totalSellValue ? "+" : "-"}
              {formatValue(Math.abs(totalBuyValue - totalSellValue))}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {totalBuyValue >= totalSellValue
              ? "Net insider buying — bullish signal"
              : "Net insider selling — bearish signal"}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatValue(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  if (value === 0) return "$0";
  return `$${value.toLocaleString()}`;
}
