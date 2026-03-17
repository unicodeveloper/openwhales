import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          borderRadius: "6px",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 24c0-4 -3-7 -7-10 1.5 0 3.5 0.5 5 2.5 0-3-1-6-3-8.5 2 1.5 4.5 4.5 5 8.5 0.5-4 3-7 5-8.5-2 2.5-3 5.5-3 8.5 1.5-2 3.5-2.5 5-2.5-4 3-7 6-7 10z"
            fill="white"
          />
          <path
            d="M6 25.5c3-1 5.5-1.5 10-1.5s7 0.5 10 1.5"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
