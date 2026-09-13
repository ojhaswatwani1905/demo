"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Play, Sparkles, ChevronRight } from "lucide-react";

export function ReferenceHero() {
  return (
    <section className="relative w-full h-[calc(100vh-4.5rem)] min-h-[660px] max-h-[920px] flex flex-col justify-between overflow-hidden bg-[#050505] select-none border-b border-[#1A0A0E]">
      {/* Volumetric Deep Crimson Glow on Perimeters (Reference 1 Atmosphere) */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-12 -left-20 w-80 h-80 bg-red-600/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-12 -right-20 w-80 h-80 bg-red-600/15 blur-[120px] pointer-events-none z-0" />

      {/* Center Composition: Giant Red Condensed Text + Centered Astronaut Character (Reference 1) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-6 sm:pt-8 overflow-hidden">
        {/* Single centered eyebrow text directly above title (Reference 1) */}
        <div className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-red-500 uppercase font-extrabold mb-1.5 drop-shadow-sm px-2 text-center">
          PVP & DEMO BATTLE // SPRIBE ARCHITECTURE
        </div>

        {/* Massive Red Condensed Headline (Reference 1 Typography) */}
        <h1 className="text-[34px] min-[400px]:text-[44px] sm:text-7xl md:text-8xl lg:text-[120px] xl:text-[150px] font-black uppercase tracking-tight text-center leading-[0.8] text-transparent bg-clip-text bg-gradient-to-b from-[#FF2E38] via-[#D00D18] to-[#400006] drop-shadow-[0_0_80px_rgba(255,30,39,0.55)] px-2 z-0 whitespace-nowrap">
          PLAY BEYOND LIMITS
        </h1>

        {/* Foreground Astronaut Character (Reference 1 Exact Placement) */}
        <div className="absolute inset-x-0 bottom-0 top-20 sm:top-24 md:top-28 flex items-end justify-center pointer-events-none z-10">
          <div className="relative w-[340px] sm:w-[460px] md:w-[560px] lg:w-[640px] h-[360px] sm:h-[460px] md:h-[540px] lg:h-[600px]">
            <Image
              src="/assets/ui/combat_astronaut.png?v=2026"
              alt="Futuristic Combat Astronaut"
              fill
              priority
              unoptimized
              className="object-contain object-bottom"
            />
            {/* Seamless gradient fade at character base */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom HUD Bar (Reference 1 Layout: Left Content, Center Prompt, Right Dot-Matrix) */}
      <div className="relative z-20 pb-8 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {/* Left HUD Panel */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black uppercase text-red-500 tracking-wider">
                YOURBRAND DEMO
              </span>
              <span className="w-8 h-[1px] bg-red-500/50" />
            </div>
            <p className="text-xs sm:text-sm text-[#A0A0B5] max-w-sm leading-relaxed">
              Crash. Mines. Plinko. Dice. Roulette. One platform. Endless possibilities.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Button
                size="md"
                href="#casino-platform"
                glow
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                EXPLORE GAMES
              </Button>
              <Button
                size="md"
                variant="glass"
                href="/games/crash"
                icon={<Sparkles className="w-3.5 h-3.5 text-red-400" />}
              >
                VIEW DEMO
              </Button>
            </div>
          </div>

          {/* Center Scroll Indicator */}
          <div className="hidden md:flex md:col-span-2 flex-col items-center justify-center text-center">
            <a
              href="#casino-platform"
              className="flex flex-col items-center gap-1.5 text-[#707085] hover:text-red-400 transition-colors group"
            >
              <span className="text-[9px] font-mono uppercase tracking-widest">SCROLL TO CASINO</span>
              <div className="w-4 h-7 rounded-full border border-red-500/30 flex items-start justify-center p-1 group-hover:border-red-500 transition-colors">
                <span className="w-1 h-1.5 rounded-full bg-red-500 animate-bounce" />
              </div>
            </a>
          </div>

          {/* Right HUD Panel (Reference 1 dot matrix & reminder) */}
          <div className="md:col-span-5 flex flex-col md:items-end text-left md:text-right space-y-2.5">
            <div>
              <div className="text-[10px] font-mono text-[#7A7A8E] uppercase tracking-wider">
                SIMULATED STARTER CREDITS
              </div>
              <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wide flex items-center md:justify-end gap-1.5 mt-0.5">
                <span>AVAILABLE DEMO BALANCE:</span>
                <span className="text-red-400 font-mono font-bold">$1,250.00</span>
              </div>
            </div>

            <a
              href="#casino-platform"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-400 hover:text-white group"
            >
              <span>ENTER CASINO PLATFORM</span>
              <ChevronRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Futuristic Dot Matrix Pattern (Reference 1) */}
            <div className="grid grid-cols-8 gap-1.5 opacity-35 pt-0.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i % 3 === 0 ? "bg-red-500" : "bg-[#404050]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
