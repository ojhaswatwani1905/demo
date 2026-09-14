"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";
import { useFavorites } from "@/context/FavoritesContext";
import { Search, Settings, ShieldCheck } from "lucide-react";

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void } = {}) {
  const pathname = usePathname();
  const { setIsSearchOpen } = useFavorites();

  return (
    <>
      {/* 1. MOBILE TOP BAR: Minimalist, ONLY the small logo with minimal surrounding space */}
      <div className="lg:hidden w-full py-2 px-4 bg-[#0B0C10] border-b border-[#181A22] flex items-center justify-start shrink-0">
        <Logo compact />
      </div>

      {/* 2. DESKTOP HEADER: Fixed height h-14, clean lobby controls */}
      <header className="hidden lg:flex sticky top-0 z-30 w-full h-14 bg-[#101217] border-b border-[#232632] px-6 items-center justify-between gap-4 shrink-0">
        {/* Left side: Quick Links */}
        <div className="flex items-center gap-1 text-xs font-semibold text-[#8E95A5]">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              pathname === "/" ? "text-white bg-[#1A1D26]" : "hover:text-white hover:bg-[#181B24]"
            }`}
          >
            Lobby
          </Link>
          <Link
            href="/games"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              pathname === "/games" ? "text-white bg-[#1A1D26]" : "hover:text-white hover:bg-[#181B24]"
            }`}
          >
            All Games
          </Link>
          <Link
            href="/#promotions"
            className="px-3 py-1.5 rounded-md transition-colors hover:text-white hover:bg-[#181B24]"
          >
            Promotions
          </Link>
          <Link
            href="/fair"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
              pathname === "/fair" ? "text-white bg-[#1A1D26]" : "hover:text-white hover:bg-[#181B24]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>Provably Fair</span>
          </Link>
        </div>

        {/* Right side: Search, Demo Balance, Admin */}
        <div className="flex items-center gap-3">
          {/* Quick Search trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161820] border border-[#262A38] text-[#8E95A5] hover:text-white hover:border-[#3A3F52] transition-colors text-xs"
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

          {/* Spyke Admin shortcut */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161820] border border-[#262A38] text-[#8E95A5] hover:text-white hover:border-red-500/50 transition-colors text-xs font-semibold"
            title="Admin Configuration"
          >
            <Settings className="w-3.5 h-3.5 text-red-400" />
            <span>Admin</span>
          </Link>
        </div>
      </header>
    </>
  );
}
