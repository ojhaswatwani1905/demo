"use client";

import React from "react";

export function PlatformTransition() {
  return (
    <div className="relative py-8 overflow-hidden bg-gradient-to-b from-[#06060A] via-[#07080C] to-[#08090D] border-t border-[#141520]">
      {/* Subtle crimson horizon line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#FF1E27]/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E0F17] border border-[#1E1F2C] text-[10px] font-mono text-[#8E8E9E] uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span>INTERACTIVE CASINO PLATFORM // LIVE SIMULATION</span>
        </div>
      </div>
    </div>
  );
}
