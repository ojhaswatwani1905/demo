import React from "react";
import { GameConfig } from "@/config/games";
import { ShieldCheck, Info, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

export function GameInfo({ game }: { game: GameConfig }) {
  return (
    <div className="space-y-6">
      {/* Game Spec Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0D0D14] border border-[#1E1E2C]">
          <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94] block mb-1">
            Provider
          </span>
          <span className="text-sm font-black text-white">{game.provider}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0D0D14] border border-[#1E1E2C]">
          <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94] block mb-1">
            Theoretical RTP
          </span>
          <span className="text-sm font-black text-emerald-400 font-mono">{game.rtp}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0D0D14] border border-[#1E1E2C]">
          <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94] block mb-1">
            Demo Bet Range
          </span>
          <span className="text-sm font-black text-white font-mono">{game.minBet} - {game.maxBet}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0D0D14] border border-[#1E1E2C]">
          <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94] block mb-1">
            Peak Multiplier
          </span>
          <span className="text-sm font-black text-red-400 font-mono">{game.maxMultiplier}</span>
        </div>
      </div>

      {/* Description */}
      <div className="p-5 rounded-2xl bg-[#0B0B12] border border-[#1F1F2C] space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
          <Info className="w-4 h-4 text-red-500" />
          <span>About {game.name} Demo</span>
        </div>
        <p className="text-xs sm:text-sm text-[#A0A0B5] leading-relaxed">
          {game.description}
        </p>
      </div>

      {/* Safe Demo Notice Banner */}
      <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-red-400 uppercase tracking-wide">
            100% Demonstration Environment
          </p>
          <p className="text-[#8E8E9E] leading-relaxed">
            All gameplay, credits, and outcomes are simulated for demonstration purposes.
            No real currency transactions or wagering occur on this platform.
          </p>
        </div>
      </div>
    </div>
  );
}
