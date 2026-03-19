"use client";

import { useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { FundData } from "@/types";

interface UseFundNarrativeStreamReturn {
  content: string;
  isStreaming: boolean;
  error: string | null;
  startStream: (data: FundData) => void;
}

export function useFundNarrativeStream(
  slug: string
): UseFundNarrativeStreamReturn {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const startStream = useCallback(
    (data: FundData) => {
      if (hasStarted.current) return;
      hasStarted.current = true;

      setIsStreaming(true);
      setContent("");
      setError(null);

      (async () => {
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          const token = useAuthStore.getState().getAccessToken();
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const response = await fetch("/api/fund-narrative", {
            method: "POST",
            headers,
            body: JSON.stringify({ slug, data }),
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
    [slug]
  );

  return { content, isStreaming, error, startStream };
}
