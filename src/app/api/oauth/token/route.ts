import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

/**
 * API route for exchanging authorization code for access token
 * This handles the PKCE token exchange
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 token exchanges per minute per IP (prevents brute-force)
    const ip = getClientIp(request);
    const rl = checkRateLimit(`oauth-token:${ip}`, { maxRequests: 10, windowSeconds: 60 });
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    const { code, codeVerifier } = await request.json();

    if (!code || !codeVerifier) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token using client_secret_basic
    const clientId = process.env.NEXT_PUBLIC_VALYU_CLIENT_ID!;
    const clientSecret = process.env.VALYU_CLIENT_SECRET!;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_VALYU_AUTH_URL}/auth/v1/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
          code_verifier: codeVerifier,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.json(
        { error: "Token exchange failed" },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get user info from Valyu platform
    const userInfoResponse = await fetch(
      `${process.env.VALYU_APP_URL}/api/oauth/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      console.error("Failed to get user info");
      return NextResponse.json(
        { error: "Failed to get user info" },
        { status: userInfoResponse.status }
      );
    }

    const userInfo = await userInfoResponse.json();

    // Return tokens and user info to client
    return NextResponse.json({
      access_token,
      refresh_token,
      expires_in,
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        email_verified: userInfo.email_verified,
      },
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}