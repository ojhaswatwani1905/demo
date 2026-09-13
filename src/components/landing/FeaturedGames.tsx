"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Cpu } from "lucide-react";

export function FeaturedGames() {
  const pillars = [
    {
      id: "physics",
      icon: Zap,
      title: "Dynamic Multipliers",
      subtitle: "Instant Curve Physics",
      description: "Real-time parabolic multipliers accelerating up to 10,000x with provably fair crash algorithms.",
      metric: "10,000x",
      metricLabel: "Max Multiplier",
    },
    {
      id: "tactical",
      icon: ShieldCheck,
      title: "Tactical Risk Grids",
      subtitle: "Deterministic Logic",
      description: "Customizable risk matrices across Mines and Plinko with mathematical certainty and zero latency.",
      metric: "97.00%",
      metricLabel: "Theoretical RTP",
    },
    {
      id: "crypto",
      icon: Cpu,
      title: "Cryptographic Tables",
      subtitle: "Rapid Settlement",
      description: "Instant probability evaluation on Dice and European Roulette engineered for lightning micro-rounds.",
      metric: "< 15ms",
      metricLabel: "Tick Latency",
    },
  ];

  return (
    <section id="featured" className="py-12 sm:py-16 relative bg-[#06060A] border-t border-[#14141E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] text-red-500 uppercase font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>SPRIBE ARCHITECTURE // PLATFORM ECOSYSTEM</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              ENGINEERED FOR <span className="text-red-500">PRECISION</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E9E] mt-1 max-w-lg">
              Authorized Spribe demonstration mechanics. Explore real crash curves, deterministic grids, and instant tables.
            </p>
          </div>

          <a
            href="#casino-platform"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-400 hover:text-white group shrink-0"
          >
            <span>Enter Casino Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-red-500" />
          </a>
        </div>

        {/* 3 Architecture Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative rounded-xl bg-[#090A10] border border-[#181926] hover:border-red-500/60 p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,30,39,0.15)] flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-white group-hover:text-red-400 transition-colors">
                        {item.metric}
                      </div>
                      <div className="text-[10px] font-mono text-[#707085] uppercase">
                        {item.metricLabel}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <div className="text-xs font-mono text-red-500 font-semibold mb-1.5">
                      {item.subtitle}
                    </div>
                    <p className="text-xs text-[#8E8E9E] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
