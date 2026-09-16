"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { Gift, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface Promotion {
  id: string | number;
  badge?: string;
  title: string;
  short_desc?: string;
  description?: string;
  long_desc?: string;
  bonus?: string;
  terms?: string;
  expires?: string;
  ctaText?: string;
  cta_text?: string;
  ctaHref?: string;
  is_active?: boolean;
}

const FALLBACK_PROMOTIONS: Promotion[] = [
  {
    id: "welcome-match",
    badge: "WELCOME OFFER",
    title: "100% Demo Deposit Match",
    description: "Double your virtual test balance on your demo wallet with up to $2,500.00 in simulated gaming credits.",
    bonus: "$1,250.00 Simulation Match",
    terms: "Strictly demonstration credit. No cash value.",
    expires: "Ongoing Demo",
    ctaText: "Play Demo Games",
    ctaHref: "/games"
  },
  {
    id: "weekend-turbo",
    badge: "WEEKEND TOURNAMENT",
    title: "Mines & Dice Sprint",
    description: "Climb the virtual leaderboard across Turbo Games titles and compete for bragging rights and demo trophies.",
    bonus: "$10,000 Demo Prize Pool",
    terms: "Leaderboard resets weekly. Simulated tournament.",
    expires: "Sunday Midnight",
    ctaText: "Play Mines",
    ctaHref: "/games/mines"
  },
  {
    id: "spribe-cashback",
    badge: "WEEKLY REBATE",
    title: "15% Simulated Cashback",
    description: "Receive automatic simulated credit reloads on European Roulette rounds throughout the week.",
    bonus: "15% Virtual Rebate",
    terms: "Calculated from virtual net loss. Demo only.",
    expires: "Weekly Reset",
    ctaText: "Play Roulette",
    ctaHref: "/games/roulette"
  },
  {
    id: "daily-drop",
    badge: "DAILY REWARDS",
    title: "Daily Pegboard Mystery Drop",
    description: "Login daily to receive simulated multiplier boosters on our physics-certified Plinko demo pegboard.",
    bonus: "Up to 555x Multiplier",
    terms: "Available once every 24 hours in demo session.",
    expires: "Refreshes Daily",
    ctaText: "Play Plinko",
    ctaHref: "/games/plinko"
  }
];

export default function PromotionsPage() {
  const { subscribe } = useRealtime();
  const [promotions, setPromotions] = useState<Promotion[]>(FALLBACK_PROMOTIONS);

  const loadPromotions = async () => {
    try {
      const res = await fetch("/api/promotions");
      if (res.ok) {
        const data = await res.json();
        if (data.promotions && data.promotions.length > 0) {
          const mapped = data.promotions.map((p: any) => ({
            id: p.id,
            badge: p.badge || "PROMOTION",
            title: p.title,
            description: p.short_desc || p.description || p.long_desc,
            bonus: p.reward_value || p.bonus || "Virtual Demo Reward",
            terms: p.terms || "Strictly demonstration credit. No cash value.",
            expires: p.end_date ? new Date(p.end_date).toLocaleDateString() : "Ongoing Demo",
            ctaText: p.cta_text || "Play Demo Games",
            ctaHref: "/games"
          }));
          setPromotions(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to load dynamic promotions:", err);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    const unsub = subscribe("PROMOTION_UPDATED", () => {
      loadPromotions();
    });
    return unsub;
  }, [subscribe]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#EDEDF0]">
      <Sidebar />

      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 lg:pb-12">
          {/* Header */}
          <div className="border-b border-[#232632] pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1F2B] border border-[#2D3344] text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider mb-2.5">
              <Gift className="w-3.5 h-3.5 text-red-500" />
              <span>Demonstration Rewards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Promotions & Special Events
            </h1>
            <p className="text-xs sm:text-sm text-[#8E95A5] mt-1.5 max-w-2xl leading-relaxed">
              Explore exclusive demonstration promotional campaigns. All rewards, prize pools, and cashbacks consist strictly of virtual playground test credits.
            </p>
          </div>

          {/* Promotion Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {promotions.map(promo => (
              <div
                key={promo.id}
                className="rounded-2xl bg-[#13151D] border border-[#232632] hover:border-red-500/50 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#1C1F2B] border border-[#2D3344] text-[10px] font-mono font-bold text-red-400">
                      {promo.badge}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6E768B] font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#5A6072]" />
                      <span>{promo.expires}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      {promo.title}
                    </h3>
                    <p className="text-xs text-[#8E95A5] mt-1 leading-relaxed">
                      {promo.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0F1117] border border-[#1E212B] flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#7E8698]">Reward Value</span>
                    <span className="text-sm font-black text-white font-mono">{promo.bonus}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1C1F2B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[10px] text-[#636B7E]">
                    {promo.terms}
                  </span>
                  <Link
                    href={promo.ctaHref || "/games"}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>{promo.ctaText || "Play Demo Games"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Demo Notice */}
          <div className="p-4 rounded-xl bg-[#14161E] border border-[#232632] flex items-start gap-3 text-xs text-[#8E95A5]">
            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              Demo promotions are intended solely for simulation entertainment and platform evaluation. No deposit, wagering requirement, or real currency payout exists on BETADRiX.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
