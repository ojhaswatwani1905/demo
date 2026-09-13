"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { CasinoHero } from "@/components/casino/CasinoHero";
import { PromotionsSection } from "@/components/casino/PromotionsSection";
import { RecentActivityTicker } from "@/components/casino/RecentActivityTicker";
import { GameGrid } from "@/components/games/GameGrid";
import { GAMES, CATEGORIES } from "@/config/games";
import { useFavorites } from "@/context/FavoritesContext";
import { Search, Heart, Sparkles, SlidersHorizontal, Gamepad2 } from "lucide-react";

export default function CasinoLobbyPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>("");
  const { favorites } = useFavorites();

  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      // Category filter
      if (selectedCategory === "Featured") {
        if (!game.badges.includes("HOT") && !game.badges.includes("POPULAR")) return false;
      } else if (selectedCategory !== "All" && game.category !== selectedCategory) {
        return false;
      }

      // Favorites filter
      if (filterFavoritesOnly && !favorites.includes(game.id)) {
        return false;
      }

      // Search filter
      if (localSearch.trim() !== "") {
        const query = localSearch.toLowerCase();
        const matchesName = game.name.toLowerCase().includes(query);
        const matchesCategory = game.category.toLowerCase().includes(query);
        const matchesProvider = game.provider.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesProvider) return false;
      }

      return true;
    });
  }, [selectedCategory, filterFavoritesOnly, localSearch, favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F7]">
      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isFixedDesktop={true} />

      {/* Main Content Area with left margin on large screens for persistent sidebar */}
      <div className="lg:pl-64 flex-1 flex flex-col transition-all duration-300">
        {/* Navbar */}
        <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Casino Hero */}
          <CasinoHero />

          {/* Controls Bar: Category Chips, Favorites Toggle, and Search Input */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setFilterFavoritesOnly(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      selectedCategory === category && !filterFavoritesOnly
                        ? "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-[0_0_15px_rgba(255,30,39,0.35)] border border-red-500/40"
                        : "bg-[#0E0E16] text-[#8E8E9E] hover:text-white hover:bg-[#161622] border border-[#20202E]"
                    }`}
                  >
                    {category}
                  </button>
                ))}

                {/* Favorites filter button */}
                <button
                  onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    filterFavoritesOnly
                      ? "bg-red-600 text-white shadow-[0_0_15px_rgba(255,30,39,0.4)] border border-red-400"
                      : "bg-[#0E0E16] text-[#8E8E9E] hover:text-white hover:bg-[#161622] border border-[#20202E]"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${filterFavoritesOnly ? "fill-white text-white" : "text-red-500"}`}
                  />
                  <span>Favorites ({favorites.length})</span>
                </button>
              </div>

              {/* Local Search Input */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  placeholder="Filter demo titles..."
                  className="w-full pl-10 pr-4 py-2 bg-[#0E0E16] border border-[#222232] rounded-xl text-xs text-white placeholder-[#68687A] focus:outline-none focus:border-red-500/60 font-medium"
                />
              </div>
            </div>

            {/* Catalog Info & Quick Stats */}
            <div className="flex items-center justify-between text-xs text-[#7E7E94] px-1">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-red-500" />
                <span>
                  Showing <strong className="text-white">{filteredGames.length}</strong> of 5 Spribe demo games
                </span>
              </div>
              <span className="font-mono text-[11px] text-red-400 uppercase tracking-widest font-bold">
                100% Demo Mode
              </span>
            </div>
          </div>

          {/* Game Grid */}
          <div className="mb-12">
            <GameGrid
              games={filteredGames}
              emptyMessage="No Spribe demo games matched your filter criteria. Try clicking 'All' or clearing your search."
            />
          </div>

          {/* Promotional Modules */}
          <PromotionsSection />

          {/* Live Recent Demo Activity Stream */}
          <RecentActivityTicker />
        </main>

        <Footer />
      </div>
    </div>
  );
}
