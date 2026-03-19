import { INVESTORS } from "./investors";

export interface Fund {
  name: string;
  slug: string;
  keyPeople: string[];
}

/**
 * Build a deduplicated list of funds from the INVESTORS array.
 * Groups multiple investors at the same fund together.
 */
function buildFundsList(): Fund[] {
  const fundMap = new Map<string, string[]>();

  for (const inv of INVESTORS) {
    const existing = fundMap.get(inv.fund);
    if (existing) {
      existing.push(inv.name);
    } else {
      fundMap.set(inv.fund, [inv.name]);
    }
  }

  return Array.from(fundMap.entries()).map(([name, keyPeople]) => ({
    name,
    slug: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    keyPeople,
  }));
}

export const FUNDS: Fund[] = buildFundsList();

export function findFundBySlug(slug: string): Fund | undefined {
  return FUNDS.find((f) => f.slug === slug);
}
