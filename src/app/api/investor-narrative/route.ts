import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getCached, setCache } from "@/lib/redis";
import { resolveAuth } from "@/lib/auth-utils";
import type { InvestorData } from "@/types";

const NARRATIVE_CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours — matches investor data TTL

const PositionSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  shares: z.number(),
  value: z.number(),
  activity: z.enum(["increased", "decreased", "new", "closed", "unchanged"]),
  changePercent: z.number(),
  reportDate: z.string(),
});

const TransactionSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  type: z.enum(["buy", "sell", "gift", "exercise", "award", "other"]),
  shares: z.number(),
  value: z.number(),
  pricePerShare: z.number(),
  date: z.string(),
});

const RequestSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  data: z.object({
    name: z.string().max(200),
    fund: z.string().max(200),
    title: z.string().max(200),
    positions: z.array(PositionSchema),
    transactions: z.array(TransactionSchema),
    totalPortfolioValue: z.number(),
    totalPositions: z.number(),
    buyCount: z.number(),
    sellCount: z.number(),
    totalBuyValue: z.number(),
    totalSellValue: z.number(),
  }),
});

const SYSTEM_PROMPT = `You are OpenWhales, an AI analyst that synthesizes SEC filing data to reveal an investor's strategy and activity.

Rules:
1. Every claim MUST cite a specific filing with date
2. Structure the narrative with clear markdown sections:
   - ## Portfolio Overview (summary of their holdings and strategy)
   - ## Top Positions (analysis of their largest and most notable positions)
   - ## Recent Activity (new positions, exits, and significant changes)
   - ## Insider Transactions (Form 4 activity if applicable)
   - ## Investment Signal (your synthesis — what their moves tell us)
3. Highlight notable patterns: sector concentration, conviction bets, position sizing
4. Use GitHub Flavored Markdown: headers, bold, tables where appropriate
5. Be specific with numbers — dollar amounts, share counts, percentages
6. Note the filing dates so readers understand how current the data is
7. Keep the narrative concise but thorough — aim for 600-1000 words
8. Do NOT make up or hallucinate any data. Only reference what is provided.`;

function formatDataForPrompt(data: InvestorData): string {
  const lines: string[] = [];

  lines.push(`## Investor: ${data.name}`);
  lines.push(`**Fund:** ${data.fund} | **Title:** ${data.title}`);
  lines.push(`**Total Portfolio Value:** $${data.totalPortfolioValue.toLocaleString()} | **Positions:** ${data.totalPositions}`);

  lines.push("\n## Portfolio Positions (from 13F filings)");
  if (data.positions.length > 0) {
    lines.push("| Ticker | Company | Shares | Value | Activity | Change % | Report Date |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const p of data.positions) {
      lines.push(
        `| ${p.ticker} | ${p.companyName} | ${p.shares.toLocaleString()} | $${p.value.toLocaleString()} | ${p.activity} | ${p.changePercent > 0 ? "+" : ""}${p.changePercent}% | ${p.reportDate} |`
      );
    }
  } else {
    lines.push("No 13F portfolio positions data available.");
  }

  lines.push("\n## Transactions (from Form 4 filings)");
  if (data.transactions.length > 0) {
    lines.push("| Ticker | Company | Type | Shares | Value | Price/Share | Date |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const tx of data.transactions) {
      lines.push(
        `| ${tx.ticker} | ${tx.companyName} | ${tx.type} | ${tx.shares.toLocaleString()} | $${tx.value.toLocaleString()} | $${tx.pricePerShare} | ${tx.date} |`
      );
    }
    lines.push(
      `\nSummary: ${data.buyCount} buys ($${data.totalBuyValue.toLocaleString()}), ${data.sellCount} sells ($${data.totalSellValue.toLocaleString()})`
    );
  } else {
    lines.push("No recent transactions found.");
  }

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const auth = resolveAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request. Requires slug and data." },
        { status: 400 }
      );
    }

    const { slug, data } = parsed.data;

    // Return cached narrative if available
    const cacheKey = `investor-narrative:${slug}`;
    const cached = await getCached<string>(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Cache": "HIT",
        },
      });
    }

    const formattedData = formatDataForPrompt(data as InvestorData);

    const result = streamText({
      model: openai("gpt-5.4-2026-03-05"),
      system: SYSTEM_PROMPT,
      prompt: `Analyze the investment activity and strategy of ${data.name} (${data.fund}). Here is the SEC filing data:\n\n${formattedData}\n\nSynthesize a comprehensive narrative about their investment strategy, recent moves, and what their activity signals. Cite every claim with specific data from above.`,
    });

    // Tee the stream: one side goes to the client, the other collects for caching
    const response = result.toTextStreamResponse();
    const [clientStream, cacheStream] = response.body!.tee();

    // Collect full text in background and cache it
    collectAndCache(cacheStream, cacheKey);

    return new Response(clientStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Investor narrative API error:", error);
    return NextResponse.json(
      { error: "Failed to generate narrative. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Reads a stream to completion in the background and caches the full text.
 * Failures are silently ignored — caching is best-effort.
 */
async function collectAndCache(
  stream: ReadableStream<Uint8Array>,
  cacheKey: string
): Promise<void> {
  try {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
    }

    if (full.length > 0) {
      await setCache(cacheKey, full, NARRATIVE_CACHE_TTL_SECONDS);
    }
  } catch {
    // Cache write failure is non-fatal
  }
}
