import React from "react";
import Link from "next/link";
import { Gift, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function PromotionsSection() {
  const promos = [
    {
      badge: "DEMO WELCOME",
      title: "VIRTUAL STARTER CREDITS",
      description: "Receive $1,250.00 in simulated demo balance. Test any Spribe title with limitless simulated top-ups.",
      cta: "Explore Demo Wallet",
      href: "/casino",
      accent: "from-red-600/30 to-red-950/20",
      border: "border-red-500/40",
      tagColor: "text-red-400",
      icon: ShieldCheck
    },
    {
      badge: "WEEKLY SPOTLIGHT",
      title: "SPRIBE CRASH SHOWCASE",
      description: "Experience multiplier scaling mechanics up to 10,000x with instantaneous simulated cash-out response.",
      cta: "Launch Crash Demo",
      href: "/games/crash",
      accent: "from-[#220B10] to-[#0E0E16]",
      border: "border-red-500/30 hover:border-red-500/60",
      tagColor: "text-red-300",
      icon: Zap
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Demo Highlights & Features
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase text-[#707085]">
          Sample Promotions • No Real Money
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map(promo => {
          const Icon = promo.icon;
          return (
            <div
              key={promo.title}
              className={`p-6 rounded-2xl bg-gradient-to-br ${promo.accent} border ${promo.border} transition-all duration-300 flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${promo.tagColor} px-2.5 py-0.5 rounded bg-black/40 border border-white/10`}>
                    {promo.badge}
                  </span>
                  <Icon className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                </div>

                <h4 className="text-lg font-black uppercase text-white tracking-wide mb-2">
                  {promo.title}
                </h4>

                <p className="text-xs text-[#A0A0B2] leading-relaxed">
                  {promo.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <Link
                  href={promo.href}
                  className="text-xs font-black uppercase tracking-wider text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <span>{promo.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[10px] font-mono text-emerald-400">100% Free</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
