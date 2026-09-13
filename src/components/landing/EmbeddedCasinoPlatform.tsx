"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { GAMES, CATEGORIES } from "@/config/games";
import { useFavorites } from "@/context/FavoritesContext";
import { useWallet } from "@/context/WalletContext";
import { Badge } from "@/components/ui/Badge";
import {
  Flame,
  Gamepad2,
  Layers,
  Sparkles,
  Dice5,
  Heart,
  Search,
  PlusCircle,
  Play,
  ShieldCheck,
  ExternalLink,
  Activity,
  Zap,
  HelpCircle,
  Gift,
  Home,
  Trophy,
  Bell,
  Tv,
  Coins
} from "lucide-react";
import { INITIAL_DEMO_ACTIVITY } from "@/data/mockActivity";

export function EmbeddedCasinoPlatform() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterFavorites, setFilterFavorites] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { favorites, toggleFavorite, addRecentGame } = useFavorites();
  const { balance, openWalletModal } = useWallet();

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(balance);

  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      if (selectedCategory === "Featured") {
        if (!game.badges.includes("HOT") && !game.badges.includes("POPULAR")) return false;
      } else if (selectedCategory !== "All" && game.category !== selectedCategory) {
        return false;
      }

      if (filterFavorites && !favorites.includes(game.id)) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          game.name.toLowerCase().includes(q) ||
          game.provider.toLowerCase().includes(q) ||
          game.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [selectedCategory, filterFavorites, searchQuery, favorites]);

  // Full Reference 3 Sidebar Navigation Items
  const sidebarItems = [
    { name: "Home", category: "All", icon: Home, active: selectedCategory === "All" && !filterFavorites },
    { name: "Casino", category: "All", icon: Flame, active: selectedCategory === "All" && !filterFavorites },
    { name: "Live Casino", category: "Table", icon: Tv, active: selectedCategory === "Table" },
    { name: "Slots", category: "Featured", icon: Sparkles, active: selectedCategory === "Featured" },
    { name: "Originals", category: "Originals", icon: Gamepad2, active: selectedCategory === "Originals" },
    { name: "Table Games", category: "Table", icon: Dice5, active: selectedCategory === "Table" },
    { name: "Game Shows", category: "Featured", icon: Trophy, active: false },
    { name: "Providers", category: "All", icon: Layers, active: false },
    { name: "Promotions", category: "All", icon: Gift, active: false },
  ];

  return (
    <section id="casino-platform" className="relative py-6 sm:py-10 bg-[#08090D] border-b border-[#1A1A26]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Dashboard Shell (Exact Reference 3 Aesthetic) */}
        <div className="rounded-2xl bg-[#0B0C12] border border-[#1E1F2C] shadow-2xl overflow-hidden flex flex-col">
          {/* 1. TOP COMPACT HEADER (Reference 3 Header with Nav Tabs & Balance) */}
          <div className="bg-[#0D0E16] border-b border-[#1C1D2A] px-4 py-2 flex items-center justify-between gap-4">
            {/* Left: Brand Logo & Name */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-black text-[11px] shadow-[0_0_8px_rgba(255,30,39,0.5)]">
                YB
              </div>
              <span className="text-xs font-black text-white tracking-wide uppercase">
                YOURBRAND
              </span>
            </div>

            {/* Center: Horizontal Navigation Tabs (Reference 3) */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[
                { name: "Casino", cat: "All" },
                { name: "Sports", cat: "All" },
                { name: "Live Casino", cat: "Table" },
                { name: "Crash Games", cat: "Crash" },
                { name: "Promotions", cat: "All" },
                { name: "VIP", cat: "All" },
              ].map((tab, idx) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setSelectedCategory(tab.cat);
                    setFilterFavorites(false);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                    idx === 0
                      ? "text-white bg-red-600/25 border border-red-500/40 shadow-sm"
                      : "text-[#8E8E9E] hover:text-white hover:bg-[#151622]"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Right: Balance, Gold Deposit Button, Bell, Profile (Reference 3) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <div className="flex items-center bg-[#131420] border border-[#202130] rounded-lg px-2.5 py-1 text-xs">
                <span className="text-[10px] text-red-400 font-bold mr-1.5 uppercase">DEMO</span>
                <span className="font-mono font-extrabold text-white text-xs sm:text-sm">{formattedBalance}</span>
              </div>

              <button
                onClick={openWalletModal}
                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(255,30,39,0.4)] transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5 text-white" />
                <span>Deposit</span>
              </button>

              <button
                className="p-1.5 rounded-lg bg-[#141522] border border-[#222332] text-[#8E8E9E] hover:text-white transition-colors"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 pl-1">
                <div className="w-7 h-7 rounded-lg bg-[#181926] border border-[#252638] flex items-center justify-center text-white text-[11px] font-bold" title="Player01">
                  P1
                </div>
                <div className="hidden xl:block text-left text-[11px] leading-tight">
                  <div className="font-bold text-white">Player01</div>
                  <div className="text-[9px] text-red-400 font-mono font-bold">VIP Bronze</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BODY (Sidebar + Main Content Area) */}
          <div className="flex flex-col lg:flex-row flex-1">
            {/* LEFT SIDEBAR (Full Reference 3 Density) */}
            <div className="w-full lg:w-48 bg-[#0B0C12] border-b lg:border-b-0 lg:border-r border-[#1C1D2A] p-2 flex flex-row lg:flex-col justify-between shrink-0 overflow-x-auto lg:overflow-x-visible">
              <div className="flex flex-row lg:flex-col gap-0.5 w-full">
                {sidebarItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setSelectedCategory(item.category);
                        setFilterFavorites(false);
                      }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left whitespace-nowrap ${
                        item.active
                          ? "bg-[#1E090D] text-white border-l-2 border-red-500 shadow-[inset_0_0_8px_rgba(255,30,39,0.2)] font-bold"
                          : "text-[#8E8E9E] hover:text-white hover:bg-[#12131D]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${item.active ? "text-red-500" : "text-[#6E6E82]"}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setFilterFavorites(!filterFavorites)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left whitespace-nowrap ${
                    filterFavorites
                      ? "bg-red-600 text-white shadow-[0_0_10px_rgba(255,30,39,0.4)] font-bold"
                      : "text-[#8E8E9E] hover:text-white hover:bg-[#12131D]"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${filterFavorites ? "fill-white text-white" : "text-red-500"}`} />
                  <span>Favorites ({favorites.length})</span>
                </button>
              </div>

              {/* Sidebar bottom indicator */}
              <div className="hidden lg:block pt-2 mt-2 border-t border-[#181924] px-2 text-[10px] text-[#606072]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Demo Mode</span>
                </div>
                <span>Zero real money.</span>
              </div>
            </div>

            {/* CASINO MAIN CONTENT */}
            <div className="flex-1 p-4 sm:p-5 space-y-5 bg-[#07080C]">
              {/* TOP BANNER ROW (Exact Reference 3 Composition) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                {/* Main Entertainment Banner (65% width) using exact Reference 3 background_hero.png asset */}
                <Link
                  href="/games/crash"
                  className="group lg:col-span-8 relative rounded-xl overflow-hidden bg-[#0A0B12] border border-[#202130] hover:border-red-500/60 transition-all duration-300 block shadow-lg min-h-[170px] sm:min-h-[200px]"
                >
                  <Image
                    src="/assets/ui/background_hero.png"
                    alt="A New Level of Entertainment - Crash, Mines, Plinko, Dice, Roulette"
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover object-left sm:object-center group-hover:scale-[1.01] transition-transform duration-300"
                    priority
                  />
                  {/* Subtle interactive hover sheen */}
                  <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Link>

                {/* Right Cards Stack (35% width, Reference 3 Bonus & Feature Cards) */}
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                  {/* Welcome Demo Card */}
                  <div className="flex-1 p-3.5 rounded-xl bg-gradient-to-br from-[#1A0C10] to-[#0E0E16] border border-[#2E141C] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#8E8E9E]">Welcome Demo Credits</span>
                      <div className="text-lg font-black text-white leading-tight mt-0.5">
                        100% UP TO <span className="text-red-400 font-mono">$1,000</span>
                      </div>
                    </div>
                    <button
                      onClick={openWalletModal}
                      className="mt-2.5 w-full py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-[11px] font-black uppercase tracking-wider transition-colors text-center"
                    >
                      CLAIM DEMO
                    </button>
                  </div>

                  {/* Feature Bullets (Reference 3 fast feature list) */}
                  <div className="flex-1 p-3 rounded-xl bg-[#0D0E16] border border-[#1A1B28] flex flex-col justify-center space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="font-semibold">Instant Launch • Zero Delay</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold">Provably Demo • Safe Play</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-300">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="font-semibold">24/7 Simulator Assistance</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Pills Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#161722]">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setFilterFavorites(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        selectedCategory === category && !filterFavorites
                          ? "bg-red-600 text-white shadow-[0_0_8px_rgba(255,30,39,0.35)]"
                          : "bg-[#10111A] text-[#8E8E9E] hover:text-white hover:bg-[#161724] border border-[#1C1D2A]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6A6A7C]">
                  <Gamepad2 className="w-3.5 h-3.5 text-red-500" />
                  <span>
                    Showing <strong className="text-white font-mono">{filteredGames.length}</strong> Spribe Games
                  </span>
                </div>
              </div>

              {/* DENSE 5-COLUMN GAME CARDS ROW (Exact Reference 3 Aspect Ratio & Native Asset Display) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {filteredGames.map(game => {
                  const favorited = favorites.includes(game.id);
                  return (
                    <div
                      key={game.id}
                      className="group relative rounded-xl bg-[#0D0E16] border border-[#1C1D2A] hover:border-red-500/80 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,30,39,0.3)] overflow-hidden flex flex-col"
                    >
                      {/* Top Badges */}
                      <div className="absolute top-1.5 left-1.5 right-1.5 z-20 flex items-center justify-between pointer-events-none">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600/90 text-white leading-none shadow-sm">
                          DEMO
                        </span>
                        <button
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(game.id);
                          }}
                          className="pointer-events-auto p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:border-red-500/60 text-white transition-transform active:scale-90"
                          title="Favorite"
                        >
                          <Heart
                            className={`w-2.5 h-2.5 ${favorited ? "fill-red-500 text-red-500" : "text-white/80"}`}
                          />
                        </button>
                      </div>

                      {/* Native Aspect Ratio Display (250x90) — Zero Cropping */}
                      <Link
                        href={`/games/${game.id}`}
                        onClick={() => addRecentGame(game.id)}
                        className="relative w-full aspect-[250/90] bg-[#07070B] overflow-hidden block"
                      >
                        <Image
                          src={game.image}
                          alt={game.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="object-contain object-center group-hover:scale-104 transition-transform duration-200"
                        />

                        {/* Quick Play Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,30,39,0.8)]">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                      </Link>

                      {/* Clean Sub-Bar */}
                      <div className="px-2.5 py-1.5 bg-[#0A0B12] border-t border-[#171824] flex items-center justify-between text-[10px] font-medium">
                        <span className="text-[#8E8E9E]">{game.provider}</span>
                        <span className="text-red-400 font-mono font-bold">RTP {game.rtp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Activity Table (Reference 3 Style) */}
              <div className="rounded-xl bg-[#0A0B12] border border-[#1A1B28] p-3 sm:p-4 overflow-hidden">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#141520]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-black uppercase text-white tracking-wide">
                      Live Simulated Bets Stream
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5E5E72]">
                    Sample Activity • Demo Mode
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium">
                    <thead>
                      <tr className="text-[10px] font-mono uppercase text-[#555568] border-b border-[#12131E]">
                        <th className="pb-1.5 font-bold">Game</th>
                        <th className="pb-1.5 font-bold">Player</th>
                        <th className="pb-1.5 font-bold">Demo Bet</th>
                        <th className="pb-1.5 font-bold">Multiplier</th>
                        <th className="pb-1.5 font-bold text-right">Demo Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#12131E]">
                      {INITIAL_DEMO_ACTIVITY.slice(0, 5).map(act => (
                        <tr key={act.id} className="hover:bg-white/[0.02]">
                          <td className="py-2 text-white font-bold">{act.gameName}</td>
                          <td className="py-2 font-mono text-[#8E8E9E]">{act.player}</td>
                          <td className="py-2 font-mono text-[#8E8E9E]">${act.bet.toFixed(2)}</td>
                          <td className="py-2 font-mono font-bold">
                            {act.multiplier > 0 ? (
                              <span className="text-emerald-400">{act.multiplier}x</span>
                            ) : (
                              <span className="text-[#555565]">0.00x</span>
                            )}
                          </td>
                          <td className="py-2 font-mono font-bold text-right">
                            {act.isWin ? (
                              <span className="text-emerald-400">+${act.payout.toFixed(2)}</span>
                            ) : (
                              <span className="text-[#505060]">-$0.00</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
