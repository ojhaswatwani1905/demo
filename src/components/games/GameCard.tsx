"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GameConfig } from "@/config/games";
import { Play, Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

interface GameCardProps {
  game: GameConfig;
  compact?: boolean;
}

export function GameCard({ game, compact = false }: GameCardProps) {
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
    <div className="group relative rounded-xl bg-[#15171E] border border-[#232632] hover:border-red-500/60 transition-colors flex flex-col overflow-hidden">
      {/* Top Banner Artwork: preserve full artwork using aspect-[250/90] and object-contain */}
      <Link
        href={`/games/${game.id}`}
        onClick={handleCardClick}
        className="relative w-full aspect-[250/90] bg-[#0E1015] overflow-hidden block"
      >
        <Image
          src={game.image}
          alt={game.name}
          fill
          sizes="(max-width: 640px) 160px, (max-width: 1024px) 250px, 300px"
          className="object-contain object-center group-hover:scale-105 transition-transform duration-200"
          priority={false}
        />

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white/70 hover:text-white transition-colors z-10"
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              favorited ? "fill-red-500 text-red-500" : "text-white/70"
            }`}
          />
        </button>

        {/* Subtle demo badge */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-black/70 text-red-400 px-1.5 py-0.5 rounded border border-white/10">
            DEMO
          </span>
        </div>
      </Link>

      {/* Card Info & Action */}
      <div className={`flex flex-col justify-between flex-1 bg-[#15171E] border-t border-[#1F222C] ${compact ? "p-2.5" : "p-3 sm:p-3.5"}`}>
        <div>
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <Link
              href={`/games/${game.id}`}
              onClick={handleCardClick}
              className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate"
            >
              {game.name}
            </Link>
            <span className="text-[10px] font-mono text-[#6A7182] shrink-0">
              RTP {game.rtp}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8E95A5]">
            <span className="truncate">{game.provider}</span>
            <span className="text-[10px] text-[#6A7182] font-mono shrink-0">{game.category}</span>
          </div>
        </div>

        {/* Clean Play Action Button */}
        <Link
          href={`/games/${game.id}`}
          onClick={handleCardClick}
          className="mt-2.5 w-full py-1.5 sm:py-2 px-2.5 rounded-lg bg-[#1D202A] hover:bg-red-600 text-white text-xs font-bold text-center border border-[#2B2F3E] hover:border-red-500 transition-colors flex items-center justify-center gap-1.5"
        >
          <Play className="w-3 h-3 fill-current text-red-400 group-hover:text-white" />
          <span>Play Demo</span>
        </Link>
      </div>
    </div>
  );
}
