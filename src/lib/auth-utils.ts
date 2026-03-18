import { NextRequest } from "next/server";
import { isSelfHostedMode } from "./app-mode";

const VALYU_API_KEY = process.env.VALYU_API_KEY || "";

interface AuthContext {
  /** Whether the request is authorized */
  authorized: boolean;
  /** Server API key — used for SDK calls in self-hosted mode */
  apiKey?: string;
  /** User's OAuth Bearer token — used for proxy calls in valyu mode (bills user credits) */
  bearerToken?: string;
}

/**
 * Resolves the auth context for a request.
 *
 * - Self-hosted mode: uses the server VALYU_API_KEY directly. No user auth required.
 * - Valyu mode: requires a Bearer token. The token is used to route Valyu API calls
 *   through the OAuth proxy, which bills the user's own Valyu credits.
 */
export function resolveAuth(request: NextRequest): AuthContext {
  if (isSelfHostedMode()) {
    return {
      authorized: Boolean(VALYU_API_KEY),
      apiKey: VALYU_API_KEY,
    };
  }

  // Valyu mode: require authenticated user
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { authorized: false };
  }

  return {
    authorized: true,
    bearerToken: authHeader.slice(7),
  };
}
