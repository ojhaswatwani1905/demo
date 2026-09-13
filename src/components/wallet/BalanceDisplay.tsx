"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { PlusCircle, ShieldAlert } from "lucide-react";

export function BalanceDisplay({ compact = false }: { compact?: boolean }) {
  const { balance, openWalletModal } = useWallet();

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(balance);

  if (compact) {
    return (
      <button
        onClick={openWalletModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D0D14] border border-[#222230] hover:border-red-500/50 transition-all text-xs font-semibold"
        title="Demo Balance (Click to manage)"
      >
        <span className="text-[10px] text-red-400 font-bold tracking-wider">DEMO</span>
        <span className="text-white font-mono">{formattedBalance}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center bg-[#0C0C12] border border-[#222232] rounded-xl p-1 shadow-inner">
      <div className="px-3 py-1.5 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#8E8E9E]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Demo Balance
        </div>
        <div className="text-sm sm:text-base font-extrabold text-white font-mono tracking-tight">
          {formattedBalance}
        </div>
      </div>

      <button
        onClick={openWalletModal}
        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#FF1E27] to-[#B30C19] hover:from-[#FF3342] hover:to-[#FF1E27] text-white rounded-lg text-xs font-black tracking-wider uppercase shadow-[0_0_15px_rgba(255,30,39,0.35)] transition-all active:scale-95"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        <span>Demo Deposit</span>
      </button>
    </div>
  );
}
