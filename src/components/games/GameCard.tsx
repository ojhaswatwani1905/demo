"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GameConfig } from "@/config/games";
import { Play, Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";

interface GameCardProps {
  game: GameConfig;
  compact?: boolean;
}

export function GameCard({ game, compact = false }: GameCardProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite, addRecentGame } = useFavorites();
  const { requireAuth } = useAuth();
  const favorited = isFavorite(game.id);

  const handlePlayGame = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    requireAuth(() => {
      addRecentGame(game.id);
      router.push(`/games/${game.id}`);
    });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <div
      onClick={handlePlayGame}
      className="group relative rounded-2xl bg-[#14161F] border border-[#222634] hover:border-red-500/60 transition-all flex flex-col overflow-hidden shadow-md cursor-pointer select-none"
    >
      {/* Top Banner Artwork: preserve full artwork with proper aspect ratio and object-contain */}
      <div className="relative w-full aspect-[220/105] sm:aspect-[250/110] bg-[#0E1016] overflow-hidden block">
        <Image
          src={game.image}
          alt={game.name}
          fill
          sizes="(max-width: 640px) 210px, (max-width: 1024px) 280px, 340px"
          className="object-contain object-center group-hover:scale-105 transition-transform duration-300 p-1"
          priority={false}
        />

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/70 hover:text-white transition-colors z-10 cursor-pointer"
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              favorited ? "fill-red-500 text-red-500" : "text-white/70"
            }`}
          />
        </button>

        {/* Provider Tag on artwork */}
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-black/80 text-[#8E95A5] px-1.5 py-0.5 rounded border border-white/10">
            {game.provider}
          </span>
        </div>
      </div>

      {/* Card Info & Action */}
      <div className={`flex flex-col justify-between flex-1 bg-[#14161F] border-t border-[#1E212D] ${compact ? "p-3" : "p-3 sm:p-4"}`}>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-red-400 transition-colors truncate uppercase tracking-tight">
              {game.name}
            </h3>
            <span className="text-[10px] font-mono text-[#7A8296] shrink-0 font-bold">
              RTP {game.rtp}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8E95A5]">
            <span className="text-[10px] text-[#7A8296] font-mono">{game.category}</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">Max {game.maxMultiplier}</span>
          </div>
        </div>

        {/* Clean Play Action Button */}
        <button
          onClick={handlePlayGame}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-[#1C1F2B] group-hover:bg-red-600 text-white text-xs font-bold text-center border border-[#2A3042] group-hover:border-red-500 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current text-red-500 group-hover:text-white transition-colors" />
          <span>Play Demo</span>
        </button>
      </div>
    </div>
  );
}
