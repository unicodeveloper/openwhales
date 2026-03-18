import Image from "next/image";
import { SearchBar } from "@/components/search-bar";
import { TrendingGrid } from "@/components/trending-grid";
import { MacbookDemo } from "@/components/macbook-demo";
import { RotatingWords } from "@/components/rotating-words";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero with background image — extends under the transparent nav */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background image */}
        <Image
          src="/hero-bg.avif"
          alt=""
          fill
          priority
          className="object-cover object-center"
          aria-hidden="true"
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70" />
        {/* Bottom fade into pure black page bg */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 container mx-auto px-4 py-20 sm:py-28">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md mb-8 animate-fade-in">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-[11px] font-medium tracking-wide text-white/50">
                Tracking SEC filings in real-time. Powered by <a href="https://docs.valyu.ai/sources/sec-filings#sec-filings-api-for-ai-agents-search-3m-regulatory-documents" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70 transition-colors">Valyu</a>
              </span>
            </div>

            {/* Headline with rotating keyword */}
            <h1
              className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-[-0.03em] leading-[0.95] animate-fade-up text-white/80"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Follow the
              <br />
              <RotatingWords />
            </h1>

            {/* Subhead */}
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-white/60 max-w-lg leading-relaxed animate-fade-up-delay-1 px-2 sm:px-0">
              Institutional holdings, activist positions, and insider
              transactions analyzed by AI from public SEC filings
            </p>

            {/* Search */}
            <div className="mt-8 sm:mt-10 w-full max-w-xl animate-fade-up-delay-2 relative z-20 px-2 sm:px-0">
              <SearchBar size="large" />
            </div>

            {/* Filing types */}
            <div className="mt-8 sm:mt-10 flex items-center gap-4 sm:gap-10 animate-fade-up-delay-3">
              <FilingPill label="13F" desc="Institutional" />
              <span className="w-px h-6 sm:h-8 bg-white/15" />
              <FilingPill label="13D/G" desc="Activist" />
              <span className="w-px h-6 sm:h-8 bg-white/15" />
              <FilingPill label="Form 4" desc="Insider" />
            </div>
          </div>
        </div>
      </section>

      {/* MacBook terminal demo */}
      <section className="hidden md:block">
        <MacbookDemo />
      </section>

      {/* Trending */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-amber-500/80">
                Live
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Trending Activity
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:block font-mono bg-card border border-border px-2.5 py-1 rounded-md">
            Updated every 6h
          </span>
        </div>
        <TrendingGrid />
      </section>
    </div>
  );
}

function FilingPill({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-lg sm:text-xl font-bold text-white"
        style={{ fontFamily: "var(--font-jetbrains-mono, var(--font-mono)), monospace", fontVariantNumeric: "tabular-nums" }}
      >
        {label}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-white/40">
        {desc}
      </span>
    </div>
  );
}
