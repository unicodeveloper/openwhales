import { Badge } from "@/components/ui/badge";

interface TickerHeaderProps {
  symbol: string;
  isStreaming?: boolean;
}

export function TickerHeader({ symbol, isStreaming }: TickerHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold tracking-tight">${symbol}</h1>
      {isStreaming && (
        <Badge variant="secondary" className="animate-pulse">
          Analyzing...
        </Badge>
      )}
    </div>
  );
}
