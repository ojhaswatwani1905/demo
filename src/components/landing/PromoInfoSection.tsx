"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, RefreshCw, Cpu, ArrowRight } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export function PromoInfoSection() {
  const { openWalletModal } = useWallet();

  const features = [
    {
      icon: ShieldCheck,
      badge: "RISK-FREE",
      title: "100% Free Demo Environment",
      description: "Play strictly with virtual demo balance. No real-money deposits, withdrawals, or financial wagering ever take place.",
      actionText: "Demo Policy",
      actionHref: "/#compliance"
    },
    {
      icon: Cpu,
      badge: "AUTHENTIC MECHANICS",
      title: "Direct Engine Demonstrations",
      description: "Direct integration with authorized Turbo Games & Spribe demo servers, ensuring full game rules, physics, and gameplay fidelity.",
      actionText: "Browse Providers",
      actionHref: "/games"
    },
    {
      icon: RefreshCw,
      badge: "INSTANT RESET",
      title: "Playground Balance Controls",
      description: "Top up or reset your virtual credits anytime with one click. Test different payout strategies freely without restrictions.",
      actionText: "Manage Balance",
      onClick: openWalletModal
    }
  ];

  return (
    <section id="promotions" className="pt-4 pb-2 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-[#1F222C]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Platform Overview & Demo Info
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#6A7182]">
          Safe Gaming Sandbox
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#14161E] border border-[#232632] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-mono font-bold text-red-400 bg-[#1D202B] px-2 py-0.5 rounded border border-[#2B3040]">
                    {feat.badge}
                  </span>
                  <Icon className="w-4 h-4 text-[#8E95A5]" />
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">
                  {feat.title}
                </h4>

                <p className="text-xs text-[#8E95A5] leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F222C]">
                {feat.onClick ? (
                  <button
                    onClick={feat.onClick}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <Link
                    href={feat.actionHref || "#"}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
