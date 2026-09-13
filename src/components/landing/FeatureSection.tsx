import React from "react";
import { ShieldCheck, Gamepad2, Smartphone, Sparkles } from "lucide-react";

export function FeatureSection() {
  const features = [
    {
      title: "DEMO EXPERIENCE",
      description: "Explore the platform in a safe demonstration environment with zero real money transactions.",
      icon: ShieldCheck,
      stat: "100% Risk Free",
      color: "text-emerald-400",
      borderGlow: "group-hover:border-emerald-500/40"
    },
    {
      title: "MULTI-GAME",
      description: "Discover multiple gaming experiences from one interface, featuring Spribe's five acclaimed titles.",
      icon: Gamepad2,
      stat: "5 Core Titles",
      color: "text-red-500",
      borderGlow: "group-hover:border-red-500/50"
    },
    {
      title: "RESPONSIVE",
      description: "Designed for desktop, tablet, and mobile with dedicated views and smooth touch controls.",
      icon: Smartphone,
      stat: "Cross Platform",
      color: "text-blue-400",
      borderGlow: "group-hover:border-blue-500/40"
    },
    {
      title: "MODERN UI",
      description: "A polished futuristic gaming experience engineered with black and red cinematic aesthetics.",
      icon: Sparkles,
      stat: "Futuristic Vibe",
      color: "text-red-400",
      borderGlow: "group-hover:border-red-500/50"
    }
  ];

  return (
    <section className="py-20 relative bg-[#07070B] border-t border-[#171724]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-red-500">
            Platform Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            BUILT FOR IMMERSIVE <span className="text-red-500">DEMONSTRATION</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8E9E]">
            Engineered from the ground up to showcase interactive Spribe titles in a sleek, responsive shell.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group p-6 rounded-2xl bg-[#0D0D14] border border-[#1F1F2E] ${f.borderGlow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#141420] border border-[#252535] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#707085] uppercase tracking-wider block mb-1">
                    {f.stat}
                  </span>
                  <h3 className="text-base font-black text-white tracking-wide mb-2 uppercase">
                    {f.title}
                  </h3>
                  <p className="text-xs text-[#8E8E9E] leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1A1A26] flex items-center justify-between text-[10px] font-mono text-[#606075]">
                  <span>ARCHITECTURE</span>
                  <span className="text-red-400 font-bold">READY</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
