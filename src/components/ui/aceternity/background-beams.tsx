"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const BackgroundBeams = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [beams, setBeams] = useState<Array<{ x: number; y: number; id: number }>>(
    []
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const beamIdRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const addBeam = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = beamIdRef.current++;

      setBeams((prev) => [...prev, { x, y, id }]);

      // Remove beam after animation
      setTimeout(() => {
        setBeams((prev) => prev.filter((beam) => beam.id !== id));
      }, 1000);
    };

    container.addEventListener("mousemove", addBeam);
    return () => container.removeEventListener("mousemove", addBeam);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden",
        className
      )}
    >
      {beams.map((beam) => (
        <div
          key={beam.id}
          className="pointer-events-none absolute h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-indigo-200/30 via-purple-200/30 to-pink-200/30"
          style={{
            left: beam.x - 192,
            top: beam.y - 192,
            animationDuration: "1s",
          }}
        />
      ))}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};
