import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OpenWhales — AI-powered SEC filing analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#000",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle top gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "300px",
            background: "linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 100%)",
          }}
        />

        {/* Logo whale tail */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect width="32" height="32" rx="6" fill="#111" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <path
              d="M16 24c0-4 -3-7 -7-10 1.5 0 3.5 0.5 5 2.5 0-3-1-6-3-8.5 2 1.5 4.5 4.5 5 8.5 0.5-4 3-7 5-8.5-2 2.5-3 5.5-3 8.5 1.5-2 3.5-2.5 5-2.5-4 3-7 6-7 10z"
              fill="white"
            />
          </svg>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.02em",
            }}
          >
            OpenWhales
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Follow the
          </span>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#f59e0b",
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            smart money
          </span>
        </div>

        {/* Subhead */}
        <span
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.4)",
            marginTop: "24px",
            letterSpacing: "0.01em",
          }}
        >
          Institutional holdings · Activist positions · Insider transactions
        </span>

        {/* Filing pills */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          {["13F", "13D/G", "Form 4"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                fontSize: "16px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.05em",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
