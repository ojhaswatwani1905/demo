"use client";

import React from "react";
import { GameConfig } from "@/config/games";
import { GameCard } from "./GameCard";
import { Gamepad2 } from "lucide-react";

interface GameGridProps {
  games: GameConfig[];
  emptyMessage?: string;
}

export function GameGrid({ games, emptyMessage = "No demo games found in this category." }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="py-16 text-center bg-[#0D0D14] border border-[#20202E] rounded-2xl p-8">
        <Gamepad2 className="w-12 h-12 text-[#404055] mx-auto mb-3" />
        <h4 className="text-base font-bold text-white mb-1">No Games Found</h4>
        <p className="text-xs text-[#8E8E9E]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
