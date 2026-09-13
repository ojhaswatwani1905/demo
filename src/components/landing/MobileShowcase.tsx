"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Smartphone, CheckCircle, Flame, Shield, ArrowRight } from "lucide-react";

export function MobileShowcase() {
  return (
    <section className="py-24 relative bg-[#050508] overflow-hidden border-t border-[#171724]">
      {/* Red ambient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141E] border border-[#252538] text-[11px] font-black uppercase tracking-widest text-red-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile First Architecture</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black uppercase text-white tracking-tight leading-tight">
              YOUR GAMES. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#FF3342]">
                ANYWHERE.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Enjoy fluid touch responses, optimized game viewports, and dedicated bottom navigation.
              Whether on a smartphone, tablet, or workstation, the demonstration experience remains ultra-fast and immersive.
            </p>

            {/* Feature Points */}
            <div className="space-y-3 pt-2 max-w-md mx-auto lg:mx-0 text-left">
              {[
                "Dedicated mobile bottom navigation for one-thumb control",
                "Responsive 2-column game grid tailored for portrait viewports",
                "Zero horizontal scrollbars with high-contrast readable typography",
                "Instant modal top-ups with simulated $1,250.00 demo balance",
              ].map((point, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                  <div className="w-5 h-5 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3 h-3 text-red-500" />
                  </div>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/casino"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,30,39,0.35)] transition-all"
              >
                <span>Try Mobile Lobby</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Phone Mockup Presentation */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-[300px] sm:w-[340px] h-[620px] rounded-[48px] p-3.5 bg-gradient-to-b from-[#28283C] to-[#12121A] border-4 border-[#32324A] shadow-[0_0_60px_rgba(255,30,39,0.25)] relative overflow-hidden">
              {/* Dynamic Island / Camera Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30" />

              {/* Inner Screen */}
              <div className="w-full h-full bg-[#08080E] rounded-[36px] overflow-hidden flex flex-col justify-between border border-white/5 relative z-20">
                {/* Mobile Screen Header */}
                <div className="p-4 pt-8 bg-[#0D0D14] border-b border-[#1F1F2C] flex items-center justify-between">
                  <span className="text-xs font-black text-white">
                    YOUR<span className="text-red-500">BRAND</span>
                  </span>
                  <span className="text-[10px] font-mono text-white bg-red-600/30 px-2 py-0.5 rounded border border-red-500/40">
                    $1,250.00
                  </span>
                </div>

                {/* Simulated Screen Content */}
                <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 to-black border border-red-500/30">
                    <span className="text-[9px] font-mono text-red-400 font-bold uppercase">Spribe Featured</span>
                    <h5 className="text-xs font-black text-white">Crash Demo</h5>
                    <p className="text-[10px] text-[#8E8E9E] mt-0.5">Scale multipliers up to 10,000x</p>
                  </div>

                  {/* 2-Column Mobile Grid in Mockup */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="aspect-[250/90] rounded-lg bg-[#14141E] border border-[#252535] relative overflow-hidden p-0.5">
                      <Image src="/assets/games/game_card_mines.png" alt="Mines" fill className="object-contain object-center" />
                    </div>
                    <div className="aspect-[250/90] rounded-lg bg-[#14141E] border border-[#252535] relative overflow-hidden p-0.5">
                      <Image src="/assets/games/game_card_plinko.png" alt="Plinko" fill className="object-contain object-center" />
                    </div>
                    <div className="aspect-[250/90] rounded-lg bg-[#14141E] border border-[#252535] relative overflow-hidden p-0.5">
                      <Image src="/assets/games/game_card_dice.png" alt="Dice" fill className="object-contain object-center" />
                    </div>
                    <div className="aspect-[250/90] rounded-lg bg-[#14141E] border border-[#252535] relative overflow-hidden p-0.5">
                      <Image src="/assets/games/game_card_roulette.png" alt="Roulette" fill className="object-contain object-center" />
                    </div>
                  </div>
                </div>

                {/* Simulated Mobile Bottom Nav */}
                <div className="p-2.5 bg-[#0A0A10] border-t border-[#1C1C2A] flex items-center justify-around text-[9px] font-bold text-[#8E8E9E]">
                  <span className="text-red-500">Home</span>
                  <span>Casino</span>
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs -mt-3 shadow-[0_0_10px_rgba(255,30,39,0.5)]">
                    ★
                  </div>
                  <span>Games</span>
                  <span>Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
