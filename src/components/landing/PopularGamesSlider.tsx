"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { GameCard } from "@/components/games/GameCard";
import { GAMES } from "@/config/games";
import { Flame, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export function PopularGamesSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -260, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 260, behavior: "smooth" });
    }
  };

  return (
    <section className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-600/10 text-red-500 border border-red-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              Popular Games
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Arrow Controls */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-xl bg-[#161820] hover:bg-[#1E212B] text-[#8E95A5] hover:text-white border border-[#262A38] transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-xl bg-[#161820] hover:bg-[#1E212B] text-[#8E95A5] hover:text-white border border-[#262A38] transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/games"
            className="text-xs font-bold text-[#8E95A5] hover:text-white transition-colors flex items-center gap-1 group"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Slider / Grid Container:
          - On Mobile: horizontal swipe slider showing ~2 to 2.5 cards with natural spacing/peek
          - On Desktop (md+): clean 4-column responsive grid
      */}
      <div className="md:hidden">
        <div
          ref={sliderRef}
          className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-0.5 px-0.5 snap-x snap-mandatory touch-pan-x"
        >
          {GAMES.map(game => (
            <div
              key={game.id}
              className="w-[165px] sm:w-[185px] shrink-0 snap-start"
            >
              <GameCard game={game} />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {GAMES.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
