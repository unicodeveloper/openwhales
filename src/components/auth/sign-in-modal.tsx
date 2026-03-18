"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { OpenWhalesIcon } from "@/components/logo";
import { initiateOAuthFlow, isOAuthConfigured } from "@/lib/oauth";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValyuSignIn = async () => {
    setIsLoading(true);
    setError(null);

    if (!isOAuthConfigured()) {
      setError(
        "OAuth is not configured. Please contact the administrator or use self-hosted mode."
      );
      setIsLoading(false);
      return;
    }

    try {
      await initiateOAuthFlow();
    } catch (err) {
      console.error("OAuth initiation error:", err);
      setError("Failed to initiate sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-sm sm:mx-4">
      <DialogContent className="p-0">
        {/* Top section with logo and branding */}
        <div className="px-5 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6 text-center">
          <div className="flex justify-center mb-5">
            <OpenWhalesIcon size={44} />
          </div>
          <h2
            className="text-lg font-semibold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Sign in to OpenWhales
          </h2>
          <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
            AI-powered SEC filing analysis, 13F holdings, investor portfolio and insider signals across 170+ tickers.
          </p>
        </div>

        {/* Divider */}
        <div className="mx-5 sm:mx-6 h-px bg-border" />

       

        {/* Divider */}
        <div className="mx-5 sm:mx-6 h-px bg-border" />

        {/* Action section */}
        <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-5 sm:pb-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleValyuSignIn}
            disabled={isLoading}
            className="w-full h-12 sm:h-11 rounded-lg bg-white text-black text-sm font-medium transition-all hover:bg-white/90 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to Valyu...
              </>
            ) : (
              "Continue with Valyu"
            )}
          </button>

          <p className="mt-3.5 text-center text-[11px] text-muted-foreground">
            Free to sign up. Your Valyu credits power the searches.
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 rounded-md p-2.5 sm:p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
        >
          <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </DialogContent>
    </Dialog>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center justify-center h-6 min-w-[28px] px-1.5 rounded border border-white/[0.08] bg-white/[0.04] font-mono text-[10px] font-semibold text-amber-500 tracking-wide">
        {icon}
      </span>
      <span className="text-[13px] text-foreground/80">{text}</span>
    </div>
  );
}
