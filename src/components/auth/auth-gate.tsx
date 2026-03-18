"use client";

import { useAuthStore } from "@/stores/auth-store";
import { isValyuMode } from "@/lib/app-mode";
import { SignInModal } from "./sign-in-modal";

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Wraps protected pages. In valyu mode, unauthenticated users see
 * a sign-in modal overlay instead of the page content.
 * In self-hosted mode, content renders immediately with no auth required.
 */
export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading, showSignInModal, openSignInModal, closeSignInModal } =
    useAuthStore();

  // Self-hosted mode: no auth needed, render everything
  if (!isValyuMode()) {
    return <>{children}</>;
  }

  // Still loading auth state from localStorage
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticated: render the page
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated: show a teaser with sign-in prompt
  return (
    <>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sign in to access analysis
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get AI-powered SEC filing analysis, institutional holdings data, and insider trading insights. Sign in with your Valyu account to continue.
            </p>
          </div>
          <button
            onClick={openSignInModal}
            className="inline-flex items-center justify-center h-12 sm:h-11 px-8 sm:px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:translate-y-px transition-all w-full sm:w-auto"
          >
            Sign in to continue
          </button>
          <p className="text-xs text-muted-foreground">
            Free to sign up. Your Valyu credits are used for searches.
          </p>
        </div>
      </div>

      <SignInModal
        open={showSignInModal}
        onOpenChange={(open) => (open ? openSignInModal() : closeSignInModal())}
      />
    </>
  );
}
