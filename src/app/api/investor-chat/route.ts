import { streamText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { resolveAuth } from "@/lib/auth-utils";
import { secSearch, financeSearch, companyResearch } from "@/lib/valyu-tools";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatBodySchema = z.object({
  messages: z.array(MessageSchema),
  investor: z.string().min(1),
  fund: z.string().optional(),
  context: z.string().optional(),
});

const SYSTEM_PROMPT = `You are OpenWhales Alpha, an elite financial research assistant. The user is researching a specific investor or fund manager and wants deep insight into their strategy, holdings, and moves.

Your capabilities:
- Search SEC filings (13F, 13D/G, Form 4, 10-K, 10-Q, 8-K, proxy statements) for this investor's holdings, position changes, activist stakes, and insider trades
- Search financial data for market context on stocks this investor holds
- Research companies in this investor's portfolio for competitive landscape and fundamentals

Rules:
1. ALWAYS use the available tools to fetch real data before answering. Never make up financial data.
2. Cite specific filings with dates when referencing SEC data.
3. Use markdown formatting: headers, bold, tables, and bullet points for readability.
4. When comparing quarters, pull data for both periods to give accurate comparisons.
5. Be specific with numbers — dollar amounts, share counts, percentages, portfolio weights.
6. If data is unavailable or inconclusive, say so clearly rather than speculating.
7. Keep responses focused and actionable — the user wants alpha, not filler.
8. When discussing portfolio changes, show before/after comparisons.
9. For conviction analysis, consider position sizing relative to total portfolio.
10. Always mention the date/quarter of any data you reference so the user knows how current it is.`;

export async function POST(request: Request) {
  try {
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

    const { messages, investor, fund, context } = parsed.data;

    const investorLabel = fund ? `${investor} (${fund})` : investor;

    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nThe user is researching ${investorLabel}. Here is the current data already displayed on their screen:\n\n${context}\n\nUse this as background context, but always fetch fresh data with tools when the user asks specific questions.`
      : `${SYSTEM_PROMPT}\n\nThe user is researching ${investorLabel}.`;

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
        companyResearch: companyResearch({ apiKey: auth.apiKey, bearerToken: auth.bearerToken }),
      },
      stopWhen: stepCountIs(5),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Investor chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
