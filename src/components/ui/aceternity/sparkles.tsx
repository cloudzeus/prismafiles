"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SparklesProps {
  children: React.ReactNode;
  className?: string;
  sparklesCount?: number;
}

export const Sparkles = ({
  children,
  className,
  sparklesCount = 20,
}: SparklesProps) => {
  const [sparkles, setSparkles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const newSparkles = Array.from({ length: sparklesCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      size: Math.random() * 3 + 1,
    }));
    setSparkles(newSparkles);
  }, [sparklesCount]);

  return (
    <div className={cn("relative inline-block", className)}>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-ping"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: "1s",
          }}
        >
          <div
            className="h-1 w-1 rounded-full bg-yellow-400"
            style={{
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
            }}
          />
        </div>
      ))}
      {children}
    </div>
  );
};
