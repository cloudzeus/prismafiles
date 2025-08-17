"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

interface CardHoverEffectProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const CardHoverEffect = ({
  children,
  className,
  containerClassName,
}: CardHoverEffectProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <motion.div
      className={cn(
        "group relative h-96 w-80 cursor-pointer rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div
        className={cn(
          "relative h-full w-full rounded-xl bg-black p-6 text-white",
          className
        )}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.3), transparent 40%)`,
          }}
        />
      </div>
    </motion.div>
  );
};
