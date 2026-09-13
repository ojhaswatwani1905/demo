"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Play, Sparkles, Flame, Shield } from "lucide-react";

export function CasinoHero() {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#120507] via-[#0D0D14] to-[#0A0A10] border border-[#281418] p-6 sm:p-10 mb-8 shadow-2xl">
      {/* Background Volumetric Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/15 blur-[100px] pointer-events-none" />

      {/* Decorative background image overlay */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none overflow-hidden hidden md:block">
        <Image
          src="/assets/ui/background_hero.png"
          alt="Atmospheric Gamer"
          fill
          className="object-cover object-left"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D14] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[11px] font-black uppercase tracking-widest text-red-400">
          <Flame className="w-3.5 h-3.5" />
          <span>Casino Lobby • Demo Hub</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-none">
          A NEW LEVEL <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-[#FF2E3D] to-red-700">
            OF ENTERTAINMENT
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#A0A0B5] leading-relaxed">
          <strong className="text-white">Mines. Plinko. Dice. Roulette.</strong>
          <br />
          Official demonstration catalog configured for zero-risk test play and immediate launching.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            href="/games/mines"
            glow
            icon={<Play className="w-4 h-4 fill-current" />}
          >
            PLAY DEMO
          </Button>

          <Button
            size="lg"
            variant="glass"
            href="/admin"
          >
            Manage Game URLs
          </Button>
        </div>

        <div className="pt-2 flex items-center gap-4 text-xs text-[#8E8E9E]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Zero Real Money
          </span>
          <span>•</span>
          <span>4 Demo Titles</span>
        </div>
      </div>
    </div>
  );
}
