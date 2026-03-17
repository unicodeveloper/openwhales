"use client";

import { useState, useCallback, useRef } from "react";
import type { TickerData } from "@/types";

interface UseNarrativeStreamReturn {
  content: string;
  isStreaming: boolean;
  error: string | null;
  startStream: (data: TickerData) => void;
}

export function useNarrativeStream(
  symbol: string
): UseNarrativeStreamReturn {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const startStream = useCallback(
    (data: TickerData) => {
      if (hasStarted.current) return;
      hasStarted.current = true;

      setIsStreaming(true);
      setContent("");
      setError(null);

      (async () => {
        try {
          const response = await fetch("/api/narrative", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol, data }),
          });

          if (!response.ok) {
            const err = await response.json();
            setError(err.error || "Something went wrong.");
            setIsStreaming(false);
            hasStarted.current = false;
            return;
          }

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            setContent((prev) => prev + text);
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to stream narrative."
          );
        } finally {
          setIsStreaming(false);
          hasStarted.current = false;
        }
      })();
    },
    [symbol]
  );

  return { content, isStreaming, error, startStream };
}
