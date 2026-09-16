import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Scale, Cpu, HelpCircle, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { GAMES } from "@/config/games";

export function FairPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#EDEDF0]">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-12">
          {/* Header */}
          <div className="border-b border-[#232632] pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1F2B] border border-[#2D3344] text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider mb-2.5">
              <ShieldCheck className="w-3 h-3 text-red-500" />
              <span>Platform Transparency</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Game Integrity & Fairness
            </h1>
            <p className="text-xs sm:text-sm text-[#8E95A5] mt-1.5 leading-relaxed max-w-2xl">
              An overview of how game math, random outcome generation, and verification operate across authorized demo titles on BETADRiX.
            </p>
          </div>

          {/* Key Principles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#14161E] border border-[#232632] space-y-2.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Cpu className="w-4 h-4 text-red-500" />
                <h3>Official Partner Engines</h3>
              </div>
              <p className="text-xs text-[#8E95A5] leading-relaxed">
                Games hosted on BETADRiX (such as Mines, Dice, and Roulette) load directly from the official demonstration endpoints of Turbo Games and Spribe. BETADRiX does not modify random number generation or alter game math.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#14161E] border border-[#232632] space-y-2.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Scale className="w-4 h-4 text-red-500" />
                <h3>Provider Verification Tools</h3>
              </div>
              <p className="text-xs text-[#8E95A5] leading-relaxed">
                Where providers implement seed-based or provably fair verification (e.g. Turbo Games titles), players can inspect client seeds, server seeds, and outcome hashes directly inside the game settings menu.
              </p>
            </div>
          </div>

          {/* Theoretical RTP Table */}
          <div className="p-5 rounded-xl bg-[#14161E] border border-[#232632] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Published Theoretical Return to Player (RTP)
                </h3>
                <p className="text-xs text-[#8E95A5] mt-0.5">
                  Standard theoretical return figures as configured by the game developers.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                VERIFIED MATH
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#232632] text-[#6A7182] uppercase text-[10px] font-mono">
                    <th className="py-2.5 px-3">Game Title</th>
                    <th className="py-2.5 px-3">Studio Provider</th>
                    <th className="py-2.5 px-3">Theoretical RTP</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F222C]">
                  {GAMES.map(game => (
                    <tr key={game.id} className="hover:bg-[#181B24] transition-colors">
                      <td className="py-3 px-3 font-bold text-white">
                        {game.name}
                      </td>
                      <td className="py-3 px-3 text-[#8E95A5]">
                        {game.provider}
                      </td>
                      <td className="py-3 px-3 font-mono text-red-400 font-bold">
                        {game.rtp}
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/games/${game.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-white hover:text-red-400 transition-colors"
                        >
                          <span>Demo</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strict Simulation Notice */}
          <div className="p-4 rounded-xl bg-[#14161E] border border-[#232632] flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-white">
                Strict Demonstration Guarantee
              </h4>
              <p className="text-[#8E95A5] leading-relaxed">
                BETADRiX operates solely as a free simulation testing ground. No actual deposits, real-currency wagers, or payouts are supported. All balances are virtual playground credits.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/games"
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Browse Demo Lobby</span>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-[#14161E] hover:bg-[#1A1D26] text-[#8E95A5] hover:text-white text-xs font-semibold uppercase tracking-wider border border-[#232632] transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default FairPage;
