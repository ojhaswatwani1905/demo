"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { PlusCircle } from "lucide-react";

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
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14161E] border border-[#232632] hover:border-red-500/50 transition-colors text-xs font-semibold"
        title="Demo Balance (Click to manage)"
      >
        <span className="text-[10px] text-red-400 font-mono font-bold">DEMO</span>
        <span className="text-white font-mono text-xs">{formattedBalance}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center bg-[#14161E] border border-[#232632] rounded-lg p-0.5">
      <div className="px-2.5 py-1 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#7E8597]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Demo Balance
        </div>
        <div className="text-xs sm:text-sm font-bold text-white font-mono leading-none mt-0.5">
          {formattedBalance}
        </div>
      </div>

      <button
        onClick={openWalletModal}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold transition-colors"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        <span>Top Up</span>
      </button>
    </div>
  );
}
