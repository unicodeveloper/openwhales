"use client";

/**
 * Bloomberg-style terminal screen shown inside the MacBook scroll component.
 * Static mock data — purely visual, no API calls.
 */
export function TerminalScreen() {
  return (
    <div className="h-full w-full bg-[#050505] text-[#d0d0d0] font-mono text-[10px] leading-[14px] p-3 overflow-hidden select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-[11px]">OPENWHALE</span>
          <span className="text-white/20">|</span>
          <span className="text-white/90">AAPL</span>
          <span className="text-white/40">Apple Inc.</span>
        </div>
        <div className="flex items-center gap-3 text-white/30">
          <span>13F</span>
          <span>13D</span>
          <span>F4</span>
          <span className="text-amber-500">LIVE</span>
        </div>
      </div>

      {/* Two column layout */}
      <div className="flex gap-3 h-full">
        {/* Left: Holdings */}
        <div className="flex-1">
          <div className="text-amber-500 font-bold mb-1 text-[9px] uppercase tracking-wider">
            Top Institutional Holders
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[#555] text-[8px] uppercase">
                <th className="text-left pb-0.5">#</th>
                <th className="text-left pb-0.5">Fund</th>
                <th className="text-right pb-0.5">Shares</th>
                <th className="text-right pb-0.5">Value</th>
                <th className="text-right pb-0.5">Chg</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  <td className="py-0.5 text-[#444]">{i + 1}</td>
                  <td className="py-0.5 text-[#ccc] truncate max-w-[120px]">{h.name}</td>
                  <td className="py-0.5 text-right text-[#999]">{h.shares}</td>
                  <td className="py-0.5 text-right text-amber-300">{h.value}</td>
                  <td className={`py-0.5 text-right ${h.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                    {h.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Buy/Sell bar */}
          <div className="mt-3">
            <div className="text-amber-500 font-bold mb-1 text-[9px] uppercase tracking-wider">
              Insider Flow
            </div>
            <div className="flex gap-0.5 h-2.5 rounded overflow-hidden">
              <div className="bg-green-500 w-[15%]" />
              <div className="bg-red-500 w-[85%]" />
            </div>
            <div className="flex justify-between mt-0.5 text-[8px]">
              <span className="text-green-400">BUY $33.4M</span>
              <span className="text-red-400">SELL $190.2M</span>
            </div>
          </div>
        </div>

        {/* Right: Insider activity */}
        <div className="w-[45%] border-l border-white/[0.06] pl-3">
          <div className="text-violet-400 font-bold mb-1 text-[9px] uppercase tracking-wider">
            Recent Insider Activity
          </div>
          {insiders.map((tx, i) => (
            <div key={i} className="flex items-start gap-1.5 py-1 border-b border-white/[0.04]">
              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${tx.type === "SELL" ? "bg-red-500" : tx.type === "BUY" ? "bg-green-500" : "bg-purple-500"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between">
                  <span className="text-[#ccc] truncate">{tx.name}</span>
                  <span className={tx.type === "SELL" ? "text-red-400" : tx.type === "BUY" ? "text-green-400" : "text-purple-400"}>
                    {tx.amount}
                  </span>
                </div>
                <div className="text-[8px] text-[#555]">
                  {tx.title} &middot; {tx.type} &middot; {tx.date}
                </div>
              </div>
            </div>
          ))}

          {/* AI Narrative preview */}
          <div className="mt-2 pt-2 border-t border-white/[0.06]">
            <div className="text-blue-400 font-bold mb-1 text-[9px] uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              AI Narrative
            </div>
            <p className="text-[8px] text-[#777] leading-[11px]">
              Recent 13F filings show Vanguard increased its AAPL position by +2.59% to 258.9M shares worth $116.4B. Net insider flow is heavily sell-weighted at -$156.8M, driven by Tim Cook and Katherine Adams exercising and selling...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const holdings = [
  { name: "VANGUARD GROUP INC", shares: "258.9M", value: "$116.4B", change: "+2.59%" },
  { name: "BLACKROCK INC", shares: "155.2M", value: "$69.8B", change: "+1.12%" },
  { name: "BERKSHIRE HATHAWAY", shares: "120.0M", value: "$54.0B", change: "-0.45%" },
  { name: "STATE STREET CORP", shares: "98.7M", value: "$44.4B", change: "+0.78%" },
  { name: "FMR LLC", shares: "87.3M", value: "$39.3B", change: "+3.21%" },
  { name: "GEODE CAPITAL", shares: "56.1M", value: "$25.2B", change: "+1.89%" },
  { name: "JPMORGAN CHASE", shares: "48.5M", value: "$21.8B", change: "-1.34%" },
  { name: "MORGAN STANLEY", shares: "42.8M", value: "$19.3B", change: "+4.56%" },
];

const insiders = [
  { name: "COOK TIMOTHY D", title: "CEO", type: "SELL", amount: "-$33.4M", date: "2025-10-02" },
  { name: "ADAMS KATHERINE L", title: "GC", type: "SELL", amount: "-$12.1M", date: "2025-10-02" },
  { name: "LEVINSON ARTHUR D", title: "Director", type: "GIFT", amount: "$0", date: "2026-02-26" },
  { name: "O'BRIEN DEIRDRE", title: "SVP", type: "SELL", amount: "-$11.1M", date: "2025-10-02" },
  { name: "PAREKH KEVAN", title: "CFO", type: "SELL", amount: "-$1.0M", date: "2025-10-16" },
  { name: "KONDO CHRISTOPHER", title: "Officer", type: "SELL", amount: "-$1.0M", date: "2025-11-07" },
];
