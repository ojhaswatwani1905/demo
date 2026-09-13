"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GameConfig } from "@/config/games";
import { Badge } from "@/components/ui/Badge";
import { Play, Heart, Flame } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

interface GameCardProps {
  game: GameConfig;
  variant?: "standard" | "compact" | "featured";
}

export function GameCard({ game, variant = "standard" }: GameCardProps) {
  const { isFavorite, toggleFavorite, addRecentGame } = useFavorites();
  const favorited = isFavorite(game.id);

  const handleCardClick = () => {
    addRecentGame(game.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <div className="group relative rounded-2xl bg-[#0D0D14] border border-[#20202E] hover:border-red-500/70 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,30,39,0.35)] overflow-hidden flex flex-col">
      {/* Red ambient glow overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Top action badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
        <Badge variant="demo" size="sm">DEMO</Badge>
        <button
          onClick={handleFavoriteClick}
          className="pointer-events-auto p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:border-red-500/60 text-white transition-transform active:scale-90"
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              favorited ? "fill-red-500 text-red-500" : "text-white/80 hover:text-white"
            }`}
          />
        </button>
      </div>

      {/* Artwork container */}
      <Link
        href={`/games/${game.id}`}
        onClick={handleCardClick}
        className="relative w-full aspect-[250/90] bg-[#07070B] overflow-hidden block"
      >
        <Image
          src={game.image}
          alt={game.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Hover Quick-Play Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,30,39,0.8)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Game Details Footer */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 relative z-20 bg-[#0D0D14] border-t border-[#1C1C28]">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide group-hover:text-red-400 transition-colors truncate">
              {game.name}
            </h3>
            <span className="text-[10px] font-mono text-[#8E8E9E] shrink-0 font-semibold">
              RTP {game.rtp}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8E8E9E]">
            <span className="text-[#A0A0B2] font-semibold">{game.provider}</span>
            <span className="text-red-400 text-[11px] font-bold">{game.category}</span>
          </div>
        </div>

        {/* Play Action Button */}
        <Link
          href={`/games/${game.id}`}
          onClick={handleCardClick}
          className="mt-3.5 w-full py-2 px-3 rounded-lg bg-[#181824] hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 text-white text-xs font-black uppercase tracking-wider text-center border border-[#2A2A3E] hover:border-red-500 transition-all flex items-center justify-center gap-1.5 shadow-sm group/btn"
        >
          <Play className="w-3 h-3 fill-current text-red-500 group-hover/btn:text-white transition-colors" />
          <span>Play Demo</span>
        </Link>
      </div>
    </div>
  );
}
