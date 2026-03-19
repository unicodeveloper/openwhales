import { streamText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { resolveAuth } from "@/lib/auth-utils";
import { secSearch, financeSearch, economicsSearch, companyResearch } from "@/lib/valyu-tools";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatBodySchema = z.object({
  messages: z.array(MessageSchema),
  symbol: z.string().min(1).max(10),
  context: z.string().optional(),
});

const SYSTEM_PROMPT = `You are OpenWhales Alpha, an elite financial research assistant embedded in a stock analysis platform. The user is currently viewing a ticker page and wants deeper insight.

Your capabilities:
- Search SEC filings (13F, 13D/G, Form 4, 10-K, 10-Q, 8-K, proxy statements) for institutional ownership, insider trades, and financial disclosures
- Search financial data for market data, earnings, valuations, and financial metrics
- Search economics data for macro indicators, interest rates, GDP, inflation, and economic trends
- Research companies for comprehensive company profiles, competitive landscape, and industry analysis

Rules:
1. ALWAYS use the available tools to fetch real data before answering. Never make up financial data.
2. Cite specific filings with dates when referencing SEC data.
3. Use markdown formatting: headers, bold, tables, and bullet points for readability.
4. When comparing quarters or periods, pull data for both periods to give accurate comparisons.
5. Be specific with numbers — dollar amounts, share counts, percentages.
6. If data is unavailable or inconclusive, say so clearly rather than speculating.
7. Keep responses focused and actionable — the user wants alpha, not filler.
8. When analyzing 10-K vs 10-Q, explain the differences in context (annual vs quarterly).
9. For multi-quarter analysis, organize data chronologically so trends are visible.
10. Always mention the date/quarter of any data you reference so the user knows how current it is.`;

export async function POST(request: Request) {
  try {
    // Rate limit: 20 requests per minute per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`chat:${ip}`, { maxRequests: 20, windowSeconds: 60 });
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    const req = request as import("next/server").NextRequest;
    const auth = resolveAuth(req);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({ error: "Authentication required." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const parsed = ChatBodySchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, symbol, context } = parsed.data;

    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nThe user is analyzing $${symbol}. Here is the current data already displayed on their screen:\n\n${context}\n\nUse this as background context, but always fetch fresh data with tools when the user asks specific questions.`
      : `${SYSTEM_PROMPT}\n\nThe user is analyzing $${symbol}.`;

    const result = streamText({
      model: openai("gpt-5.4-2026-03-05"),
      system: systemWithContext,
      messages,
      tools: {
        secSearch: secSearch({
          apiKey: auth.apiKey,
          bearerToken: auth.bearerToken,
          maxNumResults: 10,
          responseLength: "large",
        }),
        financeSearch: financeSearch({
          apiKey: auth.apiKey,
          bearerToken: auth.bearerToken,
          maxNumResults: 8,
          responseLength: "large",
        }),
        economicsSearch: economicsSearch({
          apiKey: auth.apiKey,
          bearerToken: auth.bearerToken,
          maxNumResults: 8,
          responseLength: "medium",
        }),
        companyResearch: companyResearch({ apiKey: auth.apiKey, bearerToken: auth.bearerToken }),
      },
      stopWhen: stepCountIs(5),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
