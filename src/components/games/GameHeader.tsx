"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2, Sparkles, Heart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";
import { useFavorites } from "@/context/FavoritesContext";
import { GameConfig } from "@/config/games";

interface GameHeaderProps {
  game: GameConfig;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function GameHeader({ game, isFullscreen, onToggleFullscreen }: GameHeaderProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(game.id);

  return (
    <div className="bg-[#0B0B12] border-b border-[#1F1F2C] px-4 py-3 sm:px-6 flex items-center justify-between gap-3 shrink-0">
      {/* Left: Back button & Game Identity */}
      <div className="flex items-center gap-3">
        <Link
          href="/casino"
          className="p-2 rounded-xl bg-[#14141E] hover:bg-[#1E1E2C] border border-[#252535] text-[#8E8E9E] hover:text-white transition-colors"
          title="Back to Casino Lobby"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
              {game.name}
            </h1>
            <Badge variant="demo" size="sm">DEMO MODE</Badge>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#8E8E9E]">
            <span className="font-semibold text-[#B0B0C0]">{game.provider}</span>
            <span>•</span>
            <span className="text-red-400 font-mono">RTP {game.rtp}</span>
          </div>
        </div>
      </div>

      {/* Right: Favorites, Balance, Fullscreen */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => toggleFavorite(game.id)}
          className="p-2 rounded-xl bg-[#14141E] hover:bg-[#1E1E2C] border border-[#252535] transition-colors"
          title={favorited ? "Remove favorite" : "Add to favorites"}
        >
          <Heart
            className={`w-4 h-4 ${
              favorited ? "fill-red-500 text-red-500" : "text-[#8E8E9E] hover:text-white"
            }`}
          />
        </button>

        <div className="hidden sm:block">
          <BalanceDisplay compact />
        </div>

        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl bg-[#14141E] hover:bg-[#1E1E2C] border border-[#252535] text-[#8E8E9E] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-red-500" />
          ) : (
            <Maximize2 className="w-4 h-4 text-red-500" />
          )}
          <span className="hidden md:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
        </button>
      </div>
    </div>
  );
}
