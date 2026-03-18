/**
 * OAuth PKCE utilities for Valyu authentication.
 * Client-side only — generates PKCE params and initiates the OAuth flow.
 */

const VALYU_CLIENT_ID = process.env.NEXT_PUBLIC_VALYU_CLIENT_ID || "";
const VALYU_AUTH_URL = process.env.NEXT_PUBLIC_VALYU_AUTH_URL || "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || "";

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function isOAuthConfigured(): boolean {
  return Boolean(VALYU_CLIENT_ID && VALYU_AUTH_URL && REDIRECT_URI);
}

export async function initiateOAuthFlow(): Promise<void> {
  if (!isOAuthConfigured()) {
    throw new Error("OAuth is not configured. Missing client ID, auth URL, or redirect URI.");
  }

  const codeVerifier = generateRandomString(32);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);

  // Store PKCE params for callback validation
  localStorage.setItem("oauth_code_verifier", codeVerifier);
  localStorage.setItem("oauth_state", state);
  localStorage.setItem("oauth_timestamp", String(Date.now()));

  const params = new URLSearchParams({
    client_id: VALYU_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid profile email",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });

  window.location.href = `${VALYU_AUTH_URL}/auth/v1/oauth/authorize?${params.toString()}`;
}
