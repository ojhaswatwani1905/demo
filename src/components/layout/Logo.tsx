import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center group focus:outline-none transition-opacity hover:opacity-90 ${className}`}
      aria-label="BETADRiX Demo Platform Homepage"
    >
      <div className="relative flex items-center">
        <Image
          src="/assets/ui/betadrix_logo.png"
          alt="BETADRiX"
          width={140}
          height={41}
          className={`${compact ? "h-6 w-auto" : "h-7 sm:h-8 w-auto"} object-contain`}
          priority
        />
      </div>
    </Link>
  );
}
