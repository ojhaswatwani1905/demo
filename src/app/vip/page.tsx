"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { useRealtime } from "@/context/RealtimeContext";
import {
  Crown,
  CheckCircle2,
  Shield,
  Sparkles,
  ArrowRight,
  Gift,
  Zap,
  Headphones,
  Award,
  ChevronRight
} from "lucide-react";

interface VipTier {
  id: string;
  name: string;
  level: string;
  wagerRequired: string;
  cashback: string;
  description: string;
  perks: string[];
  isGold?: boolean;
}

const STATIC_TIERS: VipTier[] = [
  {
    id: "bronze",
    name: "BRONZE",
    level: "Tier 1 (Levels 1–10)",
    wagerRequired: "$0 – $10,000",
    cashback: "5% Demo Cashback",
    description: "Your starting milestone in the BETADRiX demo loyalty program.",
    perks: [
      "Standard daily demo reload",
      "Access to weekly leaderboard sprint",
      "Community support channel access",
    ],
  },
  {
    id: "silver",
    name: "SILVER",
    level: "Tier 2 (Levels 11–25)",
    wagerRequired: "$10,000 – $50,000",
    cashback: "8% Demo Cashback",
    description: "Enhanced demonstration limits and accelerated demo reward rates.",
    perks: [
      "Daily simulated spin boost",
      "8% weekly demo rakeback",
      "Priority demo server throughput",
    ],
  },
  {
    id: "gold",
    name: "GOLD",
    level: "Tier 3 (Levels 26–50)",
    wagerRequired: "$50,000 – $200,000",
    cashback: "12% Demo Cashback",
    description: "The distinguished Gold circle with premium demo privileges and direct concierge.",
    isGold: true,
    perks: [
      "Exclusive Gold-only demo tournaments",
      "Instant 12% virtual loss compensation",
      "Priority VIP desk & concierge chat",
      "Special demonstration multiplier events",
    ],
  },
  {
    id: "platinum",
    name: "PLATINUM",
    level: "Tier 4 (Levels 51+)",
    wagerRequired: "$200,000+",
    cashback: "16% Demo Cashback",
    description: "The peak demonstration status reserved for high-activity test simulators.",
    perks: [
      "Custom multiplier simulator challenges",
      "Complimentary high-roller playground reloads",
      "Early preview access to new game titles",
      "Direct communication channel to engineers",
    ],
  },
];

export default function VipPage() {
  const { subscribe } = useRealtime();
  const [tiers, setTiers] = useState<VipTier[]>(STATIC_TIERS);
  const [selectedTier, setSelectedTier] = useState<string>("gold");

  const loadTiers = async () => {
    try {
      const res = await fetch("/api/vip");
      if (res.ok) {
        const data = await res.json();
        if (data.tiers && data.tiers.length > 0) {
          const mapped: VipTier[] = [
            {
              id: "bronze",
              name: "BRONZE",
              level: "Tier 1 (Levels 1–10)",
              wagerRequired: "$0 – $10,000",
              cashback: "5% Demo Cashback",
              description: "Your starting milestone in the BETADRiX demo loyalty program.",
              perks: [
                "Standard daily demo reload",
                "Access to weekly leaderboard sprint",
                "Community support channel access",
              ],
            },
            {
              id: "silver",
              name: "SILVER",
              level: "Tier 2 (Levels 11–25)",
              wagerRequired: "$10,000 – $50,000",
              cashback: "8% Demo Cashback",
              description: "Enhanced demonstration limits and accelerated demo reward rates.",
              perks: [
                "Daily simulated spin boost",
                "8% weekly demo rakeback",
                "Priority demo server throughput",
              ],
            },
            {
              id: "gold",
              name: "GOLD",
              level: "Tier 3 (Levels 26–50)",
              wagerRequired: "$50,000 – $200,000",
              cashback: "12% Demo Cashback",
              description: "The distinguished Gold circle with premium demo privileges and direct concierge.",
              isGold: true,
              perks: [
                "Exclusive Gold-only demo tournaments",
                "Instant 12% virtual loss compensation",
                "Priority VIP desk & concierge chat",
                "Special demonstration multiplier events",
              ],
            },
            {
              id: "platinum",
              name: "PLATINUM",
              level: "Tier 4 (Levels 51+)",
              wagerRequired: "$200,000+",
              cashback: "16% Demo Cashback",
              description: "The peak demonstration status reserved for high-activity test simulators.",
              perks: [
                "Custom multiplier simulator challenges",
                "Complimentary high-roller playground reloads",
                "Early preview access to new game titles",
                "Direct communication channel to engineers",
              ],
            },
          ];
          setTiers(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dynamic VIP tiers:", err);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

  useEffect(() => {
    const unsub = subscribe("VIP_TIER_UPDATED", () => {
      loadTiers();
    });
    return unsub;
  }, [subscribe]);

  // Player progress simulation
  const currentTier = "Silver";
  const nextTier = "Gold";
  const currentLevel = 14;
  const progressPercent = 68;
  const xpNeeded = "3,200 XP";

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#EDEDF0]">
      <Sidebar />

      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 w-full lg:max-w-7xl lg:mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-28 lg:pb-12">
          {/* A. VIP HERO: More Rewards. More Benefits. */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#12141C] via-[#1B1612] to-[#12141C] border border-[#2B2720] p-6 sm:p-10 shadow-2xl">
            {/* Background Glow */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>VIP LOYALTY EXPERIENCE</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-none">
                  BECOME A VIP
                </h1>

                <p className="text-sm sm:text-base text-[#D4AF37] font-semibold">
                  More Rewards. More Benefits.
                </p>

                <p className="text-xs sm:text-sm text-[#8E95A5] leading-relaxed">
                  Unlock simulated rakeback, personalized demo boosts, and high-roller testing privileges as you advance through demonstration loyalty tiers.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link
                    href="/games"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2"
                  >
                    <span>Play Demo Games</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#tiers"
                    className="px-4 py-2.5 rounded-xl bg-[#181B26] hover:bg-[#202534] border border-[#2A3042] text-white font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    View All Tiers
                  </a>
                </div>
              </div>

              {/* Hero Crown Artwork */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent blur-xl" />
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <Image
                    src="/assets/ui/vip_gold_crown.jpg"
                    alt="VIP Gold Crown"
                    fill
                    sizes="(max-width: 768px) 180px, 240px"
                    className="object-cover object-center"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* E. USER VIP PROGRESSION */}
          <div className="p-6 rounded-2xl bg-[#11131A] border border-[#222634] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#7A8296] font-bold block">
                  Current Player Status
                </span>
                <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 mt-0.5">
                  <span>{currentTier} Tier</span>
                  <span className="text-xs font-mono font-bold bg-[#1C1F2B] text-amber-400 px-2 py-0.5 rounded border border-[#2D3344]">
                    Level {currentLevel}
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-[#8E95A5]">Next Milestone: </span>
                <strong className="text-amber-400 text-xs font-bold uppercase">{nextTier} Tier</strong>
                <span className="text-xs text-[#7A8296] block font-mono mt-0.5">
                  {xpNeeded} to level up
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-[#161822] rounded-full overflow-hidden p-0.5 border border-[#262B3B]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#7A8296]">
                <span>Progress: {progressPercent}%</span>
                <span>Tier Milestone Level 25</span>
              </div>
            </div>
          </div>

          {/* C. SPECIAL FEATURED GOLD TIER CARD */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#251D0C] via-[#1A150A] to-[#100E07] border-2 border-amber-500/60 p-6 sm:p-8 shadow-[0_0_35px_rgba(245,158,11,0.18)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Image & Badge */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.3)] shrink-0">
                  <Image
                    src="/assets/ui/vip_gold_crown.jpg"
                    alt="VIP Gold Crown Distinctive"
                    fill
                    sizes="(max-width: 640px) 130px, 160px"
                    className="object-cover object-center"
                  />
                </div>

                <div className="text-center sm:text-left space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs font-black">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>FEATURED TIER</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-amber-300 uppercase tracking-tight">
                    VIP GOLD
                  </h2>
                  <p className="text-xs text-amber-200/80 font-semibold">
                    Play More. Get More.
                  </p>
                  <div className="text-[11px] font-mono text-[#A39268] pt-1">
                    Turnover: $50,000 – $200,000
                  </div>
                </div>
              </div>

              {/* Middle Column: Benefits List */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  Gold Privileges:
                </span>
                <div className="space-y-1.5">
                  {[
                    "Higher Demo Bonuses & Weekly Grants",
                    "Dedicated VIP Concierge Assistance",
                    "Exclusive Gold-Only Tournaments",
                    "Instant 12% Virtual Loss Compensation",
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#E5D7B7]">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: CTA */}
              <div className="lg:col-span-3 flex flex-col items-center sm:items-end justify-center">
                <Link
                  href="/games"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] text-center"
                >
                  Upgrade to Gold
                </Link>
                <span className="text-[10px] font-mono text-[#A39268] mt-2">
                  Simulation milestone
                </span>
              </div>
            </div>
          </div>

          {/* B. ALL VIP TIERS (Bronze, Silver, Gold, Platinum) */}
          <div id="tiers" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  VIP Membership Tiers
                </h2>
                <p className="text-xs text-[#8E95A5] mt-0.5">
                  Compare tier criteria and unlocked simulation perks
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map(tier => {
                const isSelected = selectedTier === tier.id;
                const isGoldTier = tier.isGold;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all cursor-pointer ${
                      isGoldTier
                        ? "bg-[#1E190E] border-2 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                        : isSelected
                        ? "bg-[#161822] border-2 border-red-500"
                        : "bg-[#11131A] border border-[#222634] hover:border-[#353A4C]"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Tier Top Meta */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded ${
                            isGoldTier
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : tier.id === "platinum"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : tier.id === "silver"
                              ? "bg-slate-500/20 text-slate-300 border border-slate-500/40"
                              : "bg-amber-900/30 text-amber-400 border border-amber-800/40"
                          }`}
                        >
                          {tier.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#7A8296]">{tier.level}</span>
                      </div>

                      {/* Cashback Metric */}
                      <div
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isGoldTier
                            ? "bg-[#141108] border-amber-500/30"
                            : "bg-[#0E1016] border-[#1C1F2B]"
                        }`}
                      >
                        <span className="text-[11px] text-[#7A8296]">Demo Rakeback</span>
                        <span
                          className={`text-sm font-black font-mono ${
                            isGoldTier ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {tier.cashback}
                        </span>
                      </div>

                      <p className="text-xs text-[#8E95A5] leading-relaxed">
                        {tier.description}
                      </p>

                      {/* Benefits Checklist */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#636B7E] block">
                          Included Perks:
                        </span>
                        {tier.perks.map((perk, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#959CAE]">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                isGoldTier ? "text-amber-400" : "text-red-500"
                              }`}
                            />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1C1F2B] text-[10px] text-[#636B7E] font-mono">
                      Turnover: {tier.wagerRequired}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* D. VIP BENEFITS GRID */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                VIP Benefits & Privileges
              </h2>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                Elevate your demo gaming experience with exclusive player advantages
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#11131A] border border-[#222634] space-y-2.5">
                <div className="p-2 rounded-xl bg-red-600/10 text-red-500 w-fit">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  Better Demo Rewards
                </h3>
                <p className="text-xs text-[#8E95A5] leading-relaxed">
                  Higher daily faucet allowances and weekly reload allocations tailored to active test simulators.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#11131A] border border-[#222634] space-y-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  VIP Promotions
                </h3>
                <p className="text-xs text-[#8E95A5] leading-relaxed">
                  Access tier-exclusive demonstration multiplier challenges and seasonal simulator leaderboard sprints.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#11131A] border border-[#222634] space-y-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  Priority Support
                </h3>
                <p className="text-xs text-[#8E95A5] leading-relaxed">
                  Direct live assistance with faster response times on official Telegram and WhatsApp channels.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#11131A] border border-[#222634] space-y-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  Special Events
                </h3>
                <p className="text-xs text-[#8E95A5] leading-relaxed">
                  Early beta access to new titles from Turbo Games and Spribe before broad lobby deployment.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#11131A] border border-[#222634] space-y-2.5 sm:col-span-2 lg:col-span-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  Loyalty Benefits & Level Milestones
                </h3>
                <p className="text-xs text-[#8E95A5] leading-relaxed">
                  Every simulated round logs XP towards milestone achievement badges. All loyalty points, rakebacks, and rank rewards are strictly virtual demonstration credits.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="p-4 rounded-xl bg-[#14161E] border border-[#232632] flex items-start gap-3 text-xs text-[#8E95A5]">
            <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              VIP tiers, points, and rakebacks are simulated loyalty metrics tied to demo gameplay sessions. No cash deposits, wagering turnover, or monetary rewards are supported.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
