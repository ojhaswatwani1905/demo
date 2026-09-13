"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Play, ArrowUpRight, ShieldCheck, Sparkles, Layers } from "lucide-react";

export function GameShowcase() {
  return (
    <section id="showcase" className="py-20 relative bg-[#050508] overflow-hidden border-t border-[#151622]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12131D] border border-[#202130] text-[11px] font-black uppercase tracking-widest text-red-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Titles</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            ENGINEERED FOR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-[#FF2E3D] to-red-600">
              HIGH-INTENSITY DEMOS
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8E9E]">
            Explore tactile mechanics crafted for risk tuning, multiplier surges, and instant simulated feedback.
          </p>
        </div>

        {/* Asymmetrical Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Large Hero Card: MINES (Takes 7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0D0E16] border border-[#1E1F2C] hover:border-red-500/50 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group transition-all duration-200">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-5">
                <Badge variant="demo" size="md">FLAGSHIP DEMO</Badge>
                <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 px-3 py-1 rounded-full border border-red-500/30">
                  TURBO GAMES
                </span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2.5">
                MINES
              </h3>
              <p className="text-xs sm:text-sm text-[#A0A0B2] max-w-md leading-relaxed mb-6">
                Navigate a 5x5 grid of hidden stars and landmines. Tune your hazard density, reveal safe tiles to escalate payout multipliers, and cash out simulated earnings.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6 max-w-md">
                <div className="p-3 rounded-xl bg-[#08090F] border border-[#1A1B28]">
                  <span className="text-[10px] font-bold text-[#7E7E94] uppercase block">RTP</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono">97.00%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#08090F] border border-[#1A1B28]">
                  <span className="text-[10px] font-bold text-[#7E7E94] uppercase block">Max Multiplier</span>
                  <span className="text-sm sm:text-base font-black text-red-400 font-mono">10,000x</span>
                </div>
                <div className="p-3 rounded-xl bg-[#08090F] border border-[#1A1B28]">
                  <span className="text-[10px] font-bold text-[#7E7E94] uppercase block">Mode</span>
                  <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">Demo</span>
                </div>
              </div>
            </div>

            {/* Visual Image & Action */}
            <div className="relative z-10 mt-4 pt-5 border-t border-[#181926] flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="relative w-full sm:w-72 aspect-[250/90] rounded-xl overflow-hidden border border-[#202130] group-hover:border-red-500/40 transition-colors bg-[#07070B] p-1">
                <Image
                  src="/assets/games/game_card_mines.png"
                  alt="Mines preview"
                  fill
                  className="object-contain object-center group-hover:scale-102 transition-transform duration-300"
                />
              </div>

              <Button
                size="lg"
                href="/games/mines"
                glow
                className="w-full sm:w-auto shrink-0"
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Launch Mines
              </Button>
            </div>
          </div>

          {/* Right Column Stack: Plinko, Dice, Roulette (Takes 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Plinko Card */}
            <Link
              href="/games/plinko"
              className="rounded-2xl bg-[#0D0E16] border border-[#1E1F2C] hover:border-red-500/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all duration-200"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="demo" size="sm">DEMO</Badge>
                  <span className="text-[10px] font-mono text-[#8E8E9E]">555x Peak</span>
                </div>
                <h4 className="text-lg font-black text-white group-hover:text-red-400 transition-colors">
                  PLINKO
                </h4>
                <p className="text-xs text-[#8E8E9E] line-clamp-2">
                  Drop discs through tiered pegs into weighted pocket multipliers.
                </p>
              </div>

              <div className="relative w-full sm:w-40 aspect-[250/90] rounded-xl overflow-hidden border border-[#202130] shrink-0 bg-[#07070B] p-0.5">
                <Image
                  src="/assets/games/game_card_plinko.png"
                  alt="Plinko"
                  fill
                  className="object-contain object-center group-hover:scale-102 transition-transform"
                />
              </div>
            </Link>

            {/* Split Row for Dice and Roulette */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/games/dice"
                className="rounded-2xl bg-[#0D0E16] border border-[#1E1F2C] hover:border-red-500/50 p-4 flex flex-col justify-between group transition-all"
              >
                <div className="relative w-full aspect-[250/90] rounded-xl overflow-hidden border border-[#202130] mb-3 bg-[#07070B] p-0.5">
                  <Image
                    src="/assets/games/game_card_dice.png"
                    alt="Dice"
                    fill
                    className="object-contain object-center group-hover:scale-102 transition-transform"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                      DICE
                    </h5>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
                  </div>
                  <span className="text-[10px] text-[#8E8E9E]">990x Peak • Turbo Games</span>
                </div>
              </Link>

              <Link
                href="/games/roulette"
                className="rounded-2xl bg-[#0D0E16] border border-[#1E1F2C] hover:border-red-500/50 p-4 flex flex-col justify-between group transition-all"
              >
                <div className="relative w-full aspect-[250/90] rounded-xl overflow-hidden border border-[#202130] mb-3 bg-[#07070B] p-0.5">
                  <Image
                    src="/assets/games/game_card_roulette.png"
                    alt="Roulette"
                    fill
                    className="object-contain object-center group-hover:scale-102 transition-transform"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-black text-white group-hover:text-red-400 transition-colors">
                      ROULETTE
                    </h5>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
                  </div>
                  <span className="text-[10px] text-[#8E8E9E]">European Wheel • Spribe</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
