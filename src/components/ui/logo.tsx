"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
  const sizes = {
    sm: { logo: 24, text: "text-sm" },
    md: { logo: 32, text: "text-lg" },
    lg: { logo: 40, text: "text-xl" },
    xl: { logo: 48, text: "text-2xl" },
  };

  const { logo, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Image
          src="/logo.svg"
          alt="G-FILES Logo"
          width={logo}
          height={logo}
          className="drop-shadow-sm"
        />
      </div>
      {showText && (
        <span className={cn("font-bold text-gray-900", text)}>
          G-FILES
        </span>
      )}
    </div>
  );
};
