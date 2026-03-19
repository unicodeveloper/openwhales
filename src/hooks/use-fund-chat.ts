"use client";

import { useState, useCallback, useRef } from "react";
import { useAuthHeaders } from "@/hooks/use-auth-headers";
import type { FundData } from "@/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UseFundChatOptions {
  fund: string;
  fundData: FundData | null;
}

interface UseFundChatReturn {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: (content?: string) => void;
  isStreaming: boolean;
  error: string | null;
}

function formatContext(data: FundData): string {
  const lines: string[] = [];

  lines.push(`## ${data.name}`);
  lines.push(`Key People: ${data.keyPeople.join(", ")}`);
  lines.push(`Portfolio: $${data.totalPortfolioValue.toLocaleString()} | ${data.totalPositions} positions`);

  if (data.positions.length > 0) {
    lines.push("\n## Top Positions on Screen");
    lines.push("| Ticker | Company | Value | Activity | Change % |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const p of data.positions.slice(0, 10)) {
      lines.push(
        `| ${p.ticker} | ${p.companyName} | $${p.value.toLocaleString()} | ${p.activity} | ${p.changePercent > 0 ? "+" : ""}${p.changePercent}% |`
      );
    }
  }

  if (data.transactions.length > 0) {
    lines.push("\n## Recent Transactions on Screen");
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

export function useFundChat({ fund, fundData }: UseFundChatOptions): UseFundChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const headers = useAuthHeaders();

  const sendMessage = useCallback(
    (content?: string) => {
      const text = (content ?? input).trim();
      if (!text || isStreaming) return;

      setInput("");
      setError(null);

      const userMessage: ChatMessage = { id: createId(), role: "user", content: text };
      const assistantMessage: ChatMessage = { id: createId(), role: "assistant", content: "" };

      const updatedMessages = [...messages, userMessage];
      setMessages([...updatedMessages, assistantMessage]);
      setIsStreaming(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const context = fundData ? formatContext(fundData) : undefined;

      (async () => {
        try {
          const response = await fetch("/api/fund-chat", {
            method: "POST",
            headers,
            body: JSON.stringify({
              messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
              fund,
              context,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            setError((err as { error?: string }).error || "Something went wrong");
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
            setMessages([...updatedMessages, { ...assistantMessage, content: currentContent }]);
          }

          setMessages([...updatedMessages, { ...assistantMessage, content: accumulated }]);
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          setError(err instanceof Error ? err.message : "Failed to get response");
          setMessages(updatedMessages);
        } finally {
          setIsStreaming(false);
        }
      })();
    },
    [input, isStreaming, messages, fund, fundData, headers]
  );

  return { messages, input, setInput, sendMessage, isStreaming, error };
}
