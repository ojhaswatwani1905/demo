"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { Crown, CheckCircle2, ChevronRight, Award, Shield, ArrowRight } from "lucide-react";

interface VipTier {
  id: string;
  name: string;
  level: string;
  wagerRequired: string;
  cashback: string;
  perks: string[];
  color: string;
}

const VIP_TIERS: VipTier[] = [
  {
    id: "bronze",
    name: "Bronze Tier",
    level: "Level 1 – 10",
    wagerRequired: "$0 – $10,000",
    cashback: "5%",
    perks: [
      "Standard demo reload balance",
      "Access to weekly leaderboard sprint",
      "Community support channel access"
    ],
    color: "border-[#A77B51] text-[#D8A87D]"
  },
  {
    id: "silver",
    name: "Silver Tier",
    level: "Level 11 – 25",
    wagerRequired: "$10,000 – $50,000",
    cashback: "8%",
    perks: [
      "Daily simulated spin wheel",
      "8% weekly demo rakeback",
      "Priority demo server throughput"
    ],
    color: "border-[#8E95A5] text-[#C4C9D6]"
  },
  {
    id: "gold",
    name: "Gold Tier",
    level: "Level 26 – 50",
    wagerRequired: "$50,000 – $200,000",
    cashback: "12%",
    perks: [
      "Exclusive Gold-only tournament access",
      "Instant 12% virtual loss compensation",
      "Dedicated VIP concierge chat"
    ],
    color: "border-[#D4AF37] text-[#FFD700]"
  },
  {
    id: "platinum",
    name: "Platinum Tier",
    level: "Level 51 – 75",
    wagerRequired: "$200,000 – $500,000",
    cashback: "16%",
    perks: [
      "Custom multiplier challenges",
      "Weekly virtual playground grant",
      "Alpha beta tester access to new titles"
    ],
    color: "border-[#00C0A3] text-[#4EEDD2]"
  },
  {
    id: "diamond",
    name: "Diamond Tier",
    level: "Level 76+",
    wagerRequired: "$500,000+",
    cashback: "20%",
    perks: [
      "Maximum 20% instant demo cashback",
      "Bespoke high-roller simulation limits",
      "Direct channel to platform engineers"
    ],
    color: "border-red-500 text-red-400"
  }
];

export default function VipClubPage() {
  const [activeTier, setActiveTier] = useState<string>("silver");

  // Mock player VIP progression
  const currentLevel = 14;
  const currentTier = "Silver Tier";
  const progressPercent = 68;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#EDEDF0]">
      <Sidebar />

      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 lg:pb-12">
          {/* Header */}
          <div className="border-b border-[#232632] pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1F2B] border border-[#2D3344] text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider mb-2.5">
              <Crown className="w-3.5 h-3.5 text-red-500" />
              <span>VIP Loyalty Program</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              VIP Club & Loyalty Tiers
            </h1>
            <p className="text-xs sm:text-sm text-[#8E95A5] mt-1.5 max-w-2xl leading-relaxed">
              Earn virtual experience points with every demo spin. Unlock enhanced simulated rakeback, bonus spins, and exclusive VIP privileges.
            </p>
          </div>

          {/* Player Progress Card */}
          <div className="p-6 rounded-2xl bg-[#13151D] border border-[#232632] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#7A8296] font-bold block">
                  Current Player Status
                </span>
                <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                  <span>{currentTier}</span>
                  <span className="text-xs font-mono font-bold bg-[#1E222D] text-red-400 px-2 py-0.5 rounded border border-[#2E3547]">
                    Level {currentLevel}
                  </span>
                </div>
              </div>

              <div className="text-right sm:block">
                <span className="text-xs text-[#8E95A5]">Next Tier: </span>
                <strong className="text-white text-xs font-bold">Gold Tier</strong>
                <span className="text-xs text-[#7A8296] block font-mono">3,200 XP required</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-full bg-[#1A1D27] rounded-full overflow-hidden p-0.5 border border-[#252A3A]">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#7A8296]">
                <span>Progress: {progressPercent}%</span>
                <span>Tier Milestone Level 25</span>
              </div>
            </div>
          </div>

          {/* VIP Tiers Table / List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              All VIP Tiers & Benefits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIP_TIERS.map(tier => {
                const isSelected = activeTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setActiveTier(tier.id)}
                    className={`p-5 rounded-2xl bg-[#13151D] border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "border-red-500 bg-[#161924]"
                        : "border-[#232632] hover:border-[#353A4C]"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-[#181B26] border ${tier.color}`}>
                          {tier.name}
                        </span>
                        <span className="text-[11px] font-mono text-[#7A8296]">
                          {tier.level}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0E1016] border border-[#1C1F2B] flex items-center justify-between">
                        <span className="text-[11px] text-[#7A8296]">Demo Rakeback</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {tier.cashback}
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#5A6072] block">
                          Tier Benefits:
                        </span>
                        {tier.perks.map((perk, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#959CAE]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1C1F2B] text-[10px] text-[#636B7E]">
                      Simulated Turnover: {tier.wagerRequired}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demo disclaimer */}
          <div className="p-4 rounded-xl bg-[#14161E] border border-[#232632] flex items-start gap-3 text-xs text-[#8E95A5]">
            <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              VIP tiers and loyalty points are simulated records tied to demo session activity. All perks, cashbacks, and rakebacks award non-cash demonstration credits.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
