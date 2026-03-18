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
  "AI-powered financial platform that tracks SEC filings to reveal what institutional investors, activist funds, and insiders are doing. 13F holdings, Form 4 insider trades, and 13D/G activist stakes across 177 stocks and 130+ fund managers.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://openwhales.app";
