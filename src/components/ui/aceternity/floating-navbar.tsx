"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

interface FloatingNavbarProps {
  items: Array<{
    name: string;
    href: string;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export const FloatingNavbar = ({ items, className }: FloatingNavbarProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <motion.nav
      className={cn(
        "fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-black/20 backdrop-blur-md",
        className
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-1 p-2">
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={item.href}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white transition-colors hover:text-white/80",
                activeIndex === index
                  ? "bg-white/20 text-white"
                  : "text-white/60"
              )}
              onClick={() => setActiveIndex(index)}
            >
              {item.icon || item.name.charAt(0)}
              {activeIndex === index && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/20"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
};
