"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { OpenWhalesIcon } from "@/components/logo";
import { useAuthStore } from "@/stores/auth-store";
import { isValyuMode } from "@/lib/app-mode";
import { SignInModal } from "@/components/auth";

export function NavBar() {
  const pathname = usePathname();
  const isTickerPage = pathname.startsWith("/ticker/");
  const isInvestorPage = pathname.startsWith("/investor/");
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

        {(isTickerPage || isInvestorPage) && (
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

          {isValyuMode() && <UserMenu />}
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
  const { user, isAuthenticated, isLoading, signOut, showSignInModal, openSignInModal, closeSignInModal } =
    useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Not authenticated — show sign-in button
  if (!isAuthenticated || !user) {
    return (
      <>
        <button
          onClick={openSignInModal}
          disabled={isLoading}
          className="inline-flex items-center h-8 px-3 rounded-lg border border-white/[0.1] bg-white/[0.06] text-[12px] font-medium text-white/70 hover:text-white hover:bg-white/[0.1] transition-colors disabled:opacity-50"
        >
          Sign in
        </button>
        <SignInModal
          open={showSignInModal}
          onOpenChange={(v) => (v ? openSignInModal() : closeSignInModal())}
        />
      </>
    );
  }

  // Authenticated — show avatar with dropdown
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
      >
        {user.picture ? (
          <Image
            src={user.picture}
            alt={user.name}
            width={24}
            height={24}
            className="rounded-md object-cover"
          />
        ) : (
          <span className="flex items-center justify-center h-6 w-6 rounded-md bg-white/[0.1] text-[11px] font-semibold text-white/80">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
        <span className="hidden sm:block text-[12px] text-white/60 max-w-[120px] truncate">
          {user.name || user.email}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 z-50">
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-lg object-cover"
                />
              ) : (
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.08] text-sm font-semibold text-white/80">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-white/90 truncate">
                  {user.name || "User"}
                </p>
                <p className="text-[11px] text-white/40 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-white/50 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
