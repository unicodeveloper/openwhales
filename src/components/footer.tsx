import { OpenWhalesIcon } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <OpenWhalesIcon size={20} />
          <span className="text-xs font-semibold tracking-wide">
            OpenWhales
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
          Analyzes public SEC filings (13F, 13D/G, Form 4) using AI. Not financial advice. Data may be delayed.
        </p>
      </div>
    </footer>
  );
}
