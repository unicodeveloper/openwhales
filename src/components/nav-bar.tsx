"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { OpenWhalesIcon } from "@/components/logo";

export function NavBar() {
  const pathname = usePathname();
  const isTickerPage = pathname.startsWith("/ticker/");
  const isHome = pathname === "/";

  return (
    <header
      className={
        isHome
          ? "fixed top-0 left-0 right-0 z-50"
          : "sticky top-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl"
      }
    >
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <OpenWhalesIcon size={28} />
          <span className="text-sm font-semibold tracking-wide hidden sm:block text-white/90">
            OpenWhales
          </span>
        </Link>

        {isTickerPage && (
          <div className="flex-1 max-w-xs sm:max-w-md min-w-0">
            <SearchBar size="default" className="w-full" />
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-md text-[11px] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            SEC filings live
          </span>
          <span className="hidden lg:inline-flex px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-md font-mono text-[10px] text-white/50">
            13F / 13D / Form 4
          </span>
        </div>
      </div>
    </header>
  );
}
