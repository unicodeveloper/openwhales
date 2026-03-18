"use client";

import { useRef, useEffect, useCallback } from "react";
import { Streamdown } from "streamdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  TrendingUp,
  Building2,
  FileText,
  Briefcase,
  Loader2,
  MessageSquare,
  Sparkles,
  X,
  Minus,
} from "lucide-react";
import { useInvestorChat } from "@/hooks/use-investor-chat";
import type { InvestorData } from "@/types";

interface InvestorChatProps {
  investor: string;
  fund?: string;
  investorData: InvestorData | null;
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  {
    label: "Portfolio conviction",
    prompt:
      "What are this investor's highest-conviction bets? Analyze position sizing relative to total portfolio value.",
    icon: Briefcase,
  },
  {
    label: "Recent moves",
    prompt:
      "What are the most significant position changes in the last two quarters? New positions, exits, and major increases or decreases?",
    icon: TrendingUp,
  },
  {
    label: "13F vs prior quarter",
    prompt:
      "Compare the latest 13F filing with the previous quarter. What shifted in their top 10 holdings?",
    icon: FileText,
  },
  {
    label: "Sector strategy",
    prompt:
      "What sectors and themes is this investor concentrated in? Is there a visible strategy shift?",
    icon: Building2,
  },
];

export function InvestorChat({ investor, fund, investorData, isOpen, onClose }: InvestorChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, setInput, sendMessage, isStreaming, error } =
    useInvestorChat({ investor, fund, investorData });

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    },
    [setInput]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        sendMessage();
      }
    }
  };

  const selectPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      sendMessage();
    }
  };

  if (!isOpen) return null;

  const displayName = investor.split(" ").slice(-1)[0]; // Last name for compact display

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={onClose}
      />

      <div className="chat-panel-enter fixed z-50 bottom-0 right-0 w-full h-[calc(100vh-3.5rem)] sm:bottom-4 sm:right-4 sm:w-[420px] sm:h-[min(600px,calc(100vh-6rem))] sm:rounded-xl flex flex-col rounded-t-xl sm:rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              {isStreaming && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-tight">
                {displayName} Research
              </h3>
              <p className="text-[10px] text-muted-foreground leading-tight">
                13F holdings, trades & strategy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasMessages && (
              <span className="text-[9px] font-mono text-muted-foreground/60 px-1.5 py-0.5 rounded border border-border/30 mr-1">
                {messages.filter((m) => m.role === "assistant").length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Minimize chat"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth min-h-0"
        >
          {!hasMessages && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-3">
                <Sparkles className="h-4 w-4 text-emerald-500/60" />
              </div>
              <p className="text-xs text-muted-foreground text-center mb-0.5">
                Ask anything about{" "}
                <span className="font-semibold text-foreground">
                  {investor}
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground/50 text-center max-w-[260px]">
                Searches 13F filings, insider trades & portfolio data in real time
              </p>

              <div className="grid grid-cols-2 gap-1.5 mt-4 w-full max-w-sm">
                {SUGGESTED_PROMPTS.map((sp) => (
                  <button
                    key={sp.label}
                    onClick={() => selectPrompt(sp.prompt)}
                    className="group/card flex items-start gap-2 p-2.5 rounded-lg border border-border/40 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left cursor-pointer"
                  >
                    <sp.icon className="h-3 w-3 text-muted-foreground group-hover/card:text-emerald-400 transition-colors mt-0.5 shrink-0" />
                    <span className="text-[10px] text-muted-foreground group-hover/card:text-foreground transition-colors leading-snug">
                      {sp.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs leading-relaxed">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {message.content ? (
                    <div className="max-w-full">
                      <div className="chat-response-content">
                        <Streamdown
                          mode={
                            isStreaming &&
                            message.id === messages[messages.length - 1]?.id
                              ? "streaming"
                              : "static"
                          }
                          isAnimating={
                            isStreaming &&
                            message.id === messages[messages.length - 1]?.id
                          }
                          animated
                          remarkPlugins={[remarkGfm]}
                          controls={false}
                        >
                          {message.content}
                        </Streamdown>
                      </div>
                    </div>
                  ) : isStreaming ? (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground py-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Searching data sources...</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-3 mb-1.5 px-2.5 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 flex items-center justify-between shrink-0">
            <span className="truncate">{error}</span>
            <button
              onClick={() => {
                const lastUserMsg = [...messages]
                  .reverse()
                  .find((m) => m.role === "user");
                if (lastUserMsg) sendMessage(lastUserMsg.content);
              }}
              className="underline hover:no-underline ml-2 shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-border/40 p-3 shrink-0">
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask about ${displayName}...`}
                  rows={1}
                  disabled={isStreaming}
                  className="w-full resize-none rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 pr-8 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50 transition-colors"
                />
                {input && !isStreaming && (
                  <button
                    type="button"
                    onClick={() => {
                      setInput("");
                      if (inputRef.current) {
                        inputRef.current.style.height = "auto";
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="shrink-0 h-[38px] w-[38px] rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
              >
                {isStreaming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/** CTA button to open the investor chat */
export function InvestorChatCTA({
  onClick,
  variant = "default",
}: {
  onClick: () => void;
  variant?: "default" | "header";
}) {
  if (variant === "header") {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-400 font-medium hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer"
      >
        <MessageSquare className="h-3 w-3" />
        Ask AI
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-[11px] text-emerald-400 font-medium hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer"
    >
      <MessageSquare className="h-3 w-3" />
      Deep dive chat
    </button>
  );
}
