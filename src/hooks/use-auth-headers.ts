"use client";

import { useAuthStore } from "@/stores/auth-store";

/**
 * Returns headers object with Authorization bearer token if user is authenticated.
 * API routes use this to determine whether to use the user's Valyu credits
 * or the server's VALYU_API_KEY (self-hosted mode).
 */
export function useAuthHeaders(): Record<string, string> {
  const getAccessToken = useAuthStore((state) => state.getAccessToken);
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
