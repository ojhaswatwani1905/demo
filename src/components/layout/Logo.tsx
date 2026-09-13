import React from "react";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 group focus:outline-none ${className}`}
      aria-label="YOURBRAND Gaming Demo Homepage"
    >
      {/* Futuristic Angular Red Gaming Icon */}
      <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF1E27] to-[#8B000C] p-[1.5px] shadow-[0_0_18px_rgba(255,30,39,0.4)] group-hover:shadow-[0_0_26px_rgba(255,30,39,0.7)] transition-all duration-300">
        <div className="w-full h-full bg-[#09090F] rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Futuristic geometric shape */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform duration-300"
            fill="currentColor"
          >
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.5L19.5 8.7V15.3L12 19.5L4.5 15.3V8.7L12 4.5Z" opacity="0.4" />
            <path d="M12 6L6 9.5V14.5L12 18L18 14.5V9.5L12 6Z" fill="#FF1E27" />
            <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-black tracking-wider text-white uppercase group-hover:text-red-400 transition-colors font-sans">
              YOUR<span className="text-red-500">BRAND</span>
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-[#8E8E9E] -mt-1 uppercase">
            DEMO PLATFORM
          </span>
        </div>
      )}
    </Link>
  );
}
