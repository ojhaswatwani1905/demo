"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { INITIAL_DEMO_ACTIVITY, DemoActivity } from "@/data/mockActivity";
import { Activity, ShieldCheck, ArrowUpRight, TrendingUp } from "lucide-react";

export function RecentActivityTicker() {
  const [activities, setActivities] = useState<DemoActivity[]>(INITIAL_DEMO_ACTIVITY);

  // Periodic simulated new demo event
  useEffect(() => {
    const samplePlayers = ["Player23", "LuckyWin", "CryptoKing", "MoonBet", "BetMaster", "CyberSamurai", "AlphaGamer"];
    const games = [
      { id: "mines", name: "Mines" },
      { id: "plinko", name: "Plinko" },
      { id: "dice", name: "Dice" },
      { id: "roulette", name: "Roulette" }
    ];

    const interval = setInterval(() => {
      const randomPlayer = samplePlayers[Math.floor(Math.random() * samplePlayers.length)];
      const randomGame = games[Math.floor(Math.random() * games.length)];
      const randomBet = [10, 25, 50, 75, 100][Math.floor(Math.random() * 5)];
      const isWin = Math.random() > 0.45;
      const multiplier = isWin ? +(1.1 + Math.random() * 6).toFixed(2) : 0;
      const payout = +(randomBet * multiplier).toFixed(2);

      const newActivity: DemoActivity = {
        id: `act-${Date.now()}`,
        player: randomPlayer,
        gameId: randomGame.id,
        gameName: randomGame.name,
        bet: randomBet,
        multiplier,
        payout,
        time: "Just now",
        isWin
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 7)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl bg-[#0B0B12] border border-[#1E1E2C] p-5 mb-10 overflow-hidden shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#1A1A26]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500" />
            <span>Simulated Live Demo Activity</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-[#78788C]">
          <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
          <span>Demo Session Stream • Sample Players</span>
        </div>
      </div>

      {/* Activity Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-medium">
          <thead>
            <tr className="text-[10px] font-mono uppercase text-[#707086] border-b border-[#161622]">
              <th className="pb-2.5 font-bold">Game</th>
              <th className="pb-2.5 font-bold">Sample Player</th>
              <th className="pb-2.5 font-bold">Simulated Bet</th>
              <th className="pb-2.5 font-bold">Multiplier</th>
              <th className="pb-2.5 font-bold text-right">Demo Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151522]">
            {activities.map(act => (
              <tr key={act.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 font-bold text-white flex items-center gap-2">
                  <Link
                    href={`/games/${act.gameId}`}
                    className="hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <span>{act.gameName}</span>
                    <ArrowUpRight className="w-3 h-3 text-[#666678]" />
                  </Link>
                </td>
                <td className="py-2.5 text-[#A0A0B2] font-mono">
                  {act.player}
                </td>
                <td className="py-2.5 font-mono text-[#8E8E9E]">
                  ${act.bet.toFixed(2)}
                </td>
                <td className="py-2.5 font-mono font-bold">
                  {act.multiplier > 0 ? (
                    <span className="text-emerald-400">{act.multiplier}x</span>
                  ) : (
                    <span className="text-red-400/70">0.00x</span>
                  )}
                </td>
                <td className="py-2.5 font-mono font-bold text-right">
                  {act.isWin ? (
                    <span className="text-emerald-400">+${act.payout.toFixed(2)}</span>
                  ) : (
                    <span className="text-[#606070]">-$0.00</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
