export interface TrendingTicker {
  symbol: string;
  topHolders: { name: string; valueUsd: number }[];
  insiderActivity: {
    netDirection: "buying" | "selling" | "mixed" | "none";
    recentCount: number;
  };
}

export interface InstitutionalHolder {
  name: string;
  shares: number;
  value: number;
  activity: "increased" | "decreased" | "new" | "closed" | "unchanged";
  changePercent: number;
  reportDate: string;
}

export interface InsiderTx {
  name: string;
  title: string;
  type: "buy" | "sell" | "gift" | "exercise" | "award" | "other";
  shares: number;
  value: number;
  pricePerShare: number;
  date: string;
}

export interface TickerData {
  symbol: string;
  holders: InstitutionalHolder[];
  insiderTransactions: InsiderTx[];
  buyCount: number;
  sellCount: number;
  totalBuyValue: number;
  totalSellValue: number;
}
