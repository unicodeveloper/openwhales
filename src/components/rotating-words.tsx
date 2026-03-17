"use client";

import { useEffect, useState } from "react";

const WORDS = ["insider transactions", "activist intents", "whale moves", "smart money"];
const INTERVAL = 3000;

export function RotatingWords() {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % WORDS.length);
        setIsAnimating(false);
      }, 400);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-block relative">
      <span
        className={`inline-block text-amber-400 italic transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isAnimating
            ? "opacity-0 translate-y-[0.15em] blur-[2px]"
            : "opacity-100 translate-y-0 blur-0"
        }`}
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        {WORDS[index]}
      </span>
    </span>
  );
}
