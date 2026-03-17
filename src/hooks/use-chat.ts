"use client";

import { useState, useCallback, useRef } from "react";
import type { TickerData } from "@/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UseChatOptions {
  symbol: string;
  tickerData: TickerData | null;
}

interface UseChatReturn {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: (content?: string) => void;
  isStreaming: boolean;
  error: string | null;
}

function formatContext(data: TickerData): string {
  const lines: string[] = [];

  if (data.holders.length > 0) {
    lines.push("## Current 13F Data on Screen");
    lines.push("| Fund | Shares | Value | Activity | Change % |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const h of data.holders) {
      lines.push(
        `| ${h.name} | ${h.shares.toLocaleString()} | $${h.value.toLocaleString()} | ${h.activity} | ${h.changePercent > 0 ? "+" : ""}${h.changePercent}% |`
      );
    }
  }

  if (data.insiderTransactions.length > 0) {
    lines.push("\n## Current Form 4 Data on Screen");
    lines.push(
      `Buys: ${data.buyCount} ($${data.totalBuyValue.toLocaleString()}) | Sells: ${data.sellCount} ($${data.totalSellValue.toLocaleString()})`
    );
  }

  return lines.join("\n");
}

let messageIdCounter = 0;
function createId() {
  return `msg-${Date.now()}-${++messageIdCounter}`;
}

export function useChat({ symbol, tickerData }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    (content?: string) => {
      const text = (content ?? input).trim();
      if (!text || isStreaming) return;

      setInput("");
      setError(null);

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: text,
      };

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: "",
      };

      const updatedMessages = [...messages, userMessage];
      setMessages([...updatedMessages, assistantMessage]);
      setIsStreaming(true);

      // Abort any previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const context = tickerData ? formatContext(tickerData) : undefined;

      (async () => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: updatedMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              symbol,
              context,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            setError(
              (err as { error?: string }).error || "Something went wrong"
            );
            // Remove empty assistant message
            setMessages(updatedMessages);
            setIsStreaming(false);
            return;
          }

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            const currentContent = accumulated;
            setMessages([
              ...updatedMessages,
              { ...assistantMessage, content: currentContent },
            ]);
          }

          // Final update
          setMessages([
            ...updatedMessages,
            { ...assistantMessage, content: accumulated },
          ]);
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          setError(
            err instanceof Error ? err.message : "Failed to get response"
          );
          setMessages(updatedMessages);
        } finally {
          setIsStreaming(false);
        }
      })();
    },
    [input, isStreaming, messages, symbol, tickerData]
  );

  return { messages, input, setInput, sendMessage, isStreaming, error };
}
