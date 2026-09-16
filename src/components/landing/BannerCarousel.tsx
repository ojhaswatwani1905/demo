"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Gamepad2, ArrowRight, Shield } from "lucide-react";

export function BannerCarousel() {
  return (
    <Link
      href="/games"
      className="relative rounded-xl sm:rounded-2xl bg-[#13151D] border border-[#232632] hover:border-red-500/60 transition-all overflow-hidden select-none block group cursor-pointer"
      title="Open Games Lobby"
    >
      {/* Background artwork: High-quality gaming/casino artwork */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/ui/games_lobby_banner.jpg"
          alt="BETADRiX Games Lobby"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-[0.75]"
        />
        {/* Subtle dark gradient overlay to ensure text contrast and maintain lobby aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D13]/95 via-[#0F1118]/75 to-transparent pointer-events-none" />
      </div>

      {/* Main Banner Content Area: Same compact dimensions, padding, and spacing */}
      <div className="relative z-10 min-h-[145px] sm:min-h-[180px] md:min-h-[220px] p-4 sm:p-6 md:p-8 flex flex-col justify-between max-w-xl">
        <div className="space-y-2 sm:space-y-3">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-mono font-bold text-red-400">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />
            <span>BETADRiX GAMES COLLECTION</span>
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-snug group-hover:text-red-400 transition-colors">
            GAMES & DEMO LOBBY
          </h2>

          {/* Description */}
          <p className="text-[11px] sm:text-xs md:text-sm text-[#C4CBD8] leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
            Browse our full catalog of authorized Turbo Games & Spribe demo titles. Simulated outcomes with virtual playground currency.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 group-hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors shadow-md">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Explore All Games</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
