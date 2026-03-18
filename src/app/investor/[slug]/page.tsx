"use client";

import { useEffect, use, useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import {
  BuildingOfficeIcon,
  ScalesIcon,
  ScrollIcon,
  BrainIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useInvestorData } from "@/hooks/use-investor-data";
import { useInvestorNarrativeStream } from "@/hooks/use-investor-narrative-stream";
import { NarrativeStream } from "@/components/narrative-stream";
import { InvestorPortfolioTable } from "@/components/investor-portfolio-table";
import { InvestorTransactions } from "@/components/investor-transactions";
import { BuySellChart } from "@/components/buy-sell-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { InvestorChat, InvestorChatCTA } from "@/components/investor-chat";
import { AuthGate } from "@/components/auth/auth-gate";

export default function InvestorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data, isLoading: isDataLoading } = useInvestorData(slug);
  const { content, isStreaming, error, startStream } =
    useInvestorNarrativeStream(slug);
  const [, setReady] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setReady(true);
      startStream(data);
    }
  }, [data, startStream]);

  return (
    <AuthGate>
    <div className="min-h-screen">
      {/* Header strip */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 sm:py-6 max-w-7xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Link
                href="/"
                className="p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                {isDataLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : data ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h1 className="text-xl sm:text-3xl font-black tracking-tight truncate">
                          {data.name}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {data.title} &middot; {data.fund}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-mono truncate">
                    {slug.replace(/-/g, " ")}
                  </h1>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {isDataLoading && (
                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border/40 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                  </span>
                  <span className="hidden xs:inline">Fetching data</span>
                </span>
              )}
              {isStreaming && (
                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-[10px] sm:text-xs text-emerald-400 font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="hidden sm:inline">AI Analyzing</span>
                </span>
              )}
              <InvestorChatCTA onClick={() => setChatOpen(true)} variant="header" />
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
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl py-4 sm:py-8">
        {/* Portfolio positions (full width) */}
        <section className="mb-6 sm:mb-8">
          <SectionHeader
            icon={<BuildingOfficeIcon weight="duotone" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />}
            iconColor="bg-amber-500"
            title="Portfolio Positions"
            subtitle="Holdings from recent 13F filings, sorted by value"
          />
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="p-3 sm:p-5">
              {isDataLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data?.positions && data.positions.length > 0 ? (
                <InvestorPortfolioTable positions={data.positions} />
              ) : (
                <EmptyState text="No portfolio positions data available" />
              )}
            </div>
          </div>
        </section>

        {/* Middle row: Buy/Sell + Transactions side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <section>
            <SectionHeader
              icon={<ScalesIcon weight="duotone" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />}
              iconColor="bg-emerald-500"
              title="Buy vs. Sell Activity"
              subtitle="Transaction breakdown by count and value"
            />
            <div className="rounded-xl border border-border/40 p-3 sm:p-5 h-[calc(100%-3rem)]">
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
                <EmptyState text="No transaction data available" />
              )}
            </div>
          </section>

          <section>
            <SectionHeader
              icon={<ScrollIcon weight="duotone" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />}
              iconColor="bg-violet-500"
              title="Recent Transactions"
              subtitle="Insider trades and portfolio changes"
            />
            <div className="rounded-xl border border-border/40 p-3 sm:p-5 max-h-[400px] sm:max-h-[500px] overflow-y-auto h-[calc(100%-3rem)]">
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
              ) : data?.transactions && data.transactions.length > 0 ? (
                <InvestorTransactions transactions={data.transactions} />
              ) : (
                <EmptyState text="No recent transactions found" />
              )}
            </div>
          </section>
        </div>

        {/* AI Narrative */}
        <section>
          <SectionHeader
            icon={<BrainIcon weight="duotone" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />}
            iconColor="bg-blue-500"
            title="Investment Strategy Narrative"
            subtitle="AI-synthesized analysis of this investor's SEC filing activity"
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
                <InvestorChatCTA onClick={() => setChatOpen(true)} />
              </div>
            }
          />
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Narrative body */}
              <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8">
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
                          <StatRow
                            label="Portfolio value"
                            value={formatSidebarValue(data.totalPortfolioValue)}
                          />
                          <StatRow
                            label="Positions held"
                            value={String(data.totalPositions)}
                          />
                          <StatRow
                            label="Transactions"
                            value={String(data.transactions.length)}
                          />
                          <StatRow
                            label="Buys"
                            value={String(data.buyCount)}
                            valueColor="text-emerald-500"
                          />
                          <StatRow
                            label="Sells"
                            value={String(data.sellCount)}
                            valueColor="text-red-500"
                          />
                        </div>
                      </div>

                      <div className="h-px bg-border/40" />

                      {/* Net flow */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                          Net Transaction Flow
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

                      {/* Top movers */}
                      {data.positions.filter((p) => p.changePercent !== 0).length > 0 && (
                        <>
                          <div className="h-px bg-border/40" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                              Biggest Moves
                            </p>
                            <div className="space-y-2">
                              {data.positions
                                .filter((p) => p.changePercent !== 0)
                                .sort(
                                  (a, b) =>
                                    Math.abs(b.changePercent) -
                                    Math.abs(a.changePercent)
                                )
                                .slice(0, 4)
                                .map((p, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between gap-2"
                                  >
                                    <span className="text-xs truncate flex-1 font-mono">
                                      {p.ticker}
                                    </span>
                                    <span
                                      className={`text-xs font-mono font-semibold shrink-0 ${
                                        p.changePercent > 0
                                          ? "text-emerald-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {p.changePercent > 0 ? "+" : ""}
                                      {p.changePercent.toFixed(1)}%
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Filing date */}
                      {data.positions[0]?.reportDate && (
                        <>
                          <div className="h-px bg-border/40" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                              Data as of
                            </p>
                            <p className="text-sm font-mono font-medium">
                              {data.positions[0].reportDate}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Latest filing period
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
      <InvestorChat
        investor={data?.name || slug.replace(/-/g, " ")}
        fund={data?.fund}
        investorData={data}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
    </AuthGate>
  );
}

function SectionHeader({
  icon,
  iconColor,
  title,
  subtitle,
  trailing,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-3 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${iconColor} shrink-0`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold tracking-tight truncate">{title}</h2>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{subtitle}</p>
        </div>
      </div>
      <div className="shrink-0">{trailing}</div>
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
