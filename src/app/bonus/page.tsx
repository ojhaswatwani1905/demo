"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@/context/WalletContext";
import { Sparkles, Check, Clock, ShieldCheck, Gift } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface BonusOffer {
  id: string;
  tag: string;
  title: string;
  reward: string;
  amount: number;
  requirement: string;
  description: string;
  claimed: boolean;
}

export default function BonusPage() {
  const { demoDeposit } = useWallet();
  const { subscribe } = useRealtime();

  const [offers, setOffers] = useState<BonusOffer[]>([
    {
      id: "daily-bonus",
      tag: "DAILY REWARD",
      title: "Daily Virtual Playground Grant",
      reward: "+$1,000.00 Demo Credit",
      amount: 1000,
      requirement: "Claimable every 24 hours",
      description: "Top up your demonstration wallet with a fresh reload of complimentary simulated credits.",
      claimed: false
    },
    {
      id: "weekend-turbo",
      tag: "WEEKEND BOOST",
      title: "Turbo Games Multiplier Booster",
      reward: "+$500.00 Demo Credit",
      amount: 500,
      requirement: "Weekend demo session active",
      description: "Special weekend demonstration balance boost valid across Mines and Dice.",
      claimed: false
    },
    {
      id: "spribe-drop",
      tag: "TABLE SPECIAL",
      title: "Spribe Classic Reload",
      reward: "+$350.00 Demo Credit",
      amount: 350,
      requirement: "Available for European Roulette and Plinko",
      description: "Complimentary simulation package for testing roulette strategies and plinko risk distributions.",
      claimed: false
    }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const loadBonusSettings = async () => {
    try {
      const res = await fetch("/api/bonus");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          const faucetAmt = Number(data.settings.daily_faucet_amount || 1000);
          const cooldown = Number(data.settings.faucet_cooldown_hours || 24);
          setOffers(prev =>
            prev.map(o => {
              if (o.id === "daily-bonus") {
                return {
                  ...o,
                  amount: faucetAmt,
                  reward: `+$${faucetAmt.toFixed(2)} Demo Credit`,
                  requirement: `Claimable every ${cooldown} hours`
                };
              }
              return o;
            })
          );
        }
      }
    } catch (err) {
      console.error("Failed to load bonus settings:", err);
    }
  };

  useEffect(() => {
    loadBonusSettings();
  }, []);

  useEffect(() => {
    const unsub = subscribe("BONUS_UPDATED", () => {
      loadBonusSettings();
    });
    return unsub;
  }, [subscribe]);

  const handleClaim = (id: string, amount: number, title: string) => {
    // Add simulated credit to demo balance
    demoDeposit(amount);

    // Update claimed state
    setOffers(prev =>
      prev.map(o => (o.id === id ? { ...o, claimed: true } : o))
    );

    setNotification(`Successfully claimed ${title}! Added $${amount.toFixed(2)} to demo balance.`);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#EDEDF0]">
      <Sidebar />

      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 lg:pb-12">
          {/* Header */}
          <div className="border-b border-[#232632] pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1F2B] border border-[#2D3344] text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Demo Bonus Offers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Bonus Center & Test Grants
            </h1>
            <p className="text-xs sm:text-sm text-[#8E95A5] mt-1.5 max-w-2xl leading-relaxed">
              Claim instant demonstration balance top-ups directly to your virtual demo wallet. Practice game mechanics and test simulation strategies.
            </p>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{notification}</span>
              </div>
            </div>
          )}

          {/* Bonus Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {offers.map(offer => (
              <div
                key={offer.id}
                className="rounded-2xl bg-[#13151D] border border-[#232632] hover:border-red-500/40 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 rounded bg-[#1C1F2B] border border-[#2D3344] text-[10px] font-mono font-bold text-red-400">
                    {offer.tag}
                  </span>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-[#8E95A5] mt-1 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0E1016] border border-[#1E212B] flex items-center justify-between">
                    <span className="text-xs text-[#7A8296]">Simulated Grant</span>
                    <span className="text-sm font-black text-white font-mono">
                      {offer.reward}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#636B7E]">
                    <Clock className="w-3.5 h-3.5 text-[#5A6072]" />
                    <span>{offer.requirement}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1C1F2B]">
                  {offer.claimed ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-lg bg-[#181B24] border border-[#252A38] text-[#7A8296] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Claimed for Session</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClaim(offer.id, offer.amount, offer.title)}
                      className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Claim Demo Bonus</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Disclaimer */}
          <div className="p-4 rounded-xl bg-[#14161E] border border-[#232632] flex items-start gap-3 text-xs text-[#8E95A5]">
            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              Bonus grants consist strictly of simulated demonstration credits with zero cash value. No real currency transaction or deposit requirement is associated with claiming bonuses on this platform.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
