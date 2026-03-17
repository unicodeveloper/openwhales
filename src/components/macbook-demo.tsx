"use client";

import dynamic from "next/dynamic";
import { TerminalScreen } from "./terminal-screen";

const MacbookScroll = dynamic(
  () =>
    import("@/components/ui/macbook-scroll").then((mod) => ({
      default: mod.MacbookScroll,
    })),
  { ssr: false }
);

export function MacbookDemo() {
  return (
    <div className="overflow-hidden w-full">
      <MacbookScroll
        title={
          <span className="text-2xl sm:text-3xl font-bold tracking-tight">
            Institutional-grade SEC filing analysis
          </span>
        }
        showGradient={false}
        badge={
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/80 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] text-white/60 font-mono font-medium">
              OPENWHALE TERMINAL
            </span>
          </div>
        }
      >
        <TerminalScreen />
      </MacbookScroll>
    </div>
  );
}
