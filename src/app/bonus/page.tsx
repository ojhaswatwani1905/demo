"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { useRealtime } from "@/context/RealtimeContext";
import {
  Gift,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Coins,
  ShieldCheck,
  TrendingUp,
  Info
} from "lucide-react";

export default function BonusPage() {
  const { demoDeposit, balance } = useWallet();
  const { requireAuth, user } = useAuth();
  const { subscribe } = useRealtime();

  const [faucetAmount, setFaucetAmount] = useState<number>(1000);
  const [faucetCooldownHours, setFaucetCooldownHours] = useState<number>(24);
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Time remaining countdown in seconds
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Load bonus settings from API
  const loadBonusSettings = async () => {
    try {
      const res = await fetch("/api/bonus");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          if (data.settings.daily_faucet_amount) {
            setFaucetAmount(Number(data.settings.daily_faucet_amount));
          }
          if (data.settings.faucet_cooldown_hours) {
            setFaucetCooldownHours(Number(data.settings.faucet_cooldown_hours));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load bonus settings:", err);
    }
  };

  useEffect(() => {
    loadBonusSettings();

    // Check localStorage for saved last claim timestamp
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("betadrix_faucet_last_claim");
      if (saved) {
        setLastClaimTime(Number(saved));
      }
    }
  }, []);

  useEffect(() => {
    const unsub = subscribe("BONUS_UPDATED", () => {
      loadBonusSettings();
    });
    return unsub;
  }, [subscribe]);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastClaimTime) {
        setTimeLeft(0);
        return;
      }

      const cooldownMs = faucetCooldownHours * 3600 * 1000;
      const now = Date.now();
      const elapsed = now - lastClaimTime;
      const remainingMs = cooldownMs - elapsed;

      if (remainingMs > 0) {
        setTimeLeft(Math.floor(remainingMs / 1000));
      } else {
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaimTime, faucetCooldownHours]);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const isFaucetAvailable = timeLeft === 0;

  // Handle Daily Faucet Claim with Auth Guard
  const handleClaimFaucet = () => {
    requireAuth(() => {
      if (!isFaucetAvailable) return;
      setIsClaiming(true);

      setTimeout(() => {
        demoDeposit(faucetAmount);
        const now = Date.now();
        setLastClaimTime(now);
        if (typeof window !== "undefined") {
          localStorage.setItem("betadrix_faucet_last_claim", String(now));
        }

        setIsClaiming(false);
        setNotification({
          message: `Claimed $${faucetAmount.toLocaleString()} Demo Credits successfully! Added to your balance.`,
          type: "success",
        });

        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }, 300);
    });
  };

  // Handle Clean Top-up Options with Auth Guard
  const handleTopUp = (amount: number) => {
    requireAuth(() => {
      demoDeposit(amount);
      setNotification({
        message: `Added +$${amount.toLocaleString()} demo balance to your simulator wallet!`,
        type: "success",
      });

      setTimeout(() => {
        setNotification(null);
      }, 4000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#EDEDF0]">
      <Sidebar />

      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 w-full lg:max-w-7xl lg:mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 lg:pb-12">
          {/* HEADER */}
          <div className="border-b border-[#232632] pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1F2B] border border-[#2D3344] text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider mb-2.5">
              <Gift className="w-3.5 h-3.5 text-red-500" />
              <span>REWARDS CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              BONUS CENTER
            </h1>
            <p className="text-xs sm:text-sm text-[#8E95A5] mt-1.5 max-w-2xl leading-relaxed">
              Claim your demo rewards and manage your available bonuses.
            </p>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 flex items-center justify-between text-xs sm:text-sm text-emerald-300 animate-in fade-in shadow-lg">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-[#8E95A5] hover:text-white text-xs font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* A. DAILY BONUS / FAUCET (PRIMARY FEATURED CARD) */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#141620] via-[#1A1822] to-[#12131A] border border-[#2B2D3D] p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Column: Artwork */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border border-[#3A3848] shadow-[0_0_30px_rgba(220,38,38,0.2)] shrink-0">
                  <Image
                    src="/assets/ui/bonus_faucet_gift.jpg"
                    alt="Daily Demo Faucet"
                    fill
                    sizes="(max-width: 640px) 144px, 192px"
                    className="object-cover object-center"
                    priority
                  />
                </div>
              </div>

              {/* Right Column: Information & Action */}
              <div className="md:col-span-8 space-y-4 text-center md:text-left">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 font-mono text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DAILY FAUCET</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1.5">
                    Get ${faucetAmount.toLocaleString()} Demo
                  </h2>

                  <p className="text-xs sm:text-sm text-[#8E95A5] mt-1">
                    Complimentary reload grant renewed every {faucetCooldownHours} hours.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  {/* Claim Button */}
                  <button
                    onClick={handleClaimFaucet}
                    disabled={!isFaucetAvailable || isClaiming}
                    className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                      isFaucetAvailable
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-pointer"
                        : "bg-[#1C1F2B] border border-[#2B3142] text-[#7A8296] cursor-not-allowed"
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>
                      {isClaiming
                        ? "Crediting Demo..."
                        : isFaucetAvailable
                        ? "Claim Now"
                        : "Cooldown Active"}
                    </span>
                  </button>

                  {/* Status Indicator / Countdown */}
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8E95A5] bg-[#0E1016] px-3.5 py-2.5 rounded-xl border border-[#1E212D]">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    <span>
                      {isFaucetAvailable
                        ? "Ready to claim"
                        : `Available in ${formatCountdown(timeLeft)}`}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#636B7E] font-mono">
                  Current simulated balance: ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* GRID OF DEMO TOP-UP AND BONUS MULTIPLIER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* B. DEMO TOP-UP OPTIONS */}
            <div className="rounded-2xl bg-[#11131A] border border-[#222634] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                    Demo Top-Up
                  </h3>
                </div>
                <p className="text-xs text-[#8E95A5]">
                  Add simulated demo balance instantly to practice different stake strategies.
                </p>
              </div>

              {/* Clean Button Options: + $500, + $1,000, + $5,000 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[500, 1000, 5000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleTopUp(amount)}
                    className="py-3 px-3 rounded-xl bg-[#161822] hover:bg-red-600 border border-[#282C3B] hover:border-red-500 text-white font-black text-xs font-mono uppercase tracking-wider transition-all shadow-sm cursor-pointer text-center group"
                  >
                    <span className="block text-white group-hover:scale-105 transition-transform">
                      + ${amount.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-[#636B7E] pt-2 border-t border-[#1C1F2B] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#5A6072] shrink-0" />
                <span>Simulated demo funds with zero commercial value.</span>
              </div>
            </div>

            {/* C. BONUS MULTIPLIER (1.5x Active) */}
            <div className="rounded-2xl bg-[#11131A] border border-[#222634] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                      Bonus Multiplier
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#8E95A5]">
                  Boost your demonstration gameplay with platform-wide simulated multipliers.
                </p>
              </div>

              {/* Multiplier Display */}
              <div className="p-4 rounded-xl bg-[#0E1016] border border-[#1E212D] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#7A8296] uppercase block">
                    Current Global Boost
                  </span>
                  <div className="text-2xl font-black text-white font-mono flex items-center gap-1.5">
                    <span className="text-emerald-400">1.5x</span>
                    <span className="text-xs text-[#8E95A5] font-normal">On Selected Titles</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="text-[11px] text-[#636B7E] pt-2 border-t border-[#1C1F2B]">
                Active on Mines & European Roulette demo sessions.
              </div>
            </div>
          </div>

          {/* D. BONUS TERMS & INFORMATION */}
          <div className="rounded-2xl bg-[#0E1016] border border-[#202330] p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Bonus Center Terms & Guidelines
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#8E95A5] leading-relaxed">
              <div className="space-y-1">
                <strong className="text-white block font-semibold">100% Complimentary</strong>
                <p>All bonus allocations are granted entirely free of charge with no deposit requirements or billing.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-white block font-semibold">Virtual Simulation Only</strong>
                <p>Credits cannot be withdrawn, traded, or redeemed for real money under any circumstances.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-white block font-semibold">Session Availability</strong>
                <p>Daily Faucet refreshes every 24 hours per player session. Demo top-ups can be utilized at any time.</p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
