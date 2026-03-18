import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { INVESTORS } from "@/lib/investors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const investor = INVESTORS.find((i) => i.slug === slug);
  const name = investor?.name ?? slug.replace(/-/g, " ");
  const fund = investor?.fund ?? "";

  const title = `${name}${fund ? ` — ${fund}` : ""}`;
  const description = `Portfolio holdings, insider transactions, and AI-generated investment strategy analysis for ${name}${fund ? ` (${fund})` : ""}. Powered by ${SITE_NAME}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${name} | ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | ${SITE_NAME}`,
      description,
    },
  };
}

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
