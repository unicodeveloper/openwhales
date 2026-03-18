import { streamText, generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { secSearch } from "@/lib/valyu-tools";
import type { TickerData } from "@/types";

const SYSTEM_PROMPT = `You are OpenWhales, an AI analyst that synthesizes SEC filing data to reveal what smart money thinks about a stock.

Rules:
1. Every claim MUST cite a specific filing with date (e.g., "Vanguard Group increased their position to 1.28B shares (13F, 2025-12-31)")
2. Structure the narrative with clear markdown sections:
   - ## Institutional Ownership (from 13F data)
   - ## Activist & Major Shareholders (from 13D/G data, if available)
   - ## Insider Activity (from Form 4 data)
   - ## Smart Money Signal (your synthesis — bullish/bearish/neutral with reasoning)
3. Highlight notable patterns: large position changes, coordinated insider buying/selling, activist accumulation
4. Use GitHub Flavored Markdown: headers, bold, tables where appropriate
5. If data is missing for a category, briefly note "No recent [category] filings found" and move on
6. End with a "Smart Money Signal" section that synthesizes all data into an overall assessment
7. Be specific with numbers — dollar amounts, share counts, percentages
8. Note the filing dates so readers understand how current the data is
9. Keep the narrative concise but thorough — aim for 600-1000 words
10.Do NOT make up or hallucinate any data. Only reference what is provided.`;

function formatDataForPrompt(data: TickerData): string {
  const lines: string[] = [];

  lines.push("## 13F Institutional Holdings Data");
  if (data.holders.length > 0) {
    lines.push("| Fund | Shares | Value | Activity | Change % | Report Date |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const h of data.holders) {
      lines.push(
        `| ${h.name} | ${h.shares.toLocaleString()} | $${h.value.toLocaleString()} | ${h.activity} | ${h.changePercent > 0 ? "+" : ""}${h.changePercent}% | ${h.reportDate} |`
      );
    }
  } else {
    lines.push("No 13F institutional holdings data available.");
  }

  lines.push("\n## Form 4 Insider Transactions Data");
  if (data.insiderTransactions.length > 0) {
    lines.push("| Name | Title | Type | Shares | Value | Price/Share | Date |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const tx of data.insiderTransactions) {
      lines.push(
        `| ${tx.name} | ${tx.title} | ${tx.type} | ${tx.shares.toLocaleString()} | $${tx.value.toLocaleString()} | $${tx.pricePerShare} | ${tx.date} |`
      );
    }
    lines.push(
      `\nSummary: ${data.buyCount} buys ($${data.totalBuyValue.toLocaleString()}), ${data.sellCount} sells ($${data.totalSellValue.toLocaleString()})`
    );
  } else {
    lines.push("No recent insider transactions found.");
  }

  return lines.join("\n");
}

export function streamNarrative(symbol: string, data: TickerData) {
  const formattedData = formatDataForPrompt(data);

  return streamText({
    model: openai("gpt-5.4-2026-03-05"),
    system: SYSTEM_PROMPT,
    prompt: `Analyze the smart money activity for $${symbol}. Here is the SEC filing data:\n\n${formattedData}\n\nSynthesize a comprehensive narrative about what smart money collectively thinks about $${symbol} and why. Cite every claim with specific data from above.`,
  });
}

/** Valyu API key to use — defaults to env var for trending (server-initiated) calls */
const DEFAULT_VALYU_KEY = process.env.VALYU_API_KEY || "";

export async function fetchTrendingSummary(symbol: string) {
  try {
    const { text } = await generateText({
      model: openai("gpt-5.4-2026-03-05"),
      prompt: `For the stock ticker ${symbol}, use the SEC search tool to find: 1) The top 3 institutional holders from recent 13F filings with their approximate position values. 2) Whether insiders have been net buying or selling recently based on Form 4 filings.

Respond ONLY with valid JSON, no markdown or explanation. Use this exact format:
{"topHolders":[{"name":"Fund Name","valueUsd":123456789}],"insiderActivity":{"netDirection":"buying","recentCount":5}}

netDirection must be one of: "buying", "selling", "mixed", "none"`,
      tools: {
        secSearch: secSearch({
          apiKey: DEFAULT_VALYU_KEY,
          maxNumResults: 10,
          responseLength: "medium",
        }),
      },
      stopWhen: stepCountIs(3),
    });


    console.log("fetch Trending Summary ", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      symbol,
      topHolders: parsed.topHolders || [],
      insiderActivity: parsed.insiderActivity || {
        netDirection: "none" as const,
        recentCount: 0,
      },
    };
  } catch {
    return {
      symbol,
      topHolders: [],
      insiderActivity: { netDirection: "none" as const, recentCount: 0 },
    };
  }
}
