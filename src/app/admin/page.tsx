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
  Flame,
  Send,
  MessageCircle,
  HelpCircle,
  Gift,
  Crown,
  Sparkles,
  Save,
  Database
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "general" | "support" | "promotions" | "vip" | "bonus" | "games">("dashboard");
  const [configuredCount, setConfiguredCount] = useState<number>(0);

  // Support URLs state (persisted in PostgreSQL)
  const [telegramUrl, setTelegramUrl] = useState<string>("");
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const [isSavingSupport, setIsSavingSupport] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // General site configuration state
  const [siteName, setSiteName] = useState<string>("BETADRiX DEMO");
  const [defaultBalance, setDefaultBalance] = useState<string>("1250.00");

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

    // Fetch support configuration from PostgreSQL via API
    fetch("/api/admin/config")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setTelegramUrl(data.config.telegramUrl || "");
          setWhatsappUrl(data.config.whatsappUrl || "");
          if (data.config.siteName) setSiteName(data.config.siteName);
        }
      })
      .catch(err => {
        console.error("Failed to load admin config:", err);
      });
  }, []);

  const handleSaveSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSupport(true);
    setSupportMessage(null);

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramUrl: telegramUrl.trim() || null,
          whatsappUrl: whatsappUrl.trim() || null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSupportMessage({ type: "success", text: "Support URLs saved to PostgreSQL successfully!" });
      } else {
        setSupportMessage({ type: "error", text: data.error || "Failed to update configuration" });
      }
    } catch (err) {
      console.error("Support save error:", err);
      setSupportMessage({ type: "error", text: "Network error saving support configuration." });
    } finally {
      setIsSavingSupport(false);
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "general", label: "General", icon: Sliders },
    { id: "support", label: "Support", icon: HelpCircle },
    { id: "promotions", label: "Promotions", icon: Gift },
    { id: "vip", label: "VIP Club", icon: Crown },
    { id: "bonus", label: "Bonus Offers", icon: Sparkles },
    { id: "games", label: "Games", icon: Gamepad2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#F5F5F7]">
      <Sidebar />

      <div className="lg:pl-60 flex-1 flex flex-col transition-all duration-300">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#1C1C2A]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-[10px] font-mono text-red-400 font-bold uppercase">
                  DEMONSTRATION CONTROL PANEL
                </span>
                <span className="text-xs text-[#707085]">• PostgreSQL Storage Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mt-1">
                PLATFORM CONFIGURATION & DEMO ADMIN
              </h1>
              <p className="text-xs sm:text-sm text-[#8E8E9E] mt-0.5">
                Manage support URLs, review demo promotions, audit VIP parameters, and configure game provider launch URLs
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/games"
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
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
                  <div className="text-3xl font-black text-white font-mono">{GAMES.length}</div>
                  <span className="text-[11px] text-[#8E8E9E] block">Mines, Plinko, Dice, Roulette</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D0D15] border border-[#222232] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94]">
                    Configured Demo URLs
                  </span>
                  <div className="text-3xl font-black text-red-400 font-mono">
                    {configuredCount} / {GAMES.length}
                  </div>
                  <span className="text-[11px] text-[#8E8E9E] block">
                    {configuredCount === GAMES.length ? "All games ready" : "3 configured • Plinko awaiting URL"}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D0D15] border border-[#222232] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94]">
                    Support Configuration
                  </span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {telegramUrl || whatsappUrl ? "Active" : "Pending"}
                  </div>
                  <span className="text-[11px] text-[#8E8E9E] block">
                    Telegram & WhatsApp channels
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D0D15] border border-[#222232] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E94]">
                    Persistent Database
                  </span>
                  <div className="text-3xl font-black text-white font-mono flex items-center gap-2">
                    <Database className="w-6 h-6 text-red-500" />
                    <span>PostgreSQL</span>
                  </div>
                  <span className="text-[11px] text-[#8E8E9E] block">Users, Config, Dummy Activity</span>
                </div>
              </div>

              {/* Games Table Section */}
              <AdminGamesTable />
            </div>
          )}

          {/* TAB 2: GENERAL CONFIGURATION */}
          {activeTab === "general" && (
            <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] p-6 space-y-6">
              <div>
                <h3 className="text-base font-black uppercase text-white">General Platform Settings</h3>
                <p className="text-xs text-[#8E8E9E] mt-0.5">
                  Configure demonstration platform parameters and defaults
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider block">
                    Platform Display Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141420] border border-[#252538] rounded-xl text-xs text-white placeholder-[#555C70] focus:outline-none focus:border-red-500 font-mono"
                  />
                  <span className="text-[10px] text-[#6E768B]">Identifies the demo gaming platform branding.</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider block">
                    Default Demo Balance ($)
                  </label>
                  <input
                    type="text"
                    value={defaultBalance}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-[#141420] border border-[#252538] rounded-xl text-xs text-[#8E8E9E] font-mono cursor-not-allowed"
                  />
                  <span className="text-[10px] text-[#6E768B]">Locked at $1,250.00 virtual playground balance per specification.</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-[#A0A0B2] space-y-1">
                <span className="font-bold text-red-400 block uppercase">
                  Demonstration Platform Mode Active
                </span>
                <p>
                  Zero financial mechanisms. No payment gateways, credit processing, or withdrawal endpoints exist.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SUPPORT (TELEGRAM & WHATSAPP SAVED TO POSTGRESQL) */}
          {activeTab === "support" && (
            <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1C1C2A] pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-red-500" />
                    <span>Support Channels Configuration</span>
                  </h3>
                  <p className="text-xs text-[#8E8E9E] mt-0.5">
                    Configure official Telegram and WhatsApp URLs. Values are persisted directly into PostgreSQL.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>PostgreSQL Table: site_config</span>
                </div>
              </div>

              {supportMessage && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                    supportMessage.type === "success"
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                      : "bg-red-950/40 border-red-500/50 text-red-300"
                  }`}
                >
                  {supportMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{supportMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveSupport} className="space-y-5">
                {/* Telegram URL */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-400" />
                    <span>Telegram Support URL</span>
                  </label>
                  <input
                    type="url"
                    value={telegramUrl}
                    onChange={e => setTelegramUrl(e.target.value)}
                    placeholder="https://t.me/your_betadrix_support"
                    className="w-full px-3.5 py-2.5 bg-[#141420] border border-[#252538] rounded-xl text-xs text-white placeholder-[#555C70] focus:outline-none focus:border-red-500 font-mono"
                  />
                  <span className="text-[10px] text-[#6E768B]">
                    Leave blank to disable the Telegram option in the sidebar. If configured, users clicking Telegram will open this link in a new tab.
                  </span>
                </div>

                {/* WhatsApp URL */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Support URL</span>
                  </label>
                  <input
                    type="url"
                    value={whatsappUrl}
                    onChange={e => setWhatsappUrl(e.target.value)}
                    placeholder="https://wa.me/1234567890"
                    className="w-full px-3.5 py-2.5 bg-[#141420] border border-[#252538] rounded-xl text-xs text-white placeholder-[#555C70] focus:outline-none focus:border-red-500 font-mono"
                  />
                  <span className="text-[10px] text-[#6E768B]">
                    Leave blank to disable the WhatsApp option in the sidebar. If configured, users clicking WhatsApp will open this link in a new tab.
                  </span>
                </div>

                {/* Save button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSupport}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSupport ? "Saving to Database..." : "Save Support Configuration"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: PROMOTIONS */}
          {activeTab === "promotions" && (
            <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1C1C2A] pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white">Active Demo Promotions</h3>
                  <p className="text-xs text-[#8E95A5]">Overview of promotional campaigns displayed at /promotions</p>
                </div>
                <Link
                  href="/promotions"
                  target="_blank"
                  className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { title: "100% Demo Deposit Match", badge: "WELCOME OFFER", reward: "$1,250.00 Match", status: "Active" },
                  { title: "Mines & Dice Sprint", badge: "WEEKEND TOURNAMENT", reward: "$10,000 Prize Pool", status: "Active" },
                  { title: "15% Simulated Cashback", badge: "WEEKLY REBATE", reward: "15% Rebate", status: "Active" },
                  { title: "Daily Pegboard Mystery Drop", badge: "DAILY REWARDS", reward: "555x Multiplier", status: "Active" }
                ].map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#09090F] border border-[#1A1A26] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-red-400 font-bold uppercase">{p.badge}</span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{p.title}</h4>
                      <span className="text-[11px] text-[#7A8296] font-mono">{p.reward}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VIP CLUB */}
          {activeTab === "vip" && (
            <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1C1C2A] pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white">VIP Club Configuration</h3>
                  <p className="text-xs text-[#8E95A5]">Overview of loyalty tiers displayed at /vip</p>
                </div>
                <Link
                  href="/vip"
                  target="_blank"
                  className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { tier: "Bronze Tier", levels: "Level 1 – 10", cashback: "5%", req: "$0 – $10,000" },
                  { tier: "Silver Tier", levels: "Level 11 – 25", cashback: "8%", req: "$10,000 – $50,000" },
                  { tier: "Gold Tier", levels: "Level 26 – 50", cashback: "12%", req: "$50,000 – $200,000" },
                  { tier: "Platinum Tier", levels: "Level 51 – 75", cashback: "16%", req: "$200,000 – $500,000" },
                  { tier: "Diamond Tier", levels: "Level 76+", cashback: "20%", req: "$500,000+" },
                ].map((v, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#09090F] border border-[#1A1A26] flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{v.tier}</h4>
                      <span className="text-[11px] text-[#7A8296] font-mono">{v.levels} • Req: {v.req}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-400 font-mono">{v.cashback} Rakeback</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BONUS OFFERS */}
          {activeTab === "bonus" && (
            <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1C1C2A] pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white">Bonus Grants Catalog</h3>
                  <p className="text-xs text-[#8E95A5]">Overview of simulated bonuses claimable at /bonus</p>
                </div>
                <Link
                  href="/bonus"
                  target="_blank"
                  className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { title: "Daily Virtual Playground Grant", amount: "$250.00", freq: "Every 24 hours" },
                  { title: "Turbo Games Multiplier Booster", amount: "$500.00", freq: "Weekend active" },
                  { title: "Spribe Classic Reload", amount: "$350.00", freq: "Table games active" },
                ].map((b, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#09090F] border border-[#1A1A26] flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{b.title}</h4>
                      <span className="text-[11px] text-[#7A8296] font-mono">{b.freq}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-red-600/10 text-red-400 border border-red-500/30 text-xs font-mono font-bold">
                      +{b.amount} Demo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: GAMES REGISTRY */}
          {activeTab === "games" && (
            <div className="space-y-6">
              <AdminGamesTable />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
