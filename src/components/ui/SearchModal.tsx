"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Flame, ArrowRight, Gamepad2 } from "lucide-react";
import { GAMES } from "@/config/games";
import { Badge } from "@/components/ui/Badge";
import { useFavorites } from "@/context/FavoritesContext";

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useFavorites();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredGames = GAMES.filter(game =>
    game.name.toLowerCase().includes(query.toLowerCase()) ||
    game.category.toLowerCase().includes(query.toLowerCase()) ||
    game.provider.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-20 sm:pt-28">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Container */}
      <div className="relative w-full max-w-xl bg-[#0D0D14] border border-[#262638] rounded-2xl shadow-[0_0_60px_rgba(255,30,39,0.2)] overflow-hidden z-10 animate-in zoom-in-95">
        <div className="h-1 bg-gradient-to-r from-transparent via-[#FF1E27] to-transparent" />

        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1D1D2C] gap-3">
          <Search className="w-5 h-5 text-red-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search demo games (e.g. Mines, Plinko, Dice, Roulette...)"
            className="w-full bg-transparent text-white placeholder-[#68687A] text-sm focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[#8E8E9E] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono text-[#8E8E9E] bg-[#171724] px-2 py-0.5 rounded border border-[#28283C]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="p-3 max-h-96 overflow-y-auto divide-y divide-[#171724]">
          {filteredGames.length > 0 ? (
            filteredGames.map(game => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#151522] transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-20 aspect-[250/90] rounded-lg overflow-hidden relative border border-[#222232] group-hover:border-red-500/50 transition-colors shrink-0 bg-[#08080C] p-0.5">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold group-hover:text-red-400 transition-colors">
                        {game.name}
                      </span>
                      <Badge variant="demo" size="sm">DEMO</Badge>
                    </div>
                    <span className="text-xs text-[#8E8E9E] flex items-center gap-1.5 mt-0.5">
                      <span>{game.provider}</span>
                      <span>•</span>
                      <span className="text-red-400/80">{game.category}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#8E8E9E] hidden sm:inline">RTP {game.rtp}</span>
                  <div className="w-8 h-8 rounded-lg bg-[#1D1D2C] flex items-center justify-center text-[#8E8E9E] group-hover:text-white group-hover:bg-red-600 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-12 text-center">
              <Gamepad2 className="w-10 h-10 text-[#404055] mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No demo games found</p>
              <p className="text-xs text-[#8E8E9E] mt-1">
                Try searching for &quot;Mines&quot;, &quot;Plinko&quot;, &quot;Dice&quot;, or &quot;Roulette&quot;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#09090F] border-t border-[#1D1D2C] flex items-center justify-between text-[11px] text-[#707085]">
          <span>Showing {filteredGames.length} demo game entries</span>
          <span className="text-red-400 font-bold uppercase tracking-wider">Demo Mode</span>
        </div>
      </div>
    </div>
  );
}
