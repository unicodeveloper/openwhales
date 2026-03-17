"use client";

import { Streamdown } from "streamdown";
import remarkGfm from "remark-gfm";

interface NarrativeStreamProps {
  content: string;
  isStreaming: boolean;
}

export function NarrativeStream({ content, isStreaming }: NarrativeStreamProps) {
  return (
    <div className="narrative-content">
      <Streamdown
        mode={isStreaming ? "streaming" : "static"}
        isAnimating={isStreaming}
        animated
        remarkPlugins={[remarkGfm]}
        controls={false}
      >
        {content}
      </Streamdown>
    </div>
  );
}
