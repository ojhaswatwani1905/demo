import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#050508] border-t border-[#1C1C28] overflow-hidden pt-16 pb-24 lg:pb-16 text-[#8E8E9E]">
      {/* Red ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-32 bg-red-600/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1A1A26]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo />
            <p className="text-xs sm:text-sm text-[#8E8E9E] leading-relaxed max-w-sm">
              Next-generation cinematic gaming and casino demonstration architecture.
              Engineered to showcase authorized Spribe demo games in a safe, risk-free simulation shell.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 text-xs text-red-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Strictly 100% Demonstration Mode</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Demo Games
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/games/mines" className="hover:text-red-400 transition-colors">
                  Mines (Turbo Games)
                </Link>
              </li>
              <li>
                <Link href="/games/plinko" className="hover:text-red-400 transition-colors">
                  Plinko (Spribe)
                </Link>
              </li>
              <li>
                <Link href="/games/dice" className="hover:text-red-400 transition-colors">
                  Dice (Turbo Games)
                </Link>
              </li>
              <li>
                <Link href="/games/roulette" className="hover:text-red-400 transition-colors">
                  Roulette (Spribe)
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/casino" className="hover:text-red-400 transition-colors">
                  Casino Lobby
                </Link>
              </li>
              <li>
                <Link href="/#featured" className="hover:text-red-400 transition-colors">
                  Featured Games
                </Link>
              </li>
              <li>
                <Link href="/#showcase" className="hover:text-red-400 transition-colors">
                  Game Showcase
                </Link>
              </li>
              <li>
                <Link href="/#promotions" className="hover:text-red-400 transition-colors">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-red-400 transition-colors">
                  Admin Demo Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Legal / Demo Notice */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Compliance
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <span className="text-[#68687A] cursor-not-allowed">Responsible Gaming Demo</span>
              </li>
              <li>
                <span className="text-[#68687A] cursor-not-allowed">Terms of Demonstration</span>
              </li>
              <li>
                <span className="text-[#68687A] cursor-not-allowed">Privacy Policy</span>
              </li>
              <li>
                <span className="text-[#68687A] cursor-not-allowed">Security Protocol</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Legal Demo Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#7C7C90]">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="leading-normal">
              <strong>Demo platform — no real-money transactions.</strong> This website is a demonstration interface.
              No real-money betting, deposits, withdrawals, or financial transactions are conducted.
            </p>
          </div>

          <p className="text-[11px] font-mono text-[#555566] shrink-0">
            © {new Date().getFullYear()} BETADRiX. ALL DEMO RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
