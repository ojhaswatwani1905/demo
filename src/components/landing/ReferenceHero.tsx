"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronRight, ShieldCheck } from "lucide-react";

export function ReferenceHero() {
  const gamesList = ["MINES", "PLINKO", "DICE", "ROULETTE"];

  return (
    <section className="relative w-full md:h-[calc(100vh-4.5rem)] md:min-h-[720px] md:max-h-[920px] min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#050507] select-none border-b border-[#1A1A26]">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC 3D BACKGROUND ENVIRONMENT LAYER                              */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Real 3D Environment Background: Planet, Gantries, Fighter Jet, Wet Tarmac */}
        <Image
          src="/assets/ui/hero_arena_bg.jpg"
          alt="BETADRiX Futuristic Spaceport Launchbay"
          fill
          priority
          unoptimized
          className="object-cover object-center opacity-85"
        />

        {/* Ambient Crimson Volumetric Light Glow from Central Planet */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] lg:w-[1100px] h-[550px] bg-gradient-to-b from-[#FF1E27]/25 via-[#8B0000]/15 to-transparent blur-[120px] rounded-full pointer-events-none" />

        {/* Top Vignette (Seamless navbar blending) */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#050507] via-[#050507]/80 to-transparent pointer-events-none" />

        {/* Bottom Wet Floor Reflection & Vignette (Seamless platform transition) */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#050507] via-[#050507]/85 to-transparent pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 2. BACKGROUND TYPOGRAPHY (BEHIND ASTRONAUT HEAD & SHOULDERS)              */}
      {/* ========================================================================= */}
      <div className="relative z-10 pt-4 sm:pt-6 lg:pt-7 text-center px-4 w-full pointer-events-none">
        {/* Eyebrow Subheading */}
        <div className="flex items-center justify-center gap-3 mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.28em] text-[#FF2E38] font-black uppercase drop-shadow-[0_0_12px_rgba(255,30,39,0.8)]">
            PVP &amp; DEMO BATTLE &nbsp;&nbsp;//&nbsp;&nbsp; SPRIBE ARCHITECTURE
          </span>
        </div>

        {/* Massive Condensed Headline: PLAY BEYOND LIMITS */}
        <h1
          className="text-5xl sm:text-7xl md:text-[105px] lg:text-[135px] xl:text-[156px] font-black tracking-wider leading-[0.88] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#FF2B35] via-[#D80E1A] to-[#4A0005] drop-shadow-[0_0_45px_rgba(255,30,39,0.45)] select-none"
          style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', 'Barlow Condensed', sans-serif" }}
        >
          PLAY BEYOND LIMITS
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* 3. 3D COMBAT ASTRONAUT SUBJECT (CENTER FOREGROUND, GROUNDED, RIM-LIT)     */}
      {/* ========================================================================= */}
      {/* Desktop/Tablet: Absolute positioning with z-20 for 3D layering */}
      <div className="hidden md:flex absolute inset-0 z-20 items-end justify-center pointer-events-none pb-0">
        <div className="relative w-[500px] lg:w-[640px] xl:w-[700px] h-[500px] lg:h-[610px] xl:h-[660px] flex items-end justify-center">
          {/* Realistic Multi-layered Ground Contact Shadow on wet tarmac */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-black/95 blur-md rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-[#FF1E27]/30 blur-xl rounded-full" />

          {/* Clean Astronaut Character Artwork with Volumetric Red Rim Lighting */}
          <div className="relative w-full h-full filter drop-shadow-[0_0_30px_rgba(255,30,39,0.35)] drop-shadow-[0_15px_40px_rgba(0,0,0,0.95)]">
            <Image
              src="/assets/ui/combat_astronaut_clean.png"
              alt="BETADRiX Combat Character"
              fill
              priority
              unoptimized
              className="object-contain object-bottom"
            />
          </div>

          {/* Ground Blend Fade into the wet tarmac deck at the bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050507] via-[#050507]/80 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Mobile: Relative flow between headline and action cards */}
      <div className="flex md:hidden relative z-20 items-center justify-center my-auto py-1 pointer-events-none">
        <div
          className="relative w-[230px] h-[230px] sm:w-[300px] sm:h-[300px]"
          style={{
            maskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
          }}
        >
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/95 blur-md rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-[#FF1E27]/30 blur-lg rounded-full" />
          <Image
            src="/assets/ui/combat_astronaut_clean.png"
            alt="BETADRiX Combat Character"
            fill
            priority
            unoptimized
            className="object-contain object-bottom filter drop-shadow-[0_0_20px_rgba(255,30,39,0.35)]"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FOREGROUND INTERACTIVE UI CARDS & CONTROLS (Z-30)                      */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-28 sm:pb-8 md:pb-6 flex flex-col justify-end">
        {/* DESKTOP / TABLET: 3-COLUMN GRID FLANKING ASTRONAUT */}
        <div className="hidden md:grid grid-cols-12 gap-6 items-end">
          {/* LEFT FLOATING CARD: BETADRIX 4.0 & GAMES CATALOG */}
          <div className="md:col-span-4 lg:col-span-4">
            <div className="relative rounded-2xl bg-[#0B0C14]/90 backdrop-blur-md border border-[#202232] p-5 shadow-[0_15px_45px_rgba(0,0,0,0.85)] max-w-sm">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-6 rounded-sm bg-[#FF1E27] shadow-[0_0_10px_#FF1E27] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-black uppercase text-white tracking-wider leading-none">
                    BETADRIX 4.0
                  </h2>
                  <p className="text-[10px] font-mono tracking-widest text-[#8E8E9E] uppercase mt-1">
                    GAMING WITHOUT BORDERS
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 pl-4">
                {gamesList.map((game) => (
                  <div key={game} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF1E27] shadow-[0_0_6px_#FF1E27]" />
                    <span className="text-xs font-mono font-bold tracking-wider text-[#D8D8E5]">
                      {game}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2.5">
                <Link
                  href="#casino-platform"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#FF1E27] to-[#B30C19] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,30,39,0.5)] hover:shadow-[0_0_30px_rgba(255,30,39,0.75)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>EXPLORE GAMES</span>
                </Link>

                <Link
                  href="/games/mines"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#141520]/80 hover:bg-[#1A1C2C] border border-[#2A2C3E] hover:border-red-500/50 text-white text-xs font-black uppercase tracking-wider transition-all"
                >
                  <span>VIEW DEMO</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF1E27]" />
                </Link>
              </div>
            </div>
          </div>

          {/* CENTER: MINIMAL MOUSE SCROLL PROMPT */}
          <div className="md:col-span-4 lg:col-span-4 flex flex-col items-center justify-center pb-2">
            <Link
              href="#casino-platform"
              className="flex flex-col items-center gap-1.5 text-[#8E8E9E] hover:text-[#FF1E27] transition-colors group cursor-pointer"
            >
              <div className="w-5 h-8 rounded-full border-2 border-[#3A3C52] group-hover:border-[#FF1E27] flex items-start justify-center p-1 bg-[#090A10]/90 transition-colors shadow-lg">
                <span className="w-1 h-2 rounded-full bg-[#FF1E27] animate-bounce shadow-[0_0_8px_#FF1E27]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
                SCROLL TO CASINO
              </span>
            </Link>
          </div>

          {/* RIGHT FLOATING CARD: AUTHORIZED DEMO ACCESS & BALANCE */}
          <div className="md:col-span-4 lg:col-span-4 flex justify-end">
            <div className="relative rounded-2xl bg-[#0B0C14]/90 backdrop-blur-md border border-[#202232] p-5 shadow-[0_15px_45px_rgba(0,0,0,0.85)] w-full max-w-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF1E27] shadow-[0_0_10px_#FF1E27]" />
                <span className="text-xs font-mono font-black uppercase tracking-wider text-white">
                  AUTHORIZED DEMO ACCESS
                </span>
              </div>

              <p className="text-[10px] font-mono uppercase tracking-widest text-[#78788C] mt-0.5">
                SIMULATED STARTER CREDITS
              </p>

              <div className="mt-2 text-3xl font-black font-mono text-white tracking-tight">
                $1,250.00
              </div>

              <div className="mt-4 pt-3 border-t border-[#1C1D2A] flex items-end justify-between">
                <div className="space-y-1 text-[10px] font-mono tracking-wider">
                  <div className="text-[#A0A0B5] font-semibold">REAL GAMES</div>
                  <div className="text-[#FF2E38] font-bold">ZERO REAL-MONEY RISK</div>
                  <div className="text-[#68687A]">PLAY RESPONSIBLY</div>
                </div>

                <div className="grid grid-cols-4 gap-1 p-1 bg-[#07080D] rounded border border-[#1C1D28]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        i % 3 === 0
                          ? "bg-[#FF1E27] shadow-[0_0_4px_#FF1E27]"
                          : i % 2 === 0
                          ? "bg-[#8B0000]"
                          : "bg-[#2A2B3A]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE: RECOMPOSED COMPACT CARD & BUTTONS (NO OVERFLOW, ASTRONAUT FULLY VISIBLE) */}
        <div className="flex md:hidden flex-col gap-3 w-full">
          <div className="rounded-xl bg-[#0B0C14]/90 backdrop-blur-md border border-[#202232] p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-sm bg-[#FF1E27] shadow-[0_0_8px_#FF1E27]" />
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  BETADRIX 4.0
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-[#222436] text-[10px] font-mono text-emerald-400 font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>$1,250.00 DEMO</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold text-[#A0A0B5]">
              {gamesList.map((game) => (
                <span key={game} className="px-2 py-0.5 rounded bg-[#141522] border border-[#222334]">
                  {game}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="#casino-platform"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#FF1E27] to-[#B30C19] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,30,39,0.5)] active:scale-[0.98]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>EXPLORE</span>
              </Link>
              <Link
                href="/games/mines"
                className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg bg-[#141520] border border-[#2A2C3E] text-white text-xs font-black uppercase tracking-wider active:scale-[0.98]"
              >
                <span>DEMO</span>
                <ChevronRight className="w-3 h-3 text-[#FF1E27]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
