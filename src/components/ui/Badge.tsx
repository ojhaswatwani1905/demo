import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps {
  variant?: "red" | "gold" | "green" | "neutral" | "outline" | "demo";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Badge({
  variant = "red",
  size = "sm",
  children,
  className,
  glow = false
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-black tracking-wider uppercase rounded select-none";

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 leading-none tracking-widest",
    md: "text-xs px-2.5 py-1 leading-none tracking-wider",
  };

  const variantStyles = {
    red: "bg-[#FF1E27]/15 text-[#FF3342] border border-[#FF1E27]/40",
    demo: "bg-red-600 text-white font-black tracking-widest border border-red-400/50 shadow-[0_0_10px_rgba(255,30,39,0.35)]",
    gold: "bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/40",
    green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    neutral: "bg-[#1C1C26] text-[#A0A0B2] border border-[#2A2A38]",
    outline: "bg-transparent text-[#E0E0EC] border border-white/20",
  };

  const glowStyle = glow ? "shadow-[0_0_12px_rgba(255,30,39,0.4)]" : "";

  return (
    <span
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], glowStyle, className)
      )}
    >
      {children}
    </span>
  );
}
