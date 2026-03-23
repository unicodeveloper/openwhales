import { NextRequest, NextResponse } from "next/server";
import { generateText, Output, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getCached, setCache } from "@/lib/redis";
import { findFundBySlug } from "@/lib/funds";
import { fromSlug } from "@/lib/slug";
import { resolveAuth } from "@/lib/auth-utils";
import { secSearch } from "@/lib/valyu-tools";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import type { FundData } from "@/types";

const PositionSchema = z.object({
  ticker: z.string().describe("Stock ticker symbol (e.g. AAPL)"),
  companyName: z.string().describe("Company name"),
  shares: z.number().describe("Number of shares held"),
  value: z.number().describe("Position value in USD"),
  activity: z.enum(["increased", "decreased", "new", "closed", "unchanged"]).describe("How the position changed vs prior quarter"),
  changePercent: z.number().describe("Percentage change in shares vs prior quarter"),
  reportDate: z.string().describe("Filing report date in YYYY-MM-DD format"),
});

const TransactionSchema = z.object({
  ticker: z.string().describe("Stock ticker symbol"),
  companyName: z.string().describe("Company name"),
  type: z.enum(["buy", "sell", "gift", "exercise", "award", "other"]).describe("Transaction type"),
  shares: z.number().describe("Number of shares transacted"),
  value: z.number().describe("Total transaction value in USD"),
  pricePerShare: z.number().describe("Price per share in USD"),
  date: z.string().describe("Transaction date in YYYY-MM-DD format"),
});

const FundDataSchema = z.object({
  name: z.string().describe("Fund or company name"),
  keyPeople: z.array(z.string()).describe("Key people at the fund (names only)"),
  positions: z.array(PositionSchema).describe("Top portfolio positions from 13F filings, sorted by value descending"),
  transactions: z.array(TransactionSchema).describe("Recent transactions from Form 4 filings"),
  totalPortfolioValue: z.number().describe("Total value of all reported positions in USD"),
  totalPositions: z.number().describe("Total number of positions held"),
  buyCount: z.number().describe("Count of buy transactions"),
  sellCount: z.number().describe("Count of sell transactions"),
  totalBuyValue: z.number().describe("Total USD value of buy transactions"),
  totalSellValue: z.number().describe("Total USD value of sell transactions"),
});

type FundDataOutput = z.infer<typeof FundDataSchema>;

const RequestSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
});

const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`fund-data:${ip}`, { maxRequests: 15, windowSeconds: 60 });
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    const auth = resolveAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { slug } = parsed.data;

    // Try to find the fund in the known list, otherwise derive name from slug
    const knownFund = findFundBySlug(slug);
    const fundName = knownFund?.name ?? fromSlug(slug);
    const keyPeople = knownFund?.keyPeople ?? [];

    // Return cached data if fresh
    const cached = await getCached<FundData>(`fund:${slug}`);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }

    const result = await generateText({
      model: openai("gpt-5.4-2026-03-05"),
      output: Output.object({ schema: FundDataSchema }),
      system: `You are a financial data extraction assistant. Use the SEC search tool to find all available data about a specific fund or investment company from SEC filings.

Key rules:
- Search for the fund name to find its 13F filings (portfolio holdings)
- Also search for insider transactions related to the fund
- For positions: "value" is the value of each position in USD
- For activity: compare current quarter shares to prior quarter
- For transactions: classify type based on description (buy, sell, exercise, award, gift)
- buyCount/sellCount only count buy and sell transactions, not exercises, awards, or gifts
- totalPortfolioValue should be the sum of all position values
- Set name to the official fund name as found in SEC filings (fall back to "${fundName}" if not found)
- Set keyPeople to key people found in SEC filings${keyPeople.length > 0 ? ` (known: ${JSON.stringify(keyPeople)})` : ""}`,
      prompt: `Find all SEC filing data for the fund "${fundName}". Search for their 13F-HR institutional holdings, 13D/G activist positions, and Form 4 insider transactions. I need their top portfolio positions and recent transactions.`,
      tools: {
        secSearch: secSearch({
          apiKey: auth.apiKey,
          bearerToken: auth.bearerToken,
          maxNumResults: 15,
          responseLength: "large",
        }),
      },
      stopWhen: stepCountIs(6),
    });

    let object: FundDataOutput | null = null;
    try {
      object = result.output as FundDataOutput;
    } catch {
      const retry = await generateText({
        model: openai("gpt-5.4-2026-03-05"),
        output: Output.object({ schema: FundDataSchema }),
        system: `Extract this data into the required JSON format. Do NOT call any tools — the data is already provided below. Set name to the official fund name (fall back to "${fundName}"). Set keyPeople to key people found in the data${keyPeople.length > 0 ? ` (known: ${JSON.stringify(keyPeople)})` : ""}.`,
        prompt: `Based on the following tool call results, extract the structured data for "${fundName}":\n\n${result.text}`,
        stopWhen: stepCountIs(1),
      });
      try {
        object = retry.output as FundDataOutput;
      } catch {
        return NextResponse.json({ error: "Failed to extract data after retry" }, { status: 500 });
      }
    }

    if (!object) {
      return NextResponse.json({ error: "Failed to extract data" }, { status: 500 });
    }

    const data: FundData = {
      name: object.name,
      keyPeople: object.keyPeople,
      positions: object.positions.map((p) => ({
        ticker: p.ticker,
        companyName: p.companyName,
        shares: p.shares,
        value: p.value,
        activity: p.activity,
        changePercent: p.changePercent,
        reportDate: p.reportDate,
      })),
      transactions: object.transactions.map((tx) => ({
        ticker: tx.ticker,
        companyName: tx.companyName,
        type: tx.type,
        shares: tx.shares,
        value: tx.value,
        pricePerShare: tx.pricePerShare,
        date: tx.date,
      })),
      totalPortfolioValue: object.totalPortfolioValue,
      totalPositions: object.totalPositions,
      buyCount: object.buyCount,
      sellCount: object.sellCount,
      totalBuyValue: object.totalBuyValue,
      totalSellValue: object.totalSellValue,
    };

    if (data.positions.length > 0 || data.transactions.length > 0) {
      await setCache(`fund:${slug}`, data, CACHE_TTL_SECONDS);
    }

    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("Fund data API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fund data." },
      { status: 500 }
    );
  }
}
