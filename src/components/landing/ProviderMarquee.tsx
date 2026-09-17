"use client";

import React from "react";
import { ShieldCheck, Cpu, Lock, CheckCircle, Flame } from "lucide-react";

// Turbo Games Logo Component
function TurboGamesLogo() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#13151D] border border-[#202433] hover:border-red-500/40 transition-colors shrink-0">
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#1C1F2B" stroke="#DC2626" strokeWidth="2.5" />
        <path
          d="M20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32C24.4183 32 28.268 29.617 30.3478 26.068C29.1554 26.666 27.8105 27 26.3889 27C21.498 27 17.5342 23.0362 17.5342 18.1453C17.5342 14.218 20.0906 10.8978 23.6522 9.7188C22.4839 8.62319 20.9238 8 20 8Z"
          fill="#EF4444"
        />
        <circle cx="20" cy="20" r="4" fill="#FFFFFF" />
      </svg>
      <div className="flex flex-col">
        <span className="text-xs font-black tracking-wider text-white uppercase font-sans">
          TURBO <span className="text-red-500">GAMES</span>
        </span>
        <span className="text-[9px] font-mono text-[#7A8296] -mt-0.5">Mines • Dice Originals</span>
      </div>
    </div>
  );
}

// Spribe Logo Component
function SpribeLogo() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#13151D] border border-[#202433] hover:border-amber-500/40 transition-colors shrink-0">
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-black text-xs font-mono shadow-sm shrink-0">
        S
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-black tracking-widest text-white uppercase font-sans">
          SPRIBE
        </span>
        <span className="text-[9px] font-mono text-[#7A8296] -mt-0.5">Roulette • Plinko Studio</span>
      </div>
    </div>
  );
}

// Trust Badge Item
function TrustBadge({
  icon: Icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#11131A] border border-[#1E222D] shrink-0">
      <div className={`p-1 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-[#EDEDF0]">{title}</span>
        <span className="text-[9px] font-mono text-[#6A7182]">{subtitle}</span>
      </div>
    </div>
  );
}

export function ProviderMarquee() {
  const rowOneItems = [
    <TurboGamesLogo key="t1" />,
    <TrustBadge
      key="b1"
      icon={ShieldCheck}
      title="Provably Fair"
      subtitle="Cryptographic Verification"
      color="text-emerald-400 bg-emerald-950/40 border border-emerald-500/30"
    />,
    <SpribeLogo key="s1" />,
    <TrustBadge
      key="b2"
      icon={Cpu}
      title="RNG Technology"
      subtitle="Certified Math Models"
      color="text-cyan-400 bg-cyan-950/40 border border-cyan-500/30"
    />,
    <TurboGamesLogo key="t2" />,
    <TrustBadge
      key="b3"
      icon={Lock}
      title="Secure & Isolated"
      subtitle="No Payment Gateways"
      color="text-red-400 bg-red-950/40 border border-red-500/30"
    />,
    <SpribeLogo key="s2" />,
    <TrustBadge
      key="b4"
      icon={CheckCircle}
      title="18+ Demo Simulator"
      subtitle="Responsible Testing"
      color="text-amber-400 bg-amber-950/40 border border-amber-500/30"
    />,
  ];

  const rowTwoItems = [
    <SpribeLogo key="s3" />,
    <TrustBadge
      key="b5"
      icon={Cpu}
      title="Audited Engines"
      subtitle="Original Studio Servers"
      color="text-cyan-400 bg-cyan-950/40 border border-cyan-500/30"
    />,
    <TurboGamesLogo key="t3" />,
    <TrustBadge
      key="b6"
      icon={ShieldCheck}
      title="Seed Transparency"
      subtitle="Client & Server Hashes"
      color="text-emerald-400 bg-emerald-950/40 border border-emerald-500/30"
    />,
    <SpribeLogo key="s4" />,
    <TrustBadge
      key="b7"
      icon={Flame}
      title="Realtime Physics"
      subtitle="Direct Provider WebGL"
      color="text-red-400 bg-red-950/40 border border-red-500/30"
    />,
    <TurboGamesLogo key="t4" />,
    <TrustBadge
      key="b8"
      icon={Lock}
      title="Zero Financial Risk"
      subtitle="Pure Virtual Simulation"
      color="text-purple-400 bg-purple-950/40 border border-purple-500/30"
    />,
  ];

  return (
    <section className="w-full rounded-2xl bg-[#0C0D12] border border-[#1E212D] p-5 sm:p-6 space-y-4 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1A1D27]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-red-500 rounded-full" />
          <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
            TRUSTED GAME PROVIDERS
          </h2>
        </div>
        <p className="text-[11px] text-[#7A8296] font-mono">
          Authentic titles directly powered by Turbo Games & Spribe
        </p>
      </div>

      {/* Marquee Section with fade masks on edges */}
      <div className="relative w-full overflow-hidden py-1 space-y-3">
        {/* Left & Right gradient edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0C0D12] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#0C0D12] to-transparent z-10 pointer-events-none" />

        {/* Row 1: Continuously moving left */}
        <div className="overflow-hidden flex w-full">
          <div className="animate-marquee-left flex items-center gap-4">
            {rowOneItems}
            {rowOneItems}
          </div>
        </div>

        {/* Row 2: Continuously moving right */}
        <div className="overflow-hidden flex w-full">
          <div className="animate-marquee-right flex items-center gap-4">
            {rowTwoItems}
            {rowTwoItems}
          </div>
        </div>
      </div>
    </section>
  );
}
