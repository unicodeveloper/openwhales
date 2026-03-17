import { z } from "zod";

export const NarrativeRequestSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(5)
    .transform((s) => s.toUpperCase())
    .refine((s) => /^[A-Z]{1,5}$/.test(s), {
      message: "Invalid ticker symbol",
    }),
});

export const ValyuFilingResultSchema = z.object({
  title: z.string(),
  content: z.unknown(),
  source: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  relevance_score: z.number().optional(),
});

export const ValyuSearchResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  results: z.array(ValyuFilingResultSchema),
});

export type NarrativeRequest = z.infer<typeof NarrativeRequestSchema>;
export type ValyuFilingResult = z.infer<typeof ValyuFilingResultSchema>;
