"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";
import { useFavorites } from "@/context/FavoritesContext";
import { Search, ShieldCheck, Gamepad2 } from "lucide-react";

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void } = {}) {
  const pathname = usePathname();
  const { setIsSearchOpen } = useFavorites();

  return (
    <>
      {/* 1. MOBILE TOP BAR: Minimalist, ONLY the small logo with minimal surrounding space */}
      <div className="lg:hidden w-full py-2 px-4 bg-[#0B0C10] border-b border-[#181A22] flex items-center justify-between shrink-0">
        <Logo compact />
        {/* Compact Mobile Top-Bar GAMES Button */}
        <Link
          href="/games"
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#14161F] border border-[#262B3B] hover:border-red-500/50 transition-all group shrink-0"
          title="Open Games Lobby"
        >
          <div className="relative w-8 h-[18px] rounded overflow-hidden bg-black border border-white/10 shrink-0">
            <Image
              src="/assets/ui/nav_games_badge.jpg"
              alt="Games Lobby"
              fill
              sizes="32px"
              className="object-cover object-center"
            />
          </div>
          <span className="text-[11px] font-black tracking-wider text-white uppercase group-hover:text-red-400 transition-colors">
            GAMES
          </span>
          <Gamepad2 className="w-3 h-3 text-red-500" />
        </Link>
      </div>

      {/* 2. DESKTOP HEADER: Fixed height h-14, clean lobby controls */}
      <header className="hidden lg:flex sticky top-0 z-30 w-full h-14 bg-[#101217] border-b border-[#232632] px-6 items-center justify-between gap-4 shrink-0">
        {/* Left side: Compact GAMES Button & Quick Links */}
        <div className="flex items-center gap-3">
          {/* Compact GAMES button with recognizable 16:9 gaming badge */}
          <Link
            href="/games"
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all group shrink-0 ${
              pathname === "/games" || pathname.startsWith("/games/")
                ? "bg-[#181A24] border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                : "bg-[#14161F] hover:bg-[#1C202D] border-[#262B3B] hover:border-red-500/50"
            }`}
            title="Open Games Lobby"
          >
            <div className="relative w-9 h-[22px] rounded overflow-hidden bg-black border border-white/10 shrink-0 shadow-sm">
              <Image
                src="/assets/ui/nav_games_badge.jpg"
                alt="Games Lobby"
                fill
                priority
                sizes="36px"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xs font-black tracking-wider text-white uppercase group-hover:text-red-400 transition-colors">
              GAMES
            </span>
            <Gamepad2 className="w-3.5 h-3.5 text-red-500 group-hover:rotate-12 transition-transform" />
          </Link>

          <div className="hidden xl:block h-4 w-px bg-[#232632]" />

          {/* Quick Navigation Links */}
          <div className="hidden xl:flex items-center gap-1 text-xs font-semibold text-[#8E95A5]">
            <Link
              href="/"
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                pathname === "/" ? "text-white bg-[#1A1D26]" : "hover:text-white hover:bg-[#181B24]"
              }`}
            >
              Lobby
            </Link>
            <Link
              href="/promotions"
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                pathname === "/promotions" ? "text-white bg-[#1A1D26]" : "hover:text-white hover:bg-[#181B24]"
              }`}
            >
              Promotions
            </Link>
            <Link
              href="/vip"
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                pathname === "/vip" ? "text-white bg-[#1A1D26]" : "hover:text-white hover:bg-[#181B24]"
              }`}
            >
              VIP
            </Link>
            <Link
              href="/bonus"
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                pathname === "/bonus" ? "text-white bg-[#1A1D26]" : "hover:text-white hover:bg-[#181B24]"
              }`}
            >
              Bonus
            </Link>
            <Link
              href="/fair"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors ${
                pathname === "/fair" ? "text-white bg-[#1A1D26]" : "hover:text-white hover:bg-[#181B24]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span>Fairness & Integrity</span>
            </Link>
          </div>
        </div>

        {/* Right side: Search, Demo Balance, Sign In / Sign Up */}
        <div className="flex items-center gap-3">
          {/* Quick Search trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161820] border border-[#262A38] text-[#8E95A5] hover:text-white hover:border-[#3A3F52] transition-colors text-xs cursor-pointer"
            title="Search demo games (Ctrl+K / Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-red-500" />
            <span className="font-medium">Search</span>
            <kbd className="text-[10px] font-mono bg-[#1E222D] text-[#7A8296] px-1.5 py-0.5 rounded border border-[#2D3344]">
              ⌘K
            </kbd>
          </button>

          {/* Demo Balance display with Top Up modal */}
          <BalanceDisplay />

          {/* Auth links for quick access */}
          <Link
            href="/sign-in"
            className="px-2.5 py-1.5 rounded-lg bg-[#161820] hover:bg-[#1E212B] border border-[#262A38] text-[#8E95A5] hover:text-white transition-colors text-xs font-semibold"
          >
            Sign In
          </Link>
        </div>
      </header>
    </>
  );
}

export { Navbar };
