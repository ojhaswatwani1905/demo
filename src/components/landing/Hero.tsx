"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Play, Sparkles, ShieldCheck, ChevronRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12 pb-20 lg:py-24">
      {/* Background Volumetric Red Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-gradient-to-b from-red-600/25 via-red-900/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute -top-32 right-0 w-96 h-96 bg-red-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-900/15 blur-[120px] pointer-events-none" />

      {/* Background Hero Asset with Subtle Overlay */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-screen pointer-events-none overflow-hidden">
        <Image
          src="/assets/ui/background_hero.png"
          alt="Futuristic Gaming Character"
          fill
          priority
          className="object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Typography & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-500/40 shadow-[0_0_15px_rgba(255,30,39,0.3)]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">
                NEXT-GEN SPRIBE DEMO PLATFORM
              </span>
            </div>

            {/* Giant Cinematic Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tight text-white leading-[0.95] drop-shadow-2xl">
                PLAY BEYOND <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-[#FF2E3D] to-red-700">
                  LIMITS
                </span>
              </h1>
            </div>

            {/* Supporting Text */}
            <p className="text-base sm:text-xl text-[#A0A0B5] max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              <span className="text-white font-bold">Crash. Mines. Plinko. Dice. Roulette.</span>
              <br />
              One platform. Endless possibilities. Experience next-level gameplay powered by authentic Spribe demo architecture.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                size="xl"
                href="/casino"
                glow
                className="w-full sm:w-auto"
                icon={<Play className="w-5 h-5 fill-current" />}
              >
                EXPLORE GAMES
              </Button>

              <Button
                size="xl"
                variant="glass"
                href="/games/crash"
                className="w-full sm:w-auto"
                icon={<Sparkles className="w-5 h-5 text-red-400" />}
              >
                VIEW DEMO
              </Button>
            </div>

            {/* Live demo badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#8E8E9E]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Risk-Free Demo</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-500" />
                <span>Instant Launch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-red-400 font-bold">$1,250.00</span>
                <span>Virtual Starter Credits</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Floating Mockup */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl p-1 bg-gradient-to-b from-red-500/40 via-red-900/20 to-transparent shadow-[0_0_50px_rgba(255,30,39,0.3)]">
              <div className="w-full h-full bg-[#0B0B12] rounded-[22px] overflow-hidden relative border border-white/10 flex flex-col justify-between p-6">
                {/* Visual Header */}
                <div className="flex items-center justify-between z-10">
                  <Badge variant="demo" size="md">FEATURED SPRIBE</Badge>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    ONLINE DEMO
                  </span>
                </div>

                {/* Hero Center Art Preview */}
                <div className="relative my-auto w-full aspect-square rounded-2xl overflow-hidden border border-[#252538] group">
                  <Image
                    src="/assets/games/crash.png"
                    alt="Crash Spribe Game"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="text-xs text-red-400 font-black uppercase tracking-wider">
                        Flagship Entry
                      </span>
                      <h3 className="text-2xl font-black text-white">CRASH</h3>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="z-10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8E8E9E]">
                    <span>Multiplier Peak</span>
                    <span className="text-white font-mono font-bold">10,000x</span>
                  </div>
                  <Link
                    href="/games/crash"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,30,39,0.4)] transition-all"
                  >
                    <span>Launch Crash Demo</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
