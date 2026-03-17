import { NextRequest, NextResponse } from "next/server";
import { generateText, Output, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { secSearch } from "@valyu/ai-sdk";
import { z } from "zod";
import { NarrativeRequestSchema } from "@/lib/schemas";
import type { TickerData } from "@/types";

const HolderSchema = z.object({
  name: z.string().describe("Fund or institution name"),
  shares: z.number().describe("Number of shares held in this specific stock"),
  value: z.number().describe("Value of the position in this specific stock in USD"),
  activity: z.enum(["increased", "decreased", "new", "closed", "unchanged"]).describe("How the position changed vs prior quarter"),
  changePercent: z.number().describe("Percentage change in shares vs prior quarter. Positive if increased, negative if decreased."),
  reportDate: z.string().describe("Filing report date in YYYY-MM-DD format"),
});

const InsiderTxSchema = z.object({
  name: z.string().describe("Insider's full name"),
  title: z.string().describe("Insider's role/title (e.g. CEO, CFO, Director, VP)"),
  type: z.enum(["buy", "sell", "gift", "exercise", "award", "other"]).describe(
    "Transaction type classification based on the SEC Form 4 description field. " +
    "buy = open market purchase, acquisition of shares (description contains 'Purchase'). " +
    "sell = sale, disposition, automatic sale (description contains 'Sale'). " +
    "exercise = exercise of stock options, conversion of derivative security (description contains 'Exercise' or 'Conversion'). " +
    "award = stock award, RSU grant, restricted stock grant, stock plan (description contains 'Award', 'Grant', or is empty with value=0 which indicates a vesting event). " +
    "gift = stock gift, charitable donation, bona fide gift (description contains 'Gift'). " +
    "other = ONLY if it truly does not match any of the above. This should be extremely rare."
  ),
  shares: z.number().describe("Number of shares transacted"),
  value: z.number().describe("Total transaction value in USD. Use 0 if null or not reported."),
  pricePerShare: z.number().describe("Price per share in USD. Use 0 if null or not reported (e.g. for awards/gifts at price 0.00)."),
  date: z.string().describe("Transaction date in YYYY-MM-DD format"),
});

const TickerDataSchema = z.object({
  symbol: z.string(),
  holders: z.array(HolderSchema).describe("Top 10 institutional holders from most recent 13F filings, sorted by position value descending"),
  insiderTransactions: z.array(InsiderTxSchema).describe("Up to 15 most recent insider transactions from Form 4 filings"),
  buyCount: z.number().describe("Count of insider BUY transactions only"),
  sellCount: z.number().describe("Count of insider SELL transactions only"),
  totalBuyValue: z.number().describe("Total USD value of insider buy transactions"),
  totalSellValue: z.number().describe("Total USD value of insider sell transactions"),
});

type TickerDataOutput = z.infer<typeof TickerDataSchema>;

/**
 * In-memory cache for ticker data.
 * 13F filings are quarterly, Form 4s trickle daily — 6h TTL is plenty fresh.
 */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const cache = new Map<string, { data: TickerData; timestamp: number }>();

function getCached(symbol: string): TickerData | null {
  const entry = cache.get(symbol);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(symbol);
    return null;
  }
  return entry.data;
}

function setCache(symbol: string, data: TickerData) {
  cache.set(symbol, { data, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = NarrativeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid ticker symbol." }, { status: 400 });
    }

    const { symbol } = parsed.data;

    // Return cached data if fresh
    const cached = getCached(symbol);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }

    const result = await generateText({
      model: openai("gpt-5.4-2026-03-05"),
      output: Output.object({ schema: TickerDataSchema }),
      system: `You are a financial data extraction assistant. Use the SEC search tool to find institutional holdings (13F) and insider transactions (Form 4) data. Extract the data accurately from search results.

Key rules:
- For holders: "value" is the value of the fund's position in the specific stock in USD
- For activity: compare current quarter shares to prior quarter. If shares went up, it's "increased". If down, "decreased". If the position is brand new, it's "new". If fully sold, "closed".
- For changePercent: calculate the percentage change in shares. e.g. if shares went from 100M to 110M, changePercent is 10.0. If from 100M to 90M, changePercent is -10.0.
- For insider transaction types, classify based on the description field:
  - "Sale at price..." → "sell"
  - "Purchase at price..." → "buy"
  - "Conversion of Exercise of derivative security..." or "Exercise of..." → "exercise"
  - "Stock Award(Grant)..." or "Award" or empty description with value=0/null → "award"
  - "Stock Gift..." or "Gift" → "gift"
  - ONLY use "other" if it genuinely doesn't match any above. This should be extremely rare.
- When the description is empty and value is null or 0, this is almost always an RSU vesting/award — classify as "award".
- buyCount/sellCount only count buy and sell transactions, not exercises, awards, or gifts.`,
      prompt: `Find the top 10 institutional holders and recent insider transactions for ${symbol}. Set symbol to "${symbol}".`,
      tools: {
        secSearch: secSearch({
          maxNumResults: 10,
          responseLength: "large",
        }),
      },
      stopWhen: stepCountIs(5),
    });

    let object: TickerDataOutput | null = null;
    try {
      object = result.output as TickerDataOutput;
    } catch {
      // output not generated on first attempt — retry with more steps
      const retry = await generateText({
        model: openai("gpt-5.4-2026-03-05"),
        output: Output.object({ schema: TickerDataSchema }),
        system: `Extract this data into the required JSON format. Do NOT call any tools — the data is already provided below.`,
        prompt: `Based on the following tool call results, extract the structured data for ${symbol}:\n\n${result.text}`,
        stopWhen: stepCountIs(1),
      });
      try {
        object = retry.output as TickerDataOutput;
      } catch {
        return NextResponse.json({ error: "Failed to extract data after retry" }, { status: 500 });
      }
    }

    if (!object) {
      return NextResponse.json({ error: "Failed to extract data" }, { status: 500 });
    }

    const data: TickerData = {
      symbol: object.symbol,
      holders: object.holders.map((h) => ({
        name: h.name,
        shares: h.shares,
        value: h.value,
        activity: h.activity,
        changePercent: h.changePercent,
        reportDate: h.reportDate,
      })),
      insiderTransactions: object.insiderTransactions.map((tx) => ({
        name: tx.name,
        title: tx.title,
        type: tx.type,
        shares: tx.shares,
        value: tx.value,
        pricePerShare: tx.pricePerShare,
        date: tx.date,
      })),
      buyCount: object.buyCount,
      sellCount: object.sellCount,
      totalBuyValue: object.totalBuyValue,
      totalSellValue: object.totalSellValue,
    };

    // Cache for subsequent requests
    setCache(symbol, data);

    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("Ticker data API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticker data." },
      { status: 500 }
    );
  }
}
