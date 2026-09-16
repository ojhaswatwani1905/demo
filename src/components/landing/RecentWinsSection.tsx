"use client";

import React, { useState, useEffect, useRef } from "react";
import { Activity } from "lucide-react";

interface ActivityRecord {
  id?: number;
  username: string;
  game: string;
  payout_amount: number;
  multiplier: number;
  created_at?: string;
}

// Fallback initial dataset so ticker renders immediately before API responds
const INITIAL_FALLBACK_ACTIVITY: ActivityRecord[] = [
  { username: "Thomas", game: "Mines", multiplier: 4.30, payout_amount: 180.60 },
  { username: "Aiden", game: "Roulette", multiplier: 1.85, payout_amount: 109.15 },
  { username: "Emma", game: "Plinko", multiplier: 7.92, payout_amount: 510.84 },
  { username: "Greyson", game: "Plinko", multiplier: 1.50, payout_amount: 92.25 },
  { username: "Austin", game: "Roulette", multiplier: 1.85, payout_amount: 81.40 },
  { username: "Luke", game: "Mines", multiplier: 32.00, payout_amount: 1408.00 },
  { username: "Sarah", game: "Dice", multiplier: 12.40, payout_amount: 1240.00 },
  { username: "Alex", game: "Mines", multiplier: 8.42, payout_amount: 842.50 },
  { username: "Marcus", game: "Roulette", multiplier: 2.10, payout_amount: 105.00 },
  { username: "Elena", game: "Plinko", multiplier: 5.80, payout_amount: 290.00 },
  { username: "Liam", game: "Dice", multiplier: 1.85, payout_amount: 92.50 },
  { username: "Sophia", game: "Mines", multiplier: 14.50, payout_amount: 725.00 },
  { username: "David", game: "Roulette", multiplier: 3.20, payout_amount: 160.00 },
  { username: "Lucas", game: "Dice", multiplier: 24.00, payout_amount: 1200.00 },
  { username: "Olivia", game: "Plinko", multiplier: 9.60, payout_amount: 480.00 },
  { username: "Ethan", game: "Mines", multiplier: 18.20, payout_amount: 910.00 },
  { username: "Mia", game: "Dice", multiplier: 6.75, payout_amount: 337.50 },
  { username: "Noah", game: "Roulette", multiplier: 2.00, payout_amount: 200.00 }
];

export function RecentWinsSection() {
  const [activities, setActivities] = useState<ActivityRecord[]>(INITIAL_FALLBACK_ACTIVITY);
  const isMountedRef = useRef<boolean>(true);

  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/activity", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.activity) && data.activity.length > 0 && isMountedRef.current) {
        setActivities(data.activity);
      }
    } catch (err) {
      // Silently fail network error; ticker keeps running uninterrupted
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // 1. Initial fetch on mount
    fetchActivity();

    // 2. Exactly ONE API interval: once every 60 seconds (60,000ms)
    const intervalId = setInterval(() => {
      fetchActivity();
    }, 60000);

    // 3. Clean up interval on unmount to prevent duplicate intervals and memory leaks
    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="space-y-3 pt-2">
      {/* Header with ● LIVE indicator (NO "Auto-syncs 5s", NO "5s") */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-600/10 text-red-500">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>LIVE ACTIVITY & RECENT WINS</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* DESKTOP CONTINUOUS VERTICAL TICKER TABLE (md+) */}
      <div className="hidden md:block rounded-xl bg-[#13151D] border border-[#232632] overflow-hidden shadow-lg">
        {/* Stationary Fixed Header: Never moves */}
        <div className="grid grid-cols-12 px-4 py-3 bg-[#0E1016] border-b border-[#232632] text-[10px] font-mono uppercase text-[#737C8E] font-bold z-10 relative">
          <div className="col-span-4">USER</div>
          <div className="col-span-3">GAME</div>
          <div className="col-span-2">MULTIPLIER</div>
          <div className="col-span-3 text-right">PAYOUT AMOUNT</div>
        </div>

        {/* Viewport for continuously flowing rows: Slow, continuous upward translation */}
        <div className="relative h-[290px] overflow-hidden">
          {/* Subtle top and bottom fade masks for seamless entry/exit */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#13151D] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#13151D] to-transparent z-10 pointer-events-none" />

          {/* Continuous scrolling track: [DATASET] + [DATASET] */}
          <div className="animate-vertical-ticker flex flex-col">
            {/* Set A */}
            <div className="flex flex-col divide-y divide-[#1A1D27]">
              {activities.map((item, idx) => (
                <div
                  key={`set-a-${idx}-${item.username}`}
                  className="grid grid-cols-12 px-4 py-2.5 items-center text-xs hover:bg-[#181B24] transition-colors"
                >
                  <div className="col-span-4 font-bold text-white font-mono truncate">
                    {item.username}
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5 text-xs text-[#C4C9D6]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{item.game}</span>
                  </div>
                  <div className="col-span-2 font-mono font-bold text-red-400">
                    {item.multiplier.toFixed(2)}x
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-emerald-400">
                    ${item.payout_amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            {/* Set B: Identical duplicate for seamless 100% continuous loop */}
            <div className="flex flex-col divide-y divide-[#1A1D27]" aria-hidden="true">
              {activities.map((item, idx) => (
                <div
                  key={`set-b-${idx}-${item.username}`}
                  className="grid grid-cols-12 px-4 py-2.5 items-center text-xs hover:bg-[#181B24] transition-colors"
                >
                  <div className="col-span-4 font-bold text-white font-mono truncate">
                    {item.username}
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5 text-xs text-[#C4C9D6]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{item.game}</span>
                  </div>
                  <div className="col-span-2 font-mono font-bold text-red-400">
                    {item.multiplier.toFixed(2)}x
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-emerald-400">
                    ${item.payout_amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE CONTINUOUS VERTICAL TICKER (Below md) */}
      <div className="md:hidden relative h-[260px] overflow-hidden rounded-xl bg-[#13151D] border border-[#232632] shadow-lg">
        {/* Subtle top/bottom fade gradients */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#13151D] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#13151D] to-transparent z-10 pointer-events-none" />

        <div className="animate-vertical-ticker flex flex-col p-2 space-y-2">
          {/* Mobile Set A */}
          <div className="flex flex-col space-y-2">
            {activities.map((item, idx) => (
              <div
                key={`mob-a-${idx}-${item.username}`}
                className="p-2.5 rounded-lg bg-[#181B24] border border-[#232736] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white font-mono flex items-center gap-1.5">
                    <span>{item.username}</span>
                    <span className="text-[10px] text-[#737C8E]">•</span>
                    <span className="text-xs text-[#C4C9D6]">{item.game}</span>
                  </div>
                  <div className="text-[11px] font-mono text-red-400 font-bold">
                    {item.multiplier.toFixed(2)}x
                  </div>
                </div>

                <div className="text-right font-mono font-black text-emerald-400 text-xs sm:text-sm">
                  ${item.payout_amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Set B: Duplicate for seamless loop */}
          <div className="flex flex-col space-y-2" aria-hidden="true">
            {activities.map((item, idx) => (
              <div
                key={`mob-b-${idx}-${item.username}`}
                className="p-2.5 rounded-lg bg-[#181B24] border border-[#232736] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white font-mono flex items-center gap-1.5">
                    <span>{item.username}</span>
                    <span className="text-[10px] text-[#737C8E]">•</span>
                    <span className="text-xs text-[#C4C9D6]">{item.game}</span>
                  </div>
                  <div className="text-[11px] font-mono text-red-400 font-bold">
                    {item.multiplier.toFixed(2)}x
                  </div>
                </div>

                <div className="text-right font-mono font-black text-emerald-400 text-xs sm:text-sm">
                  ${item.payout_amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
