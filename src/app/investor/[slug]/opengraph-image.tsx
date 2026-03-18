import { ImageResponse } from "next/og";
import { INVESTORS } from "@/lib/investors";

export const runtime = "edge";
export const alt = "OpenWhales — Investor Analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const investor = INVESTORS.find((i) => i.slug === slug);
  const name = investor?.name ?? slug.replace(/-/g, " ");
  const fund = investor?.fund ?? "";
  const title = investor?.title ?? "";

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
        {/* Subtle emerald glow behind name */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo + brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#111" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <path
              d="M16 24c0-4 -3-7 -7-10 1.5 0 3.5 0.5 5 2.5 0-3-1-6-3-8.5 2 1.5 4.5 4.5 5 8.5 0.5-4 3-7 5-8.5-2 2.5-3 5.5-3 8.5 1.5-2 3.5-2.5 5-2.5-4 3-7 6-7 10z"
              fill="white"
            />
          </svg>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.02em",
            }}
          >
            OpenWhales
          </span>
        </div>

        {/* Investor name */}
        <span
          style={{
            fontSize: name.length > 20 ? "72px" : "88px",
            fontWeight: 900,
            color: "white",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          {name}
        </span>

        {/* Fund + title */}
        <span
          style={{
            fontSize: "22px",
            color: "rgba(255,255,255,0.4)",
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          {title}{fund ? ` · ${fund}` : ""}
        </span>

        {/* Description */}
        <span
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.25)",
            marginTop: "12px",
          }}
        >
          Portfolio holdings · Transactions · AI strategy analysis
        </span>

        {/* Filing type pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {[
            { label: "13F", desc: "Holdings" },
            { label: "Form 4", desc: "Insider" },
            { label: "13D/G", desc: "Activist" },
          ].map((pill) => (
            <div
              key={pill.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "10px 24px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {pill.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
