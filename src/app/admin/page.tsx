"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { AdminGamesTable } from "@/components/admin/AdminGamesTable";
import { GAMES } from "@/config/games";
import { INITIAL_DEMO_ACTIVITY } from "@/data/mockActivity";
import {
  LayoutDashboard,
  Gamepad2,
  Cpu,
  Users,
  Activity,
  Sliders,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "games" | "providers" | "users" | "activity" | "settings">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [configuredCount, setConfiguredCount] = useState<number>(0);

  useEffect(() => {
    let count = 0;
    GAMES.forEach(game => {
      const spykeStored = localStorage.getItem(`spyke_url_${game.id}`);
      const stored = spykeStored || localStorage.getItem(`spribe_demo_url_${game.id}`);
      if ((stored && stored.trim() !== "") || (game.defaultDemoUrl && game.defaultDemoUrl.trim() !== "")) {
        count++;
      }
    });
    setConfiguredCount(count);
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "games", label: "Games Registry", icon: Gamepad2 },
    { id: "providers", label: "Providers", icon: Cpu },
    { id: "users", label: "Sample Users", icon: Users },
    { id: "activity", label: "Demo Sessions", icon: Activity },
    { id: "settings", label: "Platform Config", icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#F5F5F7]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isFixedDesktop={true} />

      <div className="lg:pl-64 flex-1 flex flex-col transition-all duration-300">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#1C1C2A]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-[10px] font-mono text-red-400 font-bold uppercase">
                  DEMONSTRATION CONTROL PANEL
                </span>
                <span className="text-xs text-[#707085]">• Pure Demo Scope</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mt-1">
                PLATFORM CONFIGURATION & DEMO ADMIN
              </h1>
              <p className="text-xs sm:text-sm text-[#8E8E9E] mt-0.5">
                Inspect game entries, configure authorized Spribe demo URLs, and audit simulation state
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/casino"
                className="px-4 py-2 rounded-xl bg-[#141420] hover:bg-[#1C1C2A] border border-[#252538] text-xs font-bold text-[#A0A0B5] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Lobby</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-[#171724]">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-red-600/20 border border-red-500 text-white shadow-[0_0_15px_rgba(255,30,39,0.3)]"
                      : "bg-[#0D0D15] text-[#8E8E9E] hover:text-white hover:bg-[#141420] border border-[#1E1E2C]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-[#707086]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0D0D15] border border-[#222232] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94]">
                    Total Registered Games
                  </span>
                  <div className="text-3xl font-black text-white font-mono">5</div>
                  <span className="text-[11px] text-[#8E8E9E] block">Crash, Mines, Plinko, Dice, Roulette</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D0D15] border border-[#222232] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94]">
                    Configured Demo URLs
                  </span>
                  <div className="text-3xl font-black text-red-400 font-mono">
                    {configuredCount} / 5
                  </div>
                  <span className="text-[11px] text-[#8E8E9E] block">
                    {configuredCount === 5 ? "All games ready" : "Ready for authorized URLs"}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D0D15] border border-[#222232] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94]">
                    Simulated Sessions
                  </span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">1,420</div>
                  <span className="text-[11px] text-[#8E8E9E] block">Sample demo activity counter</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D0D15] border border-[#222232] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94]">
                    Sample Profiles
                  </span>
                  <div className="text-3xl font-black text-white font-mono">4</div>
                  <span className="text-[11px] text-[#8E8E9E] block">Player01, Player23, LuckyWin...</span>
                </div>
              </div>

              {/* Games Table Section */}
              <AdminGamesTable />

              {/* Quick Instructions Alert */}
              <div className="p-6 rounded-2xl bg-[#0F0F18] border border-[#222232] space-y-3">
                <div className="flex items-center gap-2 text-sm font-black uppercase text-white">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                  <span>How Spribe Demo URLs Work in this Architecture</span>
                </div>
                <div className="text-xs text-[#A0A0B2] space-y-2 leading-relaxed">
                  <p>
                    1. <strong>No Invented URLs:</strong> The application does not forge or fabricate fake game URLs.
                  </p>
                  <p>
                    2. <strong>Authorized Configuration:</strong> Click <strong>&quot;Edit URL&quot;</strong> on any game row to paste an authorized Spribe demo URL. Once configured, the game launch shell will automatically mount it inside the high-tech game viewport.
                  </p>
                  <p>
                    3. <strong>Graceful Unconfigured Fallback:</strong> If a game URL is not yet configured, the player sees a stylized mock shell with game specifications, UI references, and a clear prompt to add the authorized URL without crashing or breaking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GAMES REGISTRY */}
          {activeTab === "games" && (
            <div className="space-y-6">
              <AdminGamesTable />
            </div>
          )}

          {/* TAB 3: PROVIDERS */}
          {activeTab === "providers" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C1C2A] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#171724] border border-[#262638] flex items-center justify-center font-black text-red-500 text-lg">
                      SP
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">SPRIBE</h3>
                      <span className="text-xs text-[#8E8E9E]">Innovative Casino Games Provider</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold">
                    Demo Integration Architecture
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#09090F] border border-[#1A1A26]">
                    <span className="text-[10px] font-mono text-[#7E7E94] uppercase block">Provider Status</span>
                    <span className="text-sm font-bold text-emerald-400">Architecture Ready</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#09090F] border border-[#1A1A26]">
                    <span className="text-[10px] font-mono text-[#7E7E94] uppercase block">Integrated Games</span>
                    <span className="text-sm font-bold text-white">5 Titles (Crash, Mines, Plinko, Dice, Roulette)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#09090F] border border-[#1A1A26]">
                    <span className="text-[10px] font-mono text-[#7E7E94] uppercase block">Integration Type</span>
                    <span className="text-sm font-bold text-white">Authorized Demo Launcher</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-[#9E9EB0] leading-relaxed">
                  Notice: No real-money API keys or live betting gateways are attached. All integration endpoints connect strictly to authorized free demonstration URLs.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAMPLE USERS */}
          {activeTab === "users" && (
            <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1C1C2A] pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white">Sample Demo Users</h3>
                  <p className="text-xs text-[#8E8E9E]">Simulated player records for demonstrative UI testing</p>
                </div>
                <span className="text-xs font-mono text-[#78788C]">4 Sample Records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase text-[#707086] border-b border-[#1A1A26]">
                      <th className="pb-3 font-bold">User</th>
                      <th className="pb-3 font-bold">Role</th>
                      <th className="pb-3 font-bold">Demo Balance</th>
                      <th className="pb-3 font-bold">Simulated Sessions</th>
                      <th className="pb-3 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171724]">
                    {[
                      { name: "Player01", role: "Current Client Demo User", balance: "$1,250.00", sessions: 142, status: "Active" },
                      { name: "Player23", role: "Simulated Test Player", balance: "$850.00", sessions: 98, status: "Simulated" },
                      { name: "LuckyWin", role: "Simulated Test Player", balance: "$2,400.00", sessions: 215, status: "Simulated" },
                      { name: "CryptoKing", role: "Simulated Test Player", balance: "$1,120.00", sessions: 67, status: "Simulated" },
                    ].map(u => (
                      <tr key={u.name} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-bold text-white font-mono">{u.name}</td>
                        <td className="py-3 text-[#A0A0B5]">{u.role}</td>
                        <td className="py-3 font-mono font-bold text-white">{u.balance}</td>
                        <td className="py-3 font-mono text-[#8E8E9E]">{u.sessions}</td>
                        <td className="py-3 text-right">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DEMO SESSIONS */}
          {activeTab === "activity" && (
            <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1C1C2A] pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white">Simulated Session Log</h3>
                  <p className="text-xs text-[#8E8E9E]">Real-time mock events generated for demonstration atmosphere</p>
                </div>
                <span className="text-xs font-mono text-emerald-400">Stream Live</span>
              </div>

              <div className="space-y-2">
                {INITIAL_DEMO_ACTIVITY.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#09090F] border border-[#1A1A26] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{item.player}</span>
                      <span className="text-[#78788C]">played</span>
                      <span className="font-bold text-red-400">{item.gameName}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-[#8E8E9E]">${item.bet.toFixed(2)}</span>
                      <span className={item.isWin ? "text-emerald-400 font-bold" : "text-neutral-500"}>
                        {item.isWin ? `+${item.multiplier}x ($${item.payout.toFixed(2)})` : "0.00x"}
                      </span>
                      <span className="text-[10px] text-[#606070]">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PLATFORM SETTINGS */}
          {activeTab === "settings" && (
            <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] p-6 space-y-6">
              <div>
                <h3 className="text-base font-black uppercase text-white">Environment Configuration</h3>
                <p className="text-xs text-[#8E8E9E] mt-0.5">
                  Reference variable mappings for production deployment
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {GAMES.map(g => (
                  <div
                    key={g.id}
                    className="p-3.5 rounded-xl bg-[#09090F] border border-[#1A1A26] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-[#8E8E9E] block text-[10px]">{g.name} Demo URL Key</span>
                      <span className="text-white font-bold">{g.demoUrlEnvKey}</span>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-[#151522] border border-[#262638] text-red-400">
                      Configurable
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-[#A0A0B2] space-y-1">
                <span className="font-bold text-red-400 block uppercase">
                  Zero Financial Capabilities Guarantee
                </span>
                <p>
                  This deployment is permanently locked in demonstration mode. No deposit gateways, payment processors, real balances, or financial webhooks are supported by this code.
                </p>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
