export const TRENDING_TICKERS = [
  "AAPL",
  "NVDA",
  "TSLA",
  "MSFT",
  "META",
  "GOOGL",
  "AMZN",
  "PLTR",
] as const;

export const SITE_NAME = "OpenWhales";
export const SITE_TITLE = "OpenWhales | Smart Money SEC Filing Intelligence";
export const SITE_DESCRIPTION =
  "Track what institutional investors, activist funds, and insiders are doing via SEC filings. 13F holdings, Form 4 trades, and AI analysis.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://openwhales.app";
