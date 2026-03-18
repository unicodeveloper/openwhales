import { tool } from "ai";
import { z } from "zod";
import {
  secSearch as sdkSecSearch,
  financeSearch as sdkFinanceSearch,
  economicsSearch as sdkEconomicsSearch,
  companyResearch as sdkCompanyResearch,
} from "@valyu/ai-sdk";
import type { ValyuResponseLength } from "@valyu/ai-sdk";

function getValyuAppUrl() {
  const url = process.env.VALYU_APP_URL || "";
  return url;
}


/**
 * Calls Valyu's deepsearch API through the OAuth proxy, billing the user's credits.
 */
async function proxyDeepsearch(
  bearerToken: string,
  body: Record<string, unknown>
) {
  const proxyUrl = `${getValyuAppUrl()}/api/oauth/proxy`;

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      path: "/v1/deepsearch",
      method: "POST",
      body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Valyu proxy error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Calls Valyu's answer API through the OAuth proxy, billing the user's credits.
 */
async function proxyAnswer(
  bearerToken: string,
  body: Record<string, unknown>
) {
  const response = await fetch(`${getValyuAppUrl()}/api/oauth/proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      path: "/v1/answer",
      method: "POST",
      body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Valyu proxy error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

interface ToolConfig {
  /** User's OAuth Bearer token — if present, routes through proxy (user credits) */
  bearerToken?: string;
  /** Server API key — used in self-hosted mode */
  apiKey?: string;
  maxNumResults?: number;
  responseLength?: ValyuResponseLength;
}

/**
 * Returns a secSearch tool that routes through the user's proxy when authenticated,
 * or uses the SDK directly with the server API key in self-hosted mode.
 */
export function secSearch(config: ToolConfig = {}) {
  const { bearerToken, apiKey, maxNumResults = 10, responseLength = "large" } = config;

  if (!bearerToken) {
    return sdkSecSearch({ apiKey, maxNumResults, responseLength });
  }

  return tool({
    description:
      "Search SEC filings (10-K, 10-Q, 8-K, 13F-HR, Schedule 13D, Schedule 13G) and insider transactions (Form 4 structured data). Use simple natural language with company name and filing type.",
    inputSchema: z.object({
      query: z.string().min(1).max(500),
    }),
    execute: async ({ query }) => {
      return proxyDeepsearch(bearerToken, {
        query,
        search_type: "proprietary",
        max_num_results: maxNumResults,
        response_length: responseLength,
        included_sources: [
          "valyu/valyu-sec-filings",
          "valyu/valyu-insider-transactions-US",
        ],
      });
    },
  });
}

/**
 * Returns a financeSearch tool that routes through the user's proxy when authenticated.
 */
export function financeSearch(config: ToolConfig = {}) {
  const { bearerToken, apiKey, maxNumResults = 8, responseLength = "large" } = config;

  if (!bearerToken) {
    return sdkFinanceSearch({ apiKey, maxNumResults, responseLength });
  }

  return tool({
    description:
      "Search financial data: stock prices, earnings, balance sheets, income statements, cash flows, SEC filings, dividends, insider transactions, crypto, forex, and economic indicators.",
    inputSchema: z.object({
      query: z.string().min(1).max(500),
    }),
    execute: async ({ query }) => {
      return proxyDeepsearch(bearerToken, {
        query,
        search_type: "proprietary",
        max_num_results: maxNumResults,
        response_length: responseLength,
        included_sources: [
          "valyu/valyu-stocks",
          "valyu/valyu-sec-filings",
          "valyu/valyu-earnings-US",
          "valyu/valyu-balance-sheet-US",
          "valyu/valyu-income-statement-US",
          "valyu/valyu-cash-flow-US",
          "valyu/valyu-dividends-US",
          "valyu/valyu-insider-transactions-US",
          "valyu/valyu-market-movers-US",
          "valyu/valyu-crypto",
          "valyu/valyu-forex",
          "valyu/valyu-bls",
          "valyu/valyu-fred",
          "valyu/valyu-world-bank",
        ],
      });
    },
  });
}

/**
 * Returns an economicsSearch tool that routes through the user's proxy when authenticated.
 */
export function economicsSearch(config: ToolConfig = {}) {
  const { bearerToken, apiKey, maxNumResults = 8, responseLength = "medium" } = config;

  if (!bearerToken) {
    return sdkEconomicsSearch({ apiKey, maxNumResults, responseLength });
  }

  return tool({
    description:
      "Search economic data from BLS, FRED, World Bank. The API handles natural language - no need for series IDs or technical codes.",
    inputSchema: z.object({
      query: z.string().min(1).max(500),
    }),
    execute: async ({ query }) => {
      return proxyDeepsearch(bearerToken, {
        query,
        search_type: "proprietary",
        max_num_results: maxNumResults,
        response_length: responseLength,
        included_sources: [
          "valyu/valyu-bls",
          "valyu/valyu-fred",
          "valyu/valyu-world-bank",
          "valyu/valyu-worldbank-indicators",
          "valyu/valyu-usaspending",
        ],
      });
    },
  });
}

/**
 * Returns a companyResearch tool that routes through the user's proxy when authenticated.
 */
export function companyResearch(config: { bearerToken?: string; apiKey?: string } = {}) {
  const { bearerToken, apiKey } = config;

  if (!bearerToken) {
    return sdkCompanyResearch({ apiKey });
  }

  const sectionTitles: Record<string, string> = {
    summary: "Business Overview",
    leadership: "Leadership & Key People",
    products: "Products & Services",
    news: "Recent News & Developments",
    funding: "Funding & Investment",
    competitors: "Competitive Landscape",
    filings: "SEC Filings Summary",
    financials: "Financial Metrics & Stock Performance",
    insiders: "Insider Trading Activity",
  };

  const sectionQueries: Record<string, { query: (company: string) => string; options?: Record<string, unknown> }> = {
    summary: { query: (c) => `Provide a comprehensive business overview of ${c}. Include: company description, industry, headquarters location, founding year, key products/services, and market position.`, options: { search_type: "all" } },
    leadership: { query: (c) => `Who are the key leaders and executives at ${c}? Include CEO, founders, C-suite executives, and board members.`, options: { search_type: "all" } },
    products: { query: (c) => `What are the main products and services offered by ${c}?`, options: { search_type: "all" } },
    news: { query: (c) => `What are the most significant recent news about ${c} in the last 30 days?`, options: { search_type: "all", start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] } },
    funding: { query: (c) => `What is the funding history of ${c}? Include funding rounds, investors, total capital raised.`, options: { search_type: "all" } },
    competitors: { query: (c) => `Who are the main competitors of ${c}?`, options: { search_type: "all" } },
    filings: { query: (c) => `Summarize key points from ${c}'s most recent SEC filings (10-K, 10-Q).`, options: { search_type: "proprietary", included_sources: ["valyu/valyu-sec-filings"] } },
    financials: { query: (c) => `Provide current financial metrics for ${c}: stock price, market cap, revenue, earnings, P/E ratio.`, options: { search_type: "all" } },
    insiders: { query: (c) => `Summarize recent insider trading activity for ${c} in the last 90 days.`, options: { search_type: "proprietary", included_sources: ["valyu/valyu-insider-transactions-US"] } },
  };

  return tool({
    description:
      "Comprehensive company intelligence report. Gathers business overview, leadership, financials, news, SEC filings, funding, competitors, products, and insider activity.",
    inputSchema: z.object({
      company: z.string().min(1),
      sections: z
        .array(z.enum(["summary", "leadership", "products", "funding", "competitors", "filings", "financials", "news", "insiders"]))
        .optional(),
    }),
    execute: async ({ company, sections }) => {
      const selected = sections || Object.keys(sectionQueries);
      const requests = selected.map(async (section) => {
        const def = sectionQueries[section];
        if (!def) return null;
        try {
          const result = await proxyAnswer(bearerToken, {
            query: def.query(company),
            data_max_price: 100,
            ...def.options,
          });
          return { section, result };
        } catch {
          return null;
        }
      });

      const results = await Promise.allSettled(requests);
      let report = `# Company Research Report: ${company}\n\n`;
      const allSources: Array<{ url: string; title?: string; date?: string }> = [];

      for (const r of results) {
        if (r.status === "fulfilled" && r.value) {
          const { section, result } = r.value;
          if (result.success && result.contents) {
            report += `## ${sectionTitles[section] || section}\n\n${result.contents}\n\n`;
            if (result.search_results) allSources.push(...result.search_results);
          }
        }
      }

      if (allSources.length > 0) {
        report += `## Sources & Citations\n\n`;
        const unique = Array.from(new Map(allSources.map((s) => [s.url, s])).values());
        unique.forEach((s, i) => {
          report += `${i + 1}. [${s.title || "Source"}](${s.url})${s.date ? ` - ${s.date}` : ""}\n`;
        });
      }

      return { company, report, sections: selected, sources: allSources };
    },
  });
}
