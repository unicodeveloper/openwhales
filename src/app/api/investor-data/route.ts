import { NextRequest, NextResponse } from "next/server";
import { generateText, Output, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getCached, setCache } from "@/lib/redis";
import { findInvestorBySlug } from "@/lib/investors";
import { fromSlug } from "@/lib/slug";
import { resolveAuth } from "@/lib/auth-utils";
import { secSearch } from "@/lib/valyu-tools";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import type { InvestorData } from "@/types";

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

const InvestorDataSchema = z.object({
  name: z.string().describe("Investor's full name"),
  fund: z.string().describe("Fund or company name"),
  title: z.string().describe("Investor's role/title"),
  positions: z.array(PositionSchema).describe("Top portfolio positions from 13F filings, sorted by value descending"),
  transactions: z.array(TransactionSchema).describe("Recent insider transactions from Form 4 filings"),
  totalPortfolioValue: z.number().describe("Total value of all reported positions in USD"),
  totalPositions: z.number().describe("Total number of positions held"),
  buyCount: z.number().describe("Count of buy transactions"),
  sellCount: z.number().describe("Count of sell transactions"),
  totalBuyValue: z.number().describe("Total USD value of buy transactions"),
  totalSellValue: z.number().describe("Total USD value of sell transactions"),
});

type InvestorDataOutput = z.infer<typeof InvestorDataSchema>;

const RequestSchema = z.object({
  slug: z.string().min(1),
});

const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 15 requests per minute per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`investor-data:${ip}`, { maxRequests: 15, windowSeconds: 60 });
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

    // Try to find the investor in the known list, otherwise derive name from slug
    const knownInvestor = findInvestorBySlug(slug);
    const investorName = knownInvestor?.name ?? fromSlug(slug);
    const investorFund = knownInvestor?.fund ?? "";
    const investorTitle = knownInvestor?.title ?? "";

    // Return cached data if fresh
    const cached = await getCached<InvestorData>(`investor:${slug}`);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }

    const result = await generateText({
      model: openai("gpt-5.4-2026-03-05"),
      output: Output.object({ schema: InvestorDataSchema }),
      system: `You are a financial data extraction assistant. Use the SEC search tool to find all available data about a specific investor or fund manager from SEC filings.

Key rules:
- Search for the investor's name AND their fund name to get comprehensive results
- For fund managers: look for 13F filings to find their portfolio positions
- For corporate insiders: look for Form 4 filings to find their transactions
- For positions: "value" is the value of each position in USD
- For activity: compare current quarter shares to prior quarter
- For transactions: classify type based on description (buy, sell, exercise, award, gift)
- buyCount/sellCount only count buy and sell transactions, not exercises, awards, or gifts
- totalPortfolioValue should be the sum of all position values
- Set name to the investor's full name as found in SEC filings (fall back to "${investorName}")
- Set fund to the investor's fund/company as found in SEC filings${investorFund ? ` (known: "${investorFund}")` : ""}
- Set title to the investor's role/title as found in SEC filings${investorTitle ? ` (known: "${investorTitle}")` : ""}`,
      prompt: `Find all SEC filing data for ${investorName}${investorFund ? ` (${investorFund})` : ""}. Search for their 13F holdings, 13D/G activist positions, and Form 4 insider transactions. I need their top portfolio positions and recent transactions across all their holdings.`,
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

    let object: InvestorDataOutput | null = null;
    try {
      object = result.output as InvestorDataOutput;
    } catch {
      const retry = await generateText({
        model: openai("gpt-5.4-2026-03-05"),
        output: Output.object({ schema: InvestorDataSchema }),
        system: `Extract this data into the required JSON format. Do NOT call any tools — the data is already provided below. Set name to "${investorName}"${investorFund ? `, fund to "${investorFund}"` : ""}${investorTitle ? `, title to "${investorTitle}"` : ""}.`,
        prompt: `Based on the following tool call results, extract the structured data for ${investorName}${investorFund ? ` (${investorFund})` : ""}:\n\n${result.text}`,
        stopWhen: stepCountIs(1),
      });
      try {
        object = retry.output as InvestorDataOutput;
      } catch {
        return NextResponse.json({ error: "Failed to extract data after retry" }, { status: 500 });
      }
    }

    if (!object) {
      return NextResponse.json({ error: "Failed to extract data" }, { status: 500 });
    }

    const data: InvestorData = {
      name: object.name,
      fund: object.fund,
      title: object.title,
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

    // Only cache if we actually got meaningful data
    if (data.positions.length > 0 || data.transactions.length > 0) {
      await setCache(`investor:${slug}`, data, CACHE_TTL_SECONDS);
    }

    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("Investor data API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch investor data." },
      { status: 500 }
    );
  }
}
