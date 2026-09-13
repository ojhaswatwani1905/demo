"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Play, Sparkles, ShieldCheck } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 relative bg-[#050508] overflow-hidden border-t border-[#171724]">
      {/* Red Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-600/10 blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-xs font-black uppercase tracking-widest text-red-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero Real-Money Risk</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
          READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-[#FF2E3D] to-red-600">PLAY?</span>
        </h2>

        <p className="text-sm sm:text-base text-[#A0A0B5] max-w-xl mx-auto leading-relaxed">
          Explore the demo experience. Jump directly into Mines, Plinko, Dice, and Roulette.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="xl"
            href="/casino"
            glow
            className="w-full sm:w-auto"
            icon={<Play className="w-5 h-5 fill-current" />}
          >
            EXPLORE DEMO
          </Button>

          <Button
            size="xl"
            variant="glass"
            href="/admin"
            className="w-full sm:w-auto"
          >
            CONFIGURE URLS
          </Button>
        </div>

        <div className="pt-6 flex items-center justify-center gap-2 text-xs text-[#707085]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>All games operate under authorized demonstration guidelines</span>
        </div>
      </div>
    </section>
  );
}
