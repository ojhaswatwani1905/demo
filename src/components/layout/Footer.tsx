import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Shield, AlertCircle } from "lucide-react";

export function Footer() {
  return (
    <footer id="compliance" className="bg-[#0D0E13] border-t border-[#232632] pt-8 pb-28 lg:pb-8 text-[#8E95A5] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#1F222C]">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Logo compact />
            </div>
            <p className="text-xs text-[#8E95A5] max-w-md leading-relaxed">
              BETADRiX is an authorized game demonstration and simulation portal. All gameplay is performed strictly using simulated virtual balance with no real currency, financial risk, or wagering engines.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#161822] border border-[#232632] text-[11px] text-[#A3AAB8]">
              <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Free Demonstration Environment • Zero Real-Money Transactions</span>
            </div>
          </div>

          {/* Quick Games Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Demonstration Games
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/games/mines" className="hover:text-white transition-colors">
                  Mines (Turbo Games)
                </Link>
              </li>
              <li>
                <Link href="/games/dice" className="hover:text-white transition-colors">
                  Dice (Turbo Games)
                </Link>
              </li>
              <li>
                <Link href="/games/roulette" className="hover:text-white transition-colors">
                  Roulette (Spribe)
                </Link>
              </li>
              <li>
                <Link href="/games/plinko" className="hover:text-white transition-colors">
                  Plinko (Spribe)
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home Lobby
                </Link>
              </li>
              <li>
                <Link href="/games" className="hover:text-white transition-colors">
                  Games Lobby
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="hover:text-white transition-colors">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/vip" className="hover:text-white transition-colors">
                  VIP Club
                </Link>
              </li>
              <li>
                <Link href="/bonus" className="hover:text-white transition-colors">
                  Bonus Center
                </Link>
              </li>
              <li>
                <Link href="/fair" className="hover:text-white transition-colors">
                  Fairness & Integrity
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Demo Compliance Footer Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6A7182]">
          <div className="flex items-center gap-2 text-left">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <p>
              Strictly for demonstration and testing purposes. No real money deposits or cashouts.
            </p>
          </div>

          <p className="font-mono text-[#5A6072] shrink-0">
            © {new Date().getFullYear()} BETADRiX. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
