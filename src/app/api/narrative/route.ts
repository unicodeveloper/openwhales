import { NextRequest, NextResponse } from "next/server";
import { streamNarrative } from "@/lib/valyu";
import { z } from "zod";

const NarrativeBodySchema = z.object({
  symbol: z.string().min(1).max(5).transform((s) => s.toUpperCase()),
  data: z.object({
    symbol: z.string(),
    holders: z.array(z.any()),
    insiderTransactions: z.array(z.any()),
    buyCount: z.number(),
    sellCount: z.number(),
    totalBuyValue: z.number(),
    totalSellValue: z.number(),
  }),
});

export async function POST(request: NextRequest) {
  try {
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
