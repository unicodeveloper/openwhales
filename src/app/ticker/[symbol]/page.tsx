"use client";

import { useEffect, use, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useNarrativeStream } from "@/hooks/use-narrative-stream";
import { useTickerData } from "@/hooks/use-ticker-data";
import { NarrativeStream } from "@/components/narrative-stream";
import { HoldingsTable } from "@/components/holdings-table";
import { BuySellChart } from "@/components/buy-sell-chart";
import { InsiderTimeline } from "@/components/insider-timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { TickerChat, ChatCTA } from "@/components/ticker-chat";

export default function TickerPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();
  const { data, isLoading: isDataLoading } = useTickerData(upperSymbol);
  const { content, isStreaming, error, startStream } =
    useNarrativeStream(upperSymbol);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (data) {
      startStream(data);
    }
  }, [data, startStream]);

  return (
    <div className="min-h-screen">
      {/* Ticker header strip */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-mono">
                  ${upperSymbol}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isDataLoading && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/40 text-xs text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                  </span>
                  Fetching data
                </span>
              )}
              {isStreaming && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-400 font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  AI Analyzing
                </span>
              )}
              {/* Header CTA for chat */}
              <ChatCTA onClick={() => setChatOpen(true)} variant="header" />
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-b border-red-500/20 bg-red-500/5">
          <div className="container mx-auto px-4 max-w-7xl py-3 flex items-center justify-between">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => data && startStream(data)}
              className="text-xs underline text-red-400 hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Top row: Holdings table (full width) */}
        <section className="mb-8">
          <SectionHeader
            badge="13F"
            badgeColor="bg-emerald-500"
            title="Top Institutional Holders"
            subtitle="Largest institutional positions from recent 13F filings"
          />
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="p-5">
              {isDataLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data?.holders && data.holders.length > 0 ? (
                <HoldingsTable holders={data.holders} />
              ) : (
                <EmptyState text="No institutional holdings data available" />
              )}
            </div>
          </div>
        </section>

        {/* Middle row: Buy/Sell + Insider Activity side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <section>
            <SectionHeader
              badge="B/S"
              badgeColor="bg-amber-500"
              title="Insider Buy vs. Sell"
              subtitle="Transaction breakdown by count and value"
            />
            <div className="rounded-xl border border-border/40 p-5 h-[calc(100%-3rem)]">
              {isDataLoading ? (
                <div className="space-y-4 pt-4">
                  <Skeleton className="h-40 w-40 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : data ? (
                <BuySellChart
                  buyCount={data.buyCount}
                  sellCount={data.sellCount}
                  totalBuyValue={data.totalBuyValue}
                  totalSellValue={data.totalSellValue}
                />
              ) : (
                <EmptyState text="No insider activity data available" />
              )}
            </div>
          </section>

          <section>
            <SectionHeader
              badge="F4"
              badgeColor="bg-violet-500"
              title="Insider Activity"
              subtitle="Recent Form 4 insider transactions"
            />
            <div className="rounded-xl border border-border/40 p-5 max-h-[500px] overflow-y-auto h-[calc(100%-3rem)]">
              {isDataLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-3 w-3 rounded-full shrink-0 mt-1" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-1.5 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data?.insiderTransactions &&
                data.insiderTransactions.length > 0 ? (
                <InsiderTimeline transactions={data.insiderTransactions} />
              ) : (
                <EmptyState text="No insider transactions found" />
              )}
            </div>
          </section>
        </div>

        {/* Bottom: AI Narrative with sidebar */}
        <section>
          <SectionHeader
            badge="AI"
            badgeColor="bg-blue-500"
            title="Smart Money Narrative"
            subtitle="AI-synthesized analysis from 13F, 13D/G & Form 4 filings"
            trailing={
              <div className="flex items-center gap-2">
                {isStreaming && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-[11px] text-emerald-400 font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Streaming
                  </span>
                )}
                {/* Narrative section CTA for chat */}
                <ChatCTA onClick={() => setChatOpen(true)} />
              </div>
            }
          />
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Narrative body */}
              <div className="flex-1 min-w-0 p-6 sm:p-8">
                {!error && !content && isStreaming && (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="h-4" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                )}
                {!error && !content && !isStreaming && !isDataLoading && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">
                      Waiting for data to generate narrative...
                    </p>
                  </div>
                )}
                {content && (
                  <NarrativeStream content={content} isStreaming={isStreaming} />
                )}
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-border/40 bg-muted/20">
                <div className="p-5 space-y-5 lg:sticky lg:top-20">
                  {data && (
                    <>
                      {/* Quick snapshot */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                          Quick Snapshot
                        </p>
                        <div className="space-y-2.5">
                          <StatRow label="Institutions tracked" value={String(data.holders.length)} />
                          <StatRow label="Insider transactions" value={String(data.insiderTransactions.length)} />
                          <StatRow
                            label="Insider buys"
                            value={String(data.buyCount)}
                            valueColor="text-emerald-500"
                          />
                          <StatRow
                            label="Insider sells"
                            value={String(data.sellCount)}
                            valueColor="text-red-500"
                          />
                        </div>
                      </div>

                      <div className="h-px bg-border/40" />

                      {/* Net flow */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                          Net Insider Flow
                        </p>
                        <div
                          className={`text-xl font-bold font-mono ${
                            data.totalBuyValue >= data.totalSellValue
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {data.totalBuyValue >= data.totalSellValue ? "+" : "-"}$
                          {formatSidebarValue(
                            Math.abs(data.totalBuyValue - data.totalSellValue)
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {data.totalBuyValue >= data.totalSellValue
                            ? "Net buying pressure"
                            : "Net selling pressure"}
                        </p>
                        <div className="mt-2.5 flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 rounded-l-full transition-all duration-700"
                            style={{
                              width: `${
                                data.totalBuyValue + data.totalSellValue > 0
                                  ? (data.totalBuyValue /
                                      (data.totalBuyValue + data.totalSellValue)) *
                                    100
                                  : 50
                              }%`,
                            }}
                          />
                          <div
                            className="bg-red-500 rounded-r-full transition-all duration-700"
                            style={{
                              width: `${
                                data.totalBuyValue + data.totalSellValue > 0
                                  ? (data.totalSellValue /
                                      (data.totalBuyValue + data.totalSellValue)) *
                                    100
                                  : 50
                              }%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                          <span>${formatSidebarValue(data.totalBuyValue)}</span>
                          <span>${formatSidebarValue(data.totalSellValue)}</span>
                        </div>
                      </div>

                      {/* Biggest moves */}
                      {data.holders.filter((h) => h.changePercent !== 0).length >
                        0 && (
                        <>
                          <div className="h-px bg-border/40" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                              Biggest Moves
                            </p>
                            <div className="space-y-2">
                              {data.holders
                                .filter((h) => h.changePercent !== 0)
                                .sort(
                                  (a, b) =>
                                    Math.abs(b.changePercent) -
                                    Math.abs(a.changePercent)
                                )
                                .slice(0, 4)
                                .map((h, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between gap-2"
                                  >
                                    <span className="text-xs truncate flex-1">
                                      {h.name}
                                    </span>
                                    <span
                                      className={`text-xs font-mono font-semibold shrink-0 ${
                                        h.changePercent > 0
                                          ? "text-emerald-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {h.changePercent > 0 ? "+" : ""}
                                      {h.changePercent.toFixed(1)}%
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Filing date */}
                      {data.holders[0]?.reportDate && (
                        <>
                          <div className="h-px bg-border/40" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                              Data as of
                            </p>
                            <p className="text-sm font-mono font-medium">
                              {data.holders[0].reportDate}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Latest 13F filing period
                            </p>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {isDataLoading && (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-px w-full" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating chat panel */}
      <TickerChat
        symbol={upperSymbol}
        tickerData={data}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}

function SectionHeader({
  badge,
  badgeColor,
  title,
  subtitle,
  trailing,
}: {
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${badgeColor} text-white text-[11px] font-bold`}
        >
          {badge}
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {trailing}
    </div>
  );
}

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold font-mono ${valueColor || ""}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm text-muted-foreground py-6 text-center">{text}</p>
  );
}

function formatSidebarValue(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  if (value === 0) return "0";
  return value.toLocaleString();
}
