"use client";

import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  isExternal?: boolean;
  glow?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  isExternal = false,
  glow = false,
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 select-none cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5",
    md: "text-xs px-5 py-2.5 gap-2",
    lg: "text-sm px-6 py-3.5 gap-2.5",
    xl: "text-base px-8 py-4 gap-3",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#FF1E27] to-[#B30C19] text-white hover:from-[#FF3342] hover:to-[#FF1E27] active:scale-[0.98] border border-red-500/30",
    secondary:
      "bg-[#14141B] hover:bg-[#1C1C26] text-white border border-[#2A2A38] hover:border-red-500/40 active:scale-[0.98]",
    outline:
      "bg-transparent text-white border border-red-500/40 hover:border-red-500 hover:bg-red-500/10 active:scale-[0.98]",
    ghost:
      "bg-transparent text-neutral-300 hover:text-white hover:bg-white/5",
    glass:
      "bg-[#0D0D12]/80 backdrop-blur-md text-white border border-white/10 hover:border-red-500/40 hover:bg-[#14141B]",
    danger:
      "bg-red-950/60 text-red-400 border border-red-800/60 hover:bg-red-900/60"
  };

  const glowStyles = glow ? "shadow-[0_0_25px_rgba(255,30,39,0.45)] hover:shadow-[0_0_35px_rgba(255,30,39,0.65)]" : "";

  const mergedClasses = twMerge(
    clsx(baseStyles, sizeStyles[size], variantStyles[variant], glowStyles, className)
  );

  if (href) {
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={mergedClasses}
        >
          {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
          <span>{children}</span>
        </a>
      );
    }

    return (
      <Link href={href} className={mergedClasses}>
        {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button className={mergedClasses} {...props}>
      {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
