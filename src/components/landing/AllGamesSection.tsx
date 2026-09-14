"use client";

import React, { useState, useMemo } from "react";
import { GameCard } from "@/components/games/GameCard";
import { GAMES, CATEGORIES } from "@/config/games";
import { LayoutGrid, Search, Layers, Dice5, Flame } from "lucide-react";

export function AllGamesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      if (selectedCategory !== "All") {
        if (selectedCategory === "Originals" && game.category !== "Originals") return false;
        if (selectedCategory === "Table" && game.category !== "Table") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = game.name.toLowerCase().includes(q);
        const matchesProvider = game.provider.toLowerCase().includes(q);
        return matchesName || matchesProvider;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="all-games" className="space-y-4 pt-2">
      {/* Section Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#1F222C]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-red-600/10 text-red-500">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
            All Games
          </h2>
          <span className="text-[11px] font-mono text-[#6A7182]">
            ({filteredGames.length})
          </span>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tabs */}
          <div className="flex items-center bg-[#13151D] p-1 rounded-lg border border-[#232632]">
            {["All", "Originals", "Table"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#202431] text-white"
                    : "text-[#8E95A5] hover:text-white"
                }`}
              >
                {cat === "Table" ? "Table Games" : cat}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6A7182] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-32 sm:w-40 pl-8 pr-3 py-1 rounded-lg bg-[#13151D] border border-[#232632] text-xs text-white placeholder-[#5A6072] focus:outline-none focus:border-red-500/60"
            />
          </div>
        </div>
      </div>

      {/* Content:
          - On Mobile: horizontal swipe slider showing roughly 2–2.5 cards at once!
          - On Desktop: clean responsive grid showing multiple games together!
      */}
      {filteredGames.length > 0 ? (
        <>
          {/* Mobile Horizontal Swipe Slider */}
          <div className="md:hidden">
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none pb-2 pt-0.5 px-0.5 snap-x snap-mandatory touch-pan-x">
              {filteredGames.map(game => (
                <div
                  key={game.id}
                  className="w-[140px] sm:w-[155px] shrink-0 snap-start"
                >
                  <GameCard game={game} compact />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Responsive Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center bg-[#13151D] rounded-xl border border-[#232632] p-6">
          <p className="text-sm font-semibold text-white">No games match your search</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="mt-2 text-xs text-red-400 hover:underline font-medium"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
