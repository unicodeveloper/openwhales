import { NextRequest, NextResponse } from "next/server";
import { streamNarrative } from "@/lib/valyu";
import { z } from "zod";
import { resolveAuth } from "@/lib/auth-utils";

const HolderSchema = z.object({
  name: z.string(),
  shares: z.number(),
  value: z.number(),
  activity: z.enum(["increased", "decreased", "new", "closed", "unchanged"]),
  changePercent: z.number(),
  reportDate: z.string(),
});

const InsiderTxSchema = z.object({
  name: z.string(),
  title: z.string(),
  type: z.enum(["buy", "sell", "gift", "exercise", "award", "other"]),
  shares: z.number(),
  value: z.number(),
  pricePerShare: z.number(),
  date: z.string(),
});

const NarrativeBodySchema = z.object({
  symbol: z.string().min(1).max(5).transform((s) => s.toUpperCase()),
  data: z.object({
    symbol: z.string(),
    holders: z.array(HolderSchema),
    insiderTransactions: z.array(InsiderTxSchema),
    buyCount: z.number(),
    sellCount: z.number(),
    totalBuyValue: z.number(),
    totalSellValue: z.number(),
  }),
});

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
    const parsed = NarrativeBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request. Requires symbol and data." },
        { status: 400 }
      );
    }

    const { symbol, data } = parsed.data;
    const result = streamNarrative(symbol, data);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Narrative API error:", error);
    return NextResponse.json(
      { error: "Failed to generate narrative. Please try again." },
      { status: 500 }
    );
  }
}
