"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, User, AlertCircle, Landmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TICKERS } from "@/lib/tickers";
import { INVESTORS } from "@/lib/investors";
import { FUNDS } from "@/lib/funds";
import { toSlug } from "@/lib/slug";
import { useAuthStore } from "@/stores/auth-store";
import { isValyuMode } from "@/lib/app-mode";
import { SignInModal } from "@/components/auth";

type SearchResult =
  | { kind: "ticker"; symbol: string; name: string }
  | { kind: "investor"; name: string; fund: string; slug: string }
  | { kind: "fund"; name: string; slug: string; keyPeople: string[] }
  | { kind: "search-ticker"; symbol: string }
  | { kind: "search-fund"; name: string; slug: string }
  | { kind: "search-investor"; name: string; slug: string };

interface SearchBarProps {
  size?: "default" | "large";
  className?: string;
}

export function SearchBar({ size = "default", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSignIn, setShowSignIn] = useState(false);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const requiresAuth = isValyuMode();

  const showError = useCallback((message: string) => {
    // Shake the input
    setShaking(true);
    setTimeout(() => setShaking(false), 500);

    // Show toast
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const matches = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (q.length === 0) return [];

    const upperQ = q.toUpperCase();
    const lowerQ = q.toLowerCase();

    const tickerMatches: SearchResult[] = TICKERS.filter(
      (t) =>
        t.symbol.startsWith(upperQ) ||
        t.name.toLowerCase().includes(lowerQ)
    )
      .slice(0, 5)
      .map((t) => ({ kind: "ticker", symbol: t.symbol, name: t.name }));

    const investorMatches: SearchResult[] = INVESTORS.filter(
      (inv) =>
        inv.name.toLowerCase().includes(lowerQ)
    )
      .slice(0, 5)
      .map((inv) => ({
        kind: "investor",
        name: inv.name,
        fund: inv.fund,
        slug: inv.slug,
      }));

    const fundMatches: SearchResult[] = FUNDS.filter(
      (f) => f.name.toLowerCase().includes(lowerQ)
    )
      .slice(0, 5)
      .map((f) => ({
        kind: "fund",
        name: f.name,
        slug: f.slug,
        keyPeople: f.keyPeople,
      }));

    const knownResults = [...tickerMatches, ...fundMatches, ...investorMatches].slice(0, 8);

    // If there are few or no known matches and the query is long enough,
    // add free-text search options so the user can search for any ticker, fund, or investor
    if (q.length >= 1 && knownResults.length < 3) {
      // Show "search as ticker" if input looks like a ticker symbol (letters/dots, 1-5 chars)
      const mayBeTicker = /^[A-Za-z.]{1,5}$/.test(q.trim());
      if (mayBeTicker) {
        const hasTickerMatch = knownResults.some(
          (r) => r.kind === "ticker" && r.symbol === upperQ
        );
        if (!hasTickerMatch) {
          knownResults.push({ kind: "search-ticker", symbol: upperQ });
        }
      }

      if (q.length >= 2) {
        const slug = toSlug(q);
        if (slug) {
          const hasFundMatch = knownResults.some(
            (r) => r.kind === "fund" && r.name.toLowerCase() === lowerQ
          );
          const hasInvestorMatch = knownResults.some(
            (r) => r.kind === "investor" && r.name.toLowerCase() === lowerQ
          );
          if (!hasFundMatch) {
            knownResults.push({ kind: "search-fund", name: q.trim(), slug });
          }
          if (!hasInvestorMatch) {
            knownResults.push({ kind: "search-investor", name: q.trim(), slug });
          }
        }
      }
    }

    return knownResults;
  }, [query]);

  function navigate(result: SearchResult) {
    setIsOpen(false);
    setToast(null);

    // In valyu mode, require auth before navigating
    if (requiresAuth && !isAuthenticated) {
      setShowSignIn(true);
      return;
    }

    if (result.kind === "ticker" || result.kind === "search-ticker") {
      setQuery(result.symbol);
      router.push(`/ticker/${result.symbol}`);
    } else if (result.kind === "fund" || result.kind === "search-fund") {
      setQuery(result.name);
      router.push(`/fund/${result.slug}`);
    } else {
      setQuery(result.name);
      router.push(`/investor/${result.slug}`);
    }
  }

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (activeIndex >= 0 && matches[activeIndex]) {
      navigate(matches[activeIndex]);
      return;
    }
    const cleaned = query.trim().toUpperCase();
    if (!cleaned) {
      showError("Enter a ticker or investor name");
      return;
    }

    // In valyu mode, require auth before navigating
    if (requiresAuth && !isAuthenticated) {
      setShowSignIn(true);
      return;
    }

    // If it looks like a ticker (1-5 uppercase letters), go to ticker page
    if (/^[A-Z.]{1,5}$/.test(cleaned)) {
      setQuery(cleaned);
      router.push(`/ticker/${cleaned}`);
      return;
    }
    // Try to find a matching fund in known list
    const fundMatch = FUNDS.find(
      (f) => f.name.toLowerCase() === query.trim().toLowerCase()
    );
    if (fundMatch) {
      setQuery(fundMatch.name);
      router.push(`/fund/${fundMatch.slug}`);
      return;
    }
    // Try to find a matching investor in known list
    const investorMatch = INVESTORS.find(
      (inv) => inv.name.toLowerCase() === query.trim().toLowerCase()
    );
    if (investorMatch) {
      setQuery(investorMatch.name);
      router.push(`/investor/${investorMatch.slug}`);
      return;
    }
    // For any other text, default to searching as a fund
    const slug = toSlug(query.trim());
    if (slug) {
      setQuery(query.trim());
      router.push(`/fund/${slug}`);
      return;
    }
    showError("Enter a ticker, fund name, or investor name");
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
    <>
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
            placeholder="Search ticker, fund, or investor name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setToast(null);
              setIsOpen(e.target.value.trim().length > 0);
              setActiveIndex(-1);
            }}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className={`${isLarge ? "pl-11 h-14 text-lg" : "pl-9 h-10"} ${
              shaking ? "animate-[shake_0.4s_ease-in-out]" : ""
            }`}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen && matches.length > 0}
            aria-autocomplete="list"
            aria-controls="search-listbox"
            aria-activedescendant={
              activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
            }
          />

          {/* Dropdown */}
          {isOpen && matches.length > 0 && (
            <div
              ref={listRef}
              id="search-listbox"
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto"
            >
              {matches.map((match, i) => (
                <button
                  key={
                    match.kind === "ticker"
                      ? `t-${match.symbol}`
                      : match.kind === "search-ticker"
                      ? `st-${match.symbol}`
                      : match.kind === "fund"
                      ? `f-${match.slug}`
                      : match.kind === "search-fund"
                      ? `sf-${match.slug}`
                      : match.kind === "search-investor"
                      ? `si-${match.slug}`
                      : `i-${match.slug}`
                  }
                  id={`search-option-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  type="button"
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === activeIndex
                      ? "bg-muted"
                      : "hover:bg-muted/60"
                  }`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => navigate(match)}
                >
                  {match.kind === "ticker" ? (
                    <>
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-mono font-bold text-sm w-14 shrink-0 text-amber-600 dark:text-amber-400">
                        {match.symbol}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {match.name}
                      </span>
                    </>
                  ) : match.kind === "search-ticker" ? (
                    <>
                      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Search</span>
                      <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400 shrink-0">
                        {match.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        as ticker
                      </span>
                    </>
                  ) : match.kind === "fund" ? (
                    <>
                      <Landmark className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-sm text-blue-600 dark:text-blue-400 shrink-0">
                        {match.name}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        Fund
                      </span>
                    </>
                  ) : match.kind === "search-fund" ? (
                    <>
                      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Search</span>
                      <span className="font-semibold text-sm text-blue-600 dark:text-blue-400 truncate">
                        &ldquo;{match.name}&rdquo;
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        as fund
                      </span>
                    </>
                  ) : match.kind === "search-investor" ? (
                    <>
                      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Search</span>
                      <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 truncate">
                        &ldquo;{match.name}&rdquo;
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        as investor
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                        {match.name}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {match.fund}
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No results — only shows for single character queries */}
          {isOpen && query.trim().length > 0 && matches.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-50 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Type more to search for a ticker, fund, or investor...
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

        {requiresAuth && (
          <SignInModal open={showSignIn} onOpenChange={setShowSignIn} />
        )}
      </form>

      {/* Toast notification */}
      <div
        className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out ${
          toast
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white shadow-2xl shadow-black/20 dark:bg-zinc-800 dark:shadow-black/50 ring-1 ring-black/[0.08] dark:ring-white/[0.08]">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-[13px] text-zinc-800 dark:text-zinc-100 whitespace-nowrap">{toast}</span>
        </div>
      </div>

      {/* Shake keyframe */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </>
  );
}
