"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Play, ArrowUpRight, ShieldCheck, Sparkles, Layers } from "lucide-react";

export function GameShowcase() {
  return (
    <section id="showcase" className="py-24 relative bg-[#050508] overflow-hidden">
      {/* Red accent radial lights */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-red-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-red-700/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141F] border border-[#252535] text-[11px] font-black uppercase tracking-widest text-red-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Asymmetrical Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight">
            ENGINEERED FOR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-[#FF2E3D] to-red-700">
              HIGH-INTENSITY DEMOS
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#8E8E9E]">
            Explore individual mechanics crafted for tactical decision-making, multiplier surges, and zero risk.
          </p>
        </div>

        {/* Asymmetrical Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Large Hero Card: CRASH (Takes 7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#12121D] to-[#0A0A10] border border-[#262638] hover:border-red-500/60 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl transition-all duration-300">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 blur-[90px] group-hover:bg-red-600/25 transition-all pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <Badge variant="demo" size="md">FLAGSHIP DEMO</Badge>
                <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 px-3 py-1 rounded-full border border-red-500/30">
                  SPRIBE ORIGINAL
                </span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-3">
                CRASH
              </h3>
              <p className="text-sm sm:text-base text-[#A0A0B2] max-w-md leading-relaxed mb-6">
                Multiplayer curve-crash gaming experience with rapid multiplier scaling.
                Monitor the flight trajectory, anticipate the drop, and test your cash-out reflex in simulated mode.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6 max-w-md">
                <div className="p-3 rounded-xl bg-[#09090E] border border-[#1F1F2C]">
                  <span className="text-[10px] font-bold text-[#7E7E94] uppercase block">RTP</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono">97.00%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#09090E] border border-[#1F1F2C]">
                  <span className="text-[10px] font-bold text-[#7E7E94] uppercase block">Max Multiplier</span>
                  <span className="text-sm sm:text-base font-black text-red-400 font-mono">10,000x</span>
                </div>
                <div className="p-3 rounded-xl bg-[#09090E] border border-[#1F1F2C]">
                  <span className="text-[10px] font-bold text-[#7E7E94] uppercase block">Mode</span>
                  <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">Demo</span>
                </div>
              </div>
            </div>

            {/* Visual Image & Action */}
            <div className="relative z-10 mt-6 pt-6 border-t border-[#1C1C28] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative w-full sm:w-72 aspect-[250/90] rounded-xl overflow-hidden border border-[#252538] group-hover:border-red-500/50 transition-colors bg-[#08080E] p-1">
                <Image
                  src="/assets/games/game_card_crash.png"
                  alt="Crash preview"
                  fill
                  className="object-contain object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <Button
                size="lg"
                href="/games/crash"
                glow
                className="w-full sm:w-auto shrink-0"
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Launch Crash
              </Button>
            </div>
          </div>

          {/* Right Column Stack: Mines, Plinko, Roulette/Dice (Takes 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Mines Card */}
            <Link
              href="/games/mines"
              className="rounded-3xl bg-[#0F0F18] border border-[#222232] hover:border-red-500/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,30,39,0.2)]"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="demo" size="sm">DEMO</Badge>
                  <span className="text-[10px] font-mono text-[#8E8E9E]">97% RTP</span>
                </div>
                <h4 className="text-xl font-black text-white group-hover:text-red-400 transition-colors">
                  MINES
                </h4>
                <p className="text-xs text-[#8E8E9E] line-clamp-2">
                  Uncover stars on the minefield grid and cash out simulated profits before detonation.
                </p>
              </div>

              <div className="relative w-full sm:w-44 aspect-[250/90] rounded-xl overflow-hidden border border-[#252538] shrink-0 bg-[#08080E] group-hover:scale-105 transition-transform p-0.5">
                <Image
                  src="/assets/games/game_card_mines.png"
                  alt="Mines"
                  fill
                  className="object-contain object-center"
                />
              </div>
            </Link>

            {/* Plinko Card */}
            <Link
              href="/games/plinko"
              className="rounded-3xl bg-[#0F0F18] border border-[#222232] hover:border-red-500/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,30,39,0.2)]"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="demo" size="sm">DEMO</Badge>
                  <span className="text-[10px] font-mono text-[#8E8E9E]">555x Peak</span>
                </div>
                <h4 className="text-xl font-black text-white group-hover:text-red-400 transition-colors">
                  PLINKO
                </h4>
                <p className="text-xs text-[#8E8E9E] line-clamp-2">
                  Drop discs through tiered pegs into weighted pocket multipliers with instant feedback.
                </p>
              </div>

              <div className="relative w-full sm:w-44 aspect-[250/90] rounded-xl overflow-hidden border border-[#252538] shrink-0 bg-[#08080E] group-hover:scale-105 transition-transform p-0.5">
                <Image
                  src="/assets/games/game_card_plinko.png"
                  alt="Plinko"
                  fill
                  className="object-contain object-center"
                />
              </div>
            </Link>

            {/* Split Row for Dice and Roulette */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/games/dice"
                className="rounded-2xl bg-[#0D0D14] border border-[#20202E] hover:border-red-500/60 p-4 flex flex-col justify-between group transition-all"
              >
                <div className="relative w-full aspect-[250/90] rounded-xl overflow-hidden border border-[#252538] mb-2 bg-[#08080E] p-0.5">
                  <Image
                    src="/assets/games/game_card_dice.png"
                    alt="Dice"
                    fill
                    className="object-contain object-center group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                    DICE
                  </h5>
                  <span className="text-[10px] text-[#8E8E9E]">Over/Under Slider</span>
                </div>
              </Link>

              <Link
                href="/games/roulette"
                className="rounded-2xl bg-[#0D0D14] border border-[#20202E] hover:border-red-500/60 p-4 flex flex-col justify-between group transition-all"
              >
                <div className="relative w-full aspect-[250/90] rounded-xl overflow-hidden border border-[#252538] mb-2 bg-[#08080E] p-0.5">
                  <Image
                    src="/assets/games/game_card_roulette.png"
                    alt="Roulette"
                    fill
                    className="object-contain object-center group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                    ROULETTE
                  </h5>
                  <span className="text-[10px] text-[#8E8E9E]">Futuristic Wheel</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
