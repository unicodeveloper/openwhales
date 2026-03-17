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
export const SITE_DESCRIPTION =
  "AI-powered whale watching for Wall Street. See what hedge funds, activists, and insiders think about any stock.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://openwhales.app";
