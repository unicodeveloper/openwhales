import { NextResponse } from "next/server";

/** Allowed API paths the proxy can forward to — prevents SSRF */
const ALLOWED_PATHS = new Set([
  "/v1/deepsearch",
  "/v1/answer",
  "/v1/search",
]);

/** Allowed HTTP methods */
const ALLOWED_METHODS = new Set(["GET", "POST"]);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "unauthorized", message: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const body = await request.json();
    const { path, method, body: requestBody } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { error: "invalid_request", message: "Missing path parameter" },
        { status: 400 }
      );
    }

    // Validate path against allowlist to prevent SSRF
    if (!ALLOWED_PATHS.has(path)) {
      return NextResponse.json(
        { error: "invalid_request", message: "Disallowed proxy path" },
        { status: 403 }
      );
    }

    // Validate HTTP method
    const resolvedMethod = (method || "POST").toUpperCase();
    if (!ALLOWED_METHODS.has(resolvedMethod)) {
      return NextResponse.json(
        { error: "invalid_request", message: "Disallowed HTTP method" },
        { status: 403 }
      );
    }

    const appUrl = process.env.VALYU_APP_URL || "https://platform.valyu.ai";
    const proxyUrl = `${appUrl}/api/oauth/proxy`;

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        method: resolvedMethod,
        body: requestBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Proxy] Error:", response.status, errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            error: "auth_error",
            message: "Session expired. Please sign in again.",
            requiresReauth: true,
          },
          { status: 401 }
        );
      }

      // Check for credit errors
      if (response.status === 402) {
        return NextResponse.json(
          { error: "Insufficient credits", message: "Please top up credits" },
          { status: 402 }
        );
      }

      // Also check error message for credit-related errors
      const errorMsg = (errorData.error || errorData.message || "").toLowerCase();
      if (errorMsg.includes("insufficient credits") || errorMsg.includes("credit limit") || errorMsg.includes("no credits")) {
        return NextResponse.json(
          { error: "Insufficient credits", message: "Please top up credits" },
          { status: 402 }
        );
      }

      return NextResponse.json(
        { error: "proxy_error", message: "Request failed" },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Internal server error" },
      { status: 500 }
    );
  }
}