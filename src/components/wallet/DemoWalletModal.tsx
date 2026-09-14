"use client";

import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { Modal } from "@/components/ui/Modal";
import { ShieldCheck, AlertTriangle, RefreshCw, Plus, ArrowUpRight, DollarSign } from "lucide-react";

export function DemoWalletModal() {
  const { balance, isWalletModalOpen, closeWalletModal, demoDeposit, resetDemoBalance } = useWallet();
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  const handleDeposit = (amount: number) => {
    demoDeposit(amount);
    setDepositSuccessMsg(`Simulated +$${amount.toFixed(2)} added to Demo Balance.`);
    setTimeout(() => setDepositSuccessMsg(null), 3000);
  };

  const handleReset = () => {
    resetDemoBalance();
    setDepositSuccessMsg("Demo Balance reset to $1,250.00 default.");
    setTimeout(() => setDepositSuccessMsg(null), 3000);
  };

  return (
    <Modal
      isOpen={isWalletModalOpen}
      onClose={closeWalletModal}
      title="DEMO WALLET"
      subtitle="Simulated playground balance for demonstration purposes"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Strict Demo Warning Banner */}
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-red-400 uppercase tracking-wide">
              No Real Money — Pure Demo Environment
            </p>
            <p className="text-[#A0A0B0] leading-relaxed">
              This platform does not connect to any payment gateway, bank account, or cryptocurrency wallet.
              Funds shown are virtual demo credits for test interactions.
            </p>
          </div>
        </div>

        {/* Current Balance Display */}
        <div className="p-5 rounded-xl bg-[#14141E] border border-[#252535] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <DollarSign className="w-24 h-24 text-red-500" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#8E8E9E]">
            Current Available Demo Balance
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-1 tracking-tight">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Demo Credits Ready
          </div>
        </div>

        {depositSuccessMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 font-bold text-center animate-in fade-in">
            {depositSuccessMsg}
          </div>
        )}

        {/* Quick Demo Top-Up Options */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#B0B0C0] mb-3 block">
            Add Demo Test Funds
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[100, 250, 500, 1000].map(amount => (
              <button
                key={amount}
                onClick={() => handleDeposit(amount)}
                className="py-3 px-2 rounded-xl bg-[#171724] hover:bg-[#202030] border border-[#2A2A3E] hover:border-red-500/60 transition-all font-mono font-bold text-white text-sm flex items-center justify-center gap-1 active:scale-95 group"
              >
                <Plus className="w-3.5 h-3.5 text-red-500 group-hover:scale-125 transition-transform" />
                <span>+${amount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-xl bg-[#14141E] hover:bg-[#1E1E2C] border border-[#252535] text-xs font-bold text-[#A0A0B0] hover:text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-red-400" />
            <span>Reset Demo ($1,250.00)</span>
          </button>

          <button
            onClick={closeWalletModal}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
