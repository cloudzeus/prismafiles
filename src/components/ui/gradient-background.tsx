"use client";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "elegant";
}

export const GradientBackground = ({
  children,
  className,
  variant = "default",
}: GradientBackgroundProps) => {
  const variants = {
    default: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
    subtle: "bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50",
    elegant: "bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50",
  };

  return (
    <div className={cn("min-h-screen", variants[variant], className)}>
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
