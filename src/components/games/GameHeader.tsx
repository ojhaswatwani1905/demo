"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Maximize2, Minimize2, Heart, ExternalLink } from "lucide-react";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";
import { useFavorites } from "@/context/FavoritesContext";
import { GameConfig } from "@/config/games";

interface GameHeaderProps {
  game: GameConfig;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  demoUrl?: string;
}

export function GameHeader({ game, isFullscreen, onToggleFullscreen, demoUrl }: GameHeaderProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(game.id);

  return (
    <header className="bg-[#090A10] border-b border-[#1A1B28] px-4 py-2.5 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30">
      {/* Left: BETADRiX Official Logo */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" title="BETADRiX Home">
          <Image
            src="/assets/ui/betadrix_logo.png"
            alt="BETADRiX"
            width={130}
            height={38}
            className="h-7 sm:h-8 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Right: Controls & Back to Lobby */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <BalanceDisplay compact />
        </div>

        <button
          onClick={() => toggleFavorite(game.id)}
          className="p-2 rounded-xl bg-[#12131D] hover:bg-[#1A1C28] border border-[#202232] transition-colors"
          title={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-4 h-4 ${
              favorited ? "fill-red-500 text-red-500" : "text-[#8E8E9E] hover:text-white"
            }`}
          />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl bg-[#12131D] hover:bg-[#1A1C28] border border-[#202232] text-[#8E8E9E] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-red-500" />
          ) : (
            <Maximize2 className="w-4 h-4 text-red-500" />
          )}
          <span className="hidden md:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
        </button>

        <Link
          href="/casino"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151622] hover:bg-[#1F2030] border border-[#262838] text-xs font-bold text-neutral-300 hover:text-white transition-colors"
          title="Back to Casino Lobby"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-red-500" />
          <span className="hidden sm:inline">Back to Lobby</span>
          <span className="sm:hidden">Lobby</span>
        </Link>
      </div>
    </header>
  );
}
