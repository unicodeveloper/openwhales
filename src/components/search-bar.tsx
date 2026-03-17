"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TICKERS } from "@/lib/tickers";

interface SearchBarProps {
  size?: "default" | "large";
  className?: string;
}

export function SearchBar({ size = "default", className = "" }: SearchBarProps) {
  const [ticker, setTicker] = useState("");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = ticker.trim().toUpperCase();
  const matches =
    query.length > 0
      ? TICKERS.filter(
          (t) =>
            t.symbol.startsWith(query) ||
            t.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8)
      : [];

  function navigate(symbol: string) {
    setTicker(symbol);
    setIsOpen(false);
    setError("");
    router.push(`/ticker/${symbol}`);
  }

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (activeIndex >= 0 && matches[activeIndex]) {
      navigate(matches[activeIndex].symbol);
      return;
    }
    const cleaned = ticker.trim().toUpperCase();
    if (!cleaned || !/^[A-Z.]{1,5}$/.test(cleaned)) {
      setError("Enter a valid ticker (e.g. AAPL)");
      return;
    }
    navigate(cleaned);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || matches.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isLarge = size === "large";

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 w-full ${className}`}
    >
      <div className="relative flex-1">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 ${
            isLarge ? "h-5 w-5" : "h-4 w-4"
          }`}
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search ticker or company name..."
          value={ticker}
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            setTicker(val);
            setError("");
            setIsOpen(val.trim().length > 0);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (ticker.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={`${isLarge ? "pl-11 h-14 text-lg" : "pl-9 h-10"}`}
          maxLength={5}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen && matches.length > 0}
          aria-autocomplete="list"
          aria-controls="ticker-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `ticker-option-${activeIndex}` : undefined
          }
        />

        {/* Dropdown */}
        {isOpen && matches.length > 0 && (
          <div
            ref={listRef}
            id="ticker-listbox"
            role="listbox"
            className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto"
          >
            {matches.map((match, i) => (
              <button
                key={match.symbol}
                id={`ticker-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === activeIndex
                    ? "bg-muted"
                    : "hover:bg-muted/60"
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => navigate(match.symbol)}
              >
                <span className="font-mono font-bold text-sm w-14 shrink-0 text-amber-600 dark:text-amber-400">
                  {match.symbol}
                </span>
                <span className="text-sm text-muted-foreground truncate">
                  {match.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {isOpen && query.length > 0 && matches.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              No match found. Press Enter to search <span className="font-mono font-semibold text-foreground">${query}</span> anyway.
            </p>
          </div>
        )}
      </div>
      <Button
        type="submit"
        size={isLarge ? "lg" : "default"}
        className={isLarge ? "h-14 px-4 sm:px-8 text-base sm:text-lg" : ""}
      >
        <Search className="h-4 w-4 sm:hidden" />
        <span className="hidden sm:inline">Analyze</span>
      </Button>
      {error && (
        <p className="absolute -bottom-6 left-0 text-sm text-red-500">
          {error}
        </p>
      )}
    </form>
  );
}
