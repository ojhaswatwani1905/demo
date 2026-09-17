"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { GameCard } from "@/components/games/GameCard";
import { ProviderMarquee } from "@/components/landing/ProviderMarquee";
import { GAMES } from "@/config/games";
import { useFavorites } from "@/context/FavoritesContext";
import { Search, Heart, Gamepad2, Layers, Dice5, Flame } from "lucide-react";

export default function GamesLobbyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { favorites } = useFavorites();

  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      if (selectedCategory !== "All") {
        if (selectedCategory === "Originals" && game.category !== "Originals") return false;
        if (selectedCategory === "Table" && game.category !== "Table") return false;
      }
      if (filterFavoritesOnly && !favorites.includes(game.id)) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = game.name.toLowerCase().includes(q);
        const matchesCategory = game.category.toLowerCase().includes(q);
        const matchesProvider = game.provider.toLowerCase().includes(q);
        return matchesName || matchesCategory || matchesProvider;
      }
      return true;
    });
  }, [selectedCategory, filterFavoritesOnly, searchQuery, favorites]);

  const originalsGames = useMemo(() => GAMES.filter(g => g.category === "Originals"), []);
  const tableGames = useMemo(() => GAMES.filter(g => g.category === "Table"), []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#EDEDF0]">
      {/* Compact Sidebar: fixed on desktop, drawer on mobile */}
      <Sidebar />

      {/* Main Content Area: offset on desktop by sidebar width */}
      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Navbar />

        <main className="flex-1 w-full lg:max-w-7xl lg:mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6 pb-28 lg:pb-12">
          {/* Header Banner / Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232632]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gamepad2 className="w-5 h-5 text-red-500" />
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Game Lobby
                </h1>
              </div>
              <p className="text-xs text-[#8E95A5]">
                Authorized demonstration games from Turbo Games & Spribe. Risk-free virtual simulation.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 text-[#6A7182] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full pl-9 pr-4 py-2 bg-[#14161E] border border-[#232632] rounded-lg text-xs text-white placeholder-[#5A6072] focus:outline-none focus:border-red-500/60"
              />
            </div>
          </div>

          {/* Controls Bar: Category Pills & Favorites Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              {["All", "Originals", "Table"].map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setFilterFavoritesOnly(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === category && !filterFavoritesOnly
                      ? "bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]"
                      : "bg-[#14161E] text-[#8E95A5] hover:text-white hover:bg-[#1A1D26] border border-[#232632]"
                  }`}
                >
                  {category === "Table" ? "Table Games" : category}
                </button>
              ))}

              {/* Favorites toggle */}
              <button
                onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterFavoritesOnly
                    ? "bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]"
                    : "bg-[#14161E] text-[#8E95A5] hover:text-white hover:bg-[#1A1D26] border border-[#232632]"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${filterFavoritesOnly ? "fill-white text-white" : "text-red-500"}`} />
                <span>Favorites ({favorites.length})</span>
              </button>
            </div>

            <div className="text-xs text-[#6A7182] font-mono">
              Showing <strong className="text-white">{filteredGames.length}</strong> of {GAMES.length} titles
            </div>
          </div>

          {/* Symmetrical mobile layout with substantial cards showing ~2 to 2.5 cards */}
          {selectedCategory === "All" && !filterFavoritesOnly && !searchQuery.trim() ? (
            <div className="md:hidden space-y-6">
              {/* Originals Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-red-500" />
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">
                      Originals
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#6A7182]">{originalsGames.length} games</span>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-0.5 px-0.5 snap-x snap-mandatory touch-pan-x">
                  {originalsGames.map(game => (
                    <div key={game.id} className="w-[165px] sm:w-[185px] shrink-0 snap-start">
                      <GameCard game={game} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Games Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dice5 className="w-4 h-4 text-red-500" />
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">
                      Table Games
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#6A7182]">{tableGames.length} games</span>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-0.5 px-0.5 snap-x snap-mandatory touch-pan-x">
                  {tableGames.map(game => (
                    <div key={game.id} className="w-[165px] sm:w-[185px] shrink-0 snap-start">
                      <GameCard game={game} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Filtered Mobile View: Grid/Slider */
            <div className="md:hidden">
              {filteredGames.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-0.5 px-0.5 snap-x snap-mandatory touch-pan-x">
                  {filteredGames.map(game => (
                    <div key={game.id} className="w-[165px] sm:w-[185px] shrink-0 snap-start">
                      <GameCard game={game} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-[#14161E] rounded-2xl border border-[#232632] p-6">
                  <p className="text-sm font-semibold text-white">No games found</p>
                  <p className="text-xs text-[#8E95A5] mt-1">Try clearing your filters or search query.</p>
                </div>
              )}
            </div>
          )}

          {/* Desktop View: Substantial responsive 4-column grid */}
          <div className="hidden md:block">
            {filteredGames.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#14161E] rounded-2xl border border-[#232632] p-8">
                <Gamepad2 className="w-10 h-10 text-[#5A6072] mx-auto mb-2" />
                <p className="text-base font-bold text-white">No demo games match your filter</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setFilterFavoritesOnly(false);
                    setSearchQuery("");
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Continuous Provider Logo Marquee */}
          <ProviderMarquee />
        </main>

        <Footer />
      </div>
    </div>
  );
}
