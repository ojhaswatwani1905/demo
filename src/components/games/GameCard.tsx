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
  const isAvailable = (game.isActive !== false) && (game.isEnabled !== false);

  const handlePlayGame = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAvailable) return;
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
      onClick={isAvailable ? handlePlayGame : undefined}
      className={`group relative rounded-2xl bg-[#14161F] border ${
        isAvailable
          ? "border-[#222634] hover:border-red-500/60 cursor-pointer"
          : "border-amber-500/30 opacity-75 cursor-not-allowed"
      } transition-all flex flex-col overflow-hidden shadow-md select-none`}
    >
      {/* Top Banner Artwork: preserve full artwork with proper aspect ratio and object-contain */}
      <div className="relative w-full aspect-[220/105] sm:aspect-[250/110] bg-[#0E1016] overflow-hidden block">
        <Image
          src={game.image}
          alt={game.name}
          fill
          sizes="(max-width: 640px) 210px, (max-width: 1024px) 280px, 340px"
          className={`object-contain object-center ${isAvailable ? "group-hover:scale-105" : "grayscale-[50%]"} transition-transform duration-300 p-1`}
          priority={false}
        />

        {/* Unavailable / Maintenance Banner Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2 z-10">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider shadow-lg">
              Under Maintenance
            </span>
          </div>
        )}

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
            <h3 className={`text-xs sm:text-sm font-black uppercase tracking-tight truncate ${isAvailable ? "text-white group-hover:text-red-400 transition-colors" : "text-slate-400"}`}>
              {game.name}
            </h3>
            {game.rtp && (
              <span className="text-[10px] font-mono text-[#7A8296] shrink-0 font-bold">
                RTP {game.rtp}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8E95A5]">
            <span className="text-[10px] text-[#7A8296] font-mono">{game.category}</span>
            {game.maxMultiplier ? (
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Max {game.maxMultiplier}</span>
            ) : (
              <span className="text-[10px] text-cyan-400 font-mono font-bold">{game.provider}</span>
            )}
          </div>
        </div>

        {/* Action Button: Play Demo or Disabled Maintenance */}
        {isAvailable ? (
          <button
            onClick={handlePlayGame}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-[#1C1F2B] group-hover:bg-red-600 text-white text-xs font-bold text-center border border-[#2A3042] group-hover:border-red-500 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current text-red-500 group-hover:text-white transition-colors" />
            <span>Play Demo</span>
          </button>
        ) : (
          <button
            disabled
            className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-950/20 text-amber-400/80 text-xs font-bold text-center border border-amber-500/30 flex items-center justify-center gap-2 cursor-not-allowed select-none"
          >
            <span>Unavailable</span>
          </button>
        )}
      </div>
    </div>
  );
}
