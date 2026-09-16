"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminGamesTable } from "@/components/admin/AdminGamesTable";
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  HelpCircle,
  Database,
  Activity,
  Gift,
  Crown,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  ArrowRight,
  RefreshCw,
  Clock,
  Search
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalGames: number;
  configuredGames: number;
  dbEngine: string;
  isDbConnected: boolean;
  totalActivity: number;
  telegramConfigured: boolean;
  whatsappConfigured: boolean;
  siteName: string;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  created_at: string;
  status: string;
}

interface ActivityItem {
  id?: number;
  username: string;
  game: string;
  payout_amount: number;
  multiplier: number;
  created_at?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<AdminTab>("dashboard");
  const [adminId, setAdminId] = useState<string>("admin");
  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true);

  // Platform Metrics & Health
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGames: 4,
    configuredGames: 3,
    dbEngine: "PostgreSQL",
    isDbConnected: true,
    totalActivity: 100,
    telegramConfigured: false,
    whatsappConfigured: false,
    siteName: "BETADRiX DEMO"
  });

  // Support Configuration Form State
  const [telegramUrl, setTelegramUrl] = useState<string>("");
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const [isSavingSupport, setIsSavingSupport] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Users & Activity Data
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [activityList, setActivityList] = useState<ActivityItem[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>("");

  // 1. Verify authenticated admin session immediately on mount
  useEffect(() => {
    fetch("/api/admin/auth/session")
      .then((res) => {
        if (!res.ok) {
          router.replace("/admin");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          setAdminId(data.adminId || "admin");
          setIsVerifyingAuth(false);
          loadDashboardData();
        } else if (data) {
          router.replace("/admin");
        }
      })
      .catch((err) => {
        console.error("Session verification error:", err);
        router.replace("/admin");
      });
  }, [router]);

  // 2. Fetch statistics, support configuration, users, and activity logs
  const loadDashboardData = async () => {
    // A. Load Stats
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) setStats(data.stats);
      })
      .catch((err) => console.error("Stats fetch error:", err));

    // B. Load Support Config
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setTelegramUrl(data.config.telegramUrl || "");
          setWhatsappUrl(data.config.whatsappUrl || "");
        }
      })
      .catch((err) => console.error("Config fetch error:", err));

    // C. Load Registered Users
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.users) setUsersList(data.users);
      })
      .catch((err) => console.error("Users fetch error:", err));

    // D. Load Activity Logs
    fetch("/api/admin/activity")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.activity) setActivityList(data.activity);
      })
      .catch((err) => console.error("Activity fetch error:", err));
  };

  // 3. Handle Support Configuration Save
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
        loadDashboardData();
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

  // 4. Handle Administrator Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    router.replace("/admin");
    router.refresh();
  };

  if (isVerifyingAuth) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
          Verifying Administrator Session...
        </p>
      </div>
    );
  }

  // Filtered lists
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredActivity = activityList.filter(
    (a) =>
      a.username.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
      a.game.toLowerCase().includes(activitySearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-[#08090C] text-[#EDEDF0]">
      {/* 1. Internal Dedicated Admin Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={handleLogout}
        adminId={adminId}
        isDbConnected={stats.isDbConnected}
        dbEngine={stats.dbEngine}
      />

      {/* 2. Main Administration Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          currentTabName={currentTab}
          adminId={adminId}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* ================================================================ */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ================================================================ */}
          {currentTab === "dashboard" && (
            <div className="space-y-6">
              {/* Header Title */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  ADMIN DASHBOARD
                </h1>
                <p className="text-xs text-[#8E95A5] mt-1">
                  High-level overview of registered users, game providers, support channels, and database health.
                </p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Registered Users */}
                <div className="p-5 rounded-2xl bg-[#101218] border border-[#252936] space-y-2">
                  <div className="flex items-center justify-between text-[#8E95A5]">
                    <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
                    <Users className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats.totalUsers}
                  </div>
                  <p className="text-[11px] text-[#656C7D]">PostgreSQL user accounts</p>
                </div>

                {/* 2. Configured Games */}
                <div className="p-5 rounded-2xl bg-[#101218] border border-[#252936] space-y-2">
                  <div className="flex items-center justify-between text-[#8E95A5]">
                    <span className="text-xs font-bold uppercase tracking-wider">Configured Games</span>
                    <Gamepad2 className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats.configuredGames} / {stats.totalGames}
                  </div>
                  <p className="text-[11px] text-[#656C7D]">Mines, Dice, Roulette, Plinko</p>
                </div>

                {/* 3. Support Channels */}
                <div className="p-5 rounded-2xl bg-[#101218] border border-[#252936] space-y-2">
                  <div className="flex items-center justify-between text-[#8E95A5]">
                    <span className="text-xs font-bold uppercase tracking-wider">Support Status</span>
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats.telegramConfigured && stats.whatsappConfigured
                      ? "Active"
                      : stats.telegramConfigured || stats.whatsappConfigured
                      ? "Partial"
                      : "Pending"}
                  </div>
                  <p className="text-[11px] text-[#656C7D]">Telegram & WhatsApp links</p>
                </div>

                {/* 4. Database Engine */}
                <div className="p-5 rounded-2xl bg-[#101218] border border-[#252936] space-y-2">
                  <div className="flex items-center justify-between text-[#8E95A5]">
                    <span className="text-xs font-bold uppercase tracking-wider">Database Status</span>
                    <Database className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {stats.isDbConnected ? "Connected" : "Fallback"}
                  </div>
                  <p className="text-[11px] text-[#656C7D]">{stats.dbEngine}</p>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setCurrentTab("support")}
                  className="p-5 rounded-2xl bg-[#101218] border border-[#252936] hover:border-red-500/40 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <HelpCircle className="w-5 h-5 text-red-500" />
                    <ArrowRight className="w-4 h-4 text-[#656C7D] group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase">Manage Support Links</h3>
                  <p className="text-xs text-[#8E95A5] mt-1">
                    Configure official Telegram community and WhatsApp support channels.
                  </p>
                </button>

                <button
                  onClick={() => setCurrentTab("games")}
                  className="p-5 rounded-2xl bg-[#101218] border border-[#252936] hover:border-red-500/40 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Gamepad2 className="w-5 h-5 text-red-500" />
                    <ArrowRight className="w-4 h-4 text-[#656C7D] group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase">Game Configuration</h3>
                  <p className="text-xs text-[#8E95A5] mt-1">
                    Inspect Spribe & Turbo Games demo launch endpoints.
                  </p>
                </button>

                <button
                  onClick={() => setCurrentTab("users")}
                  className="p-5 rounded-2xl bg-[#101218] border border-[#252936] hover:border-red-500/40 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-red-500" />
                    <ArrowRight className="w-4 h-4 text-[#656C7D] group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase">User Accounts</h3>
                  <p className="text-xs text-[#8E95A5] mt-1">
                    View registered users in PostgreSQL database.
                  </p>
                </button>
              </div>

              {/* Recent Activity Snapshot */}
              <div className="rounded-2xl bg-[#101218] border border-[#252936] overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[#252936] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-bold text-white uppercase">Recent Platform Activity</h3>
                  </div>
                  <button
                    onClick={() => setCurrentTab("activity")}
                    className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#090A0E] text-[10px] text-[#71788A] uppercase border-b border-[#252936]">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Game</th>
                        <th className="py-3 px-4">Multiplier</th>
                        <th className="py-3 px-4">Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C1F2A]">
                      {activityList.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#141620]">
                          <td className="py-3 px-4 text-white font-bold">{item.username}</td>
                          <td className="py-3 px-4 text-[#A2A9B9]">{item.game}</td>
                          <td className="py-3 px-4 text-red-400 font-bold">{item.multiplier.toFixed(2)}x</td>
                          <td className="py-3 px-4 text-emerald-400 font-bold">
                            ${item.payout_amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: SUPPORT CONFIGURATION */}
          {/* ================================================================ */}
          {currentTab === "support" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  SUPPORT CONFIGURATION
                </h1>
                <p className="text-xs text-[#8E95A5] mt-1">
                  Manage official Telegram community and WhatsApp support URLs stored in PostgreSQL.
                </p>
              </div>

              {supportMessage && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                    supportMessage.type === "success"
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-red-950/40 border-red-500/40 text-red-200"
                  }`}
                >
                  {supportMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{supportMessage.text}</span>
                </div>
              )}

              <div className="rounded-2xl bg-[#101218] border border-[#252936] p-6 sm:p-8">
                <form onSubmit={handleSaveSupport} className="space-y-6 max-w-2xl">
                  {/* Telegram URL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#A2A9B9]">
                      Telegram Community URL
                    </label>
                    <input
                      type="url"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      placeholder="https://t.me/betadrix_official"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white placeholder-[#5A6173] text-sm focus:outline-none focus:border-red-500/80 transition-colors"
                    />
                    <p className="text-[11px] text-[#656C7D]">
                      When configured, public support triggers open this link in a new tab.
                    </p>
                  </div>

                  {/* WhatsApp URL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#A2A9B9]">
                      WhatsApp Direct Support URL
                    </label>
                    <input
                      type="url"
                      value={whatsappUrl}
                      onChange={(e) => setWhatsappUrl(e.target.value)}
                      placeholder="https://wa.me/15551234567"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white placeholder-[#5A6173] text-sm focus:outline-none focus:border-red-500/80 transition-colors"
                    />
                    <p className="text-[11px] text-[#656C7D]">
                      Must start with https://wa.me/ or valid HTTP/HTTPS scheme.
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#252936]">
                    <button
                      type="submit"
                      disabled={isSavingSupport}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingSupport ? "Saving to Database..." : "Save to PostgreSQL"}</span>
                    </button>

                    {telegramUrl && (
                      <a
                        href={telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-[#141620] hover:bg-[#181B26] border border-[#252936] text-[#A2A9B9] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Test Telegram</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-[#141620] hover:bg-[#181B26] border border-[#252936] text-[#A2A9B9] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Test WhatsApp</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: GAMES CONFIGURATION */}
          {/* ================================================================ */}
          {currentTab === "games" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  GAMES CONFIGURATION
                </h1>
                <p className="text-xs text-[#8E95A5] mt-1">
                  Authorized Spribe & Turbo Games demo endpoints. Spyke remains the authoritative source.
                </p>
              </div>

              {/* Status Note */}
              <div className="p-4 rounded-xl bg-[#101218] border border-[#252936] flex items-center gap-3 text-xs text-[#A2A9B9]">
                <Shield className="w-4 h-4 text-red-500 shrink-0" />
                <span>
                  Authorized demo launch URLs: <strong>Mines</strong> and <strong>Dice</strong> (Turbo Games), <strong>Roulette</strong> (Spribe). <strong>Plinko</strong> awaits authorized URL. <strong>Crash</strong> is permanently removed.
                </span>
              </div>

              {/* Game Table */}
              <AdminGamesTable />
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: PROMOTIONS */}
          {/* ================================================================ */}
          {currentTab === "promotions" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  PROMOTIONS CONFIGURATION
                </h1>
                <p className="text-xs text-[#8E95A5] mt-1">
                  Manage demo-only promotional content, playground balance allocations, and campaign banners.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#101218] border border-[#252936] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-red-400">Risk-Free Sandbox</span>
                    <Gift className="w-4 h-4 text-red-500" />
                  </div>
                  <h3 className="text-base font-bold text-white">Welcome Demo Allocation</h3>
                  <p className="text-xs text-[#8E95A5] leading-relaxed">
                    $1,250.00 default virtual balance issued to every prospective tester upon session initialization.
                  </p>
                  <div className="pt-2">
                    <span className="px-2 py-0.5 rounded bg-[#181B26] border border-[#2B3144] text-[10px] font-mono text-emerald-400">
                      STATUS: ACTIVE
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#101218] border border-[#252936] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-amber-400">Provider Fidelity</span>
                    <Gamepad2 className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="text-base font-bold text-white">Direct Engine Demonstration</h3>
                  <p className="text-xs text-[#8E95A5] leading-relaxed">
                    Zero financial wagering. Transparent simulation verifying game rules and official RNG mathematics.
                  </p>
                  <div className="pt-2">
                    <span className="px-2 py-0.5 rounded bg-[#181B26] border border-[#2B3144] text-[10px] font-mono text-emerald-400">
                      STATUS: ACTIVE
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#101218] border border-[#252936] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-blue-400">Instant Faucet</span>
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-base font-bold text-white">Sandbox Credit Reset</h3>
                  <p className="text-xs text-[#8E95A5] leading-relaxed">
                    One-click top-up and playground balance reset enabled for all test visitors.
                  </p>
                  <div className="pt-2">
                    <span className="px-2 py-0.5 rounded bg-[#181B26] border border-[#2B3144] text-[10px] font-mono text-emerald-400">
                      STATUS: ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 5: VIP CONFIGURATION */}
          {/* ================================================================ */}
          {currentTab === "vip" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  VIP CLUB CONFIGURATION
                </h1>
                <p className="text-xs text-[#8E95A5] mt-1">
                  Manage demo VIP tier thresholds, virtual multiplier perks, and priority tester badges.
                </p>
              </div>

              <div className="rounded-2xl bg-[#101218] border border-[#252936] overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#090A0E] text-[10px] text-[#71788A] uppercase border-b border-[#252936]">
                    <tr>
                      <th className="py-3 px-5">Tier</th>
                      <th className="py-3 px-5">Virtual Turnover</th>
                      <th className="py-3 px-5">Demo Rakeback</th>
                      <th className="py-3 px-5">Perks</th>
                      <th className="py-3 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1F2A]">
                    <tr className="hover:bg-[#141620]">
                      <td className="py-3.5 px-5 font-bold text-amber-500">Bronze</td>
                      <td className="py-3.5 px-5">$10,000 Demo</td>
                      <td className="py-3.5 px-5 text-red-400">5%</td>
                      <td className="py-3.5 px-5 text-[#A2A9B9]">Standard test priority</td>
                      <td className="py-3.5 px-5 text-right text-emerald-400 font-bold">Enabled</td>
                    </tr>
                    <tr className="hover:bg-[#141620]">
                      <td className="py-3.5 px-5 font-bold text-gray-300">Silver</td>
                      <td className="py-3.5 px-5">$50,000 Demo</td>
                      <td className="py-3.5 px-5 text-red-400">7.5%</td>
                      <td className="py-3.5 px-5 text-[#A2A9B9]">Level up bonus</td>
                      <td className="py-3.5 px-5 text-right text-emerald-400 font-bold">Enabled</td>
                    </tr>
                    <tr className="hover:bg-[#141620]">
                      <td className="py-3.5 px-5 font-bold text-yellow-400">Gold</td>
                      <td className="py-3.5 px-5">$100,000 Demo</td>
                      <td className="py-3.5 px-5 text-red-400">10%</td>
                      <td className="py-3.5 px-5 text-[#A2A9B9]">Dedicated telegram channel</td>
                      <td className="py-3.5 px-5 text-right text-emerald-400 font-bold">Enabled</td>
                    </tr>
                    <tr className="hover:bg-[#141620]">
                      <td className="py-3.5 px-5 font-bold text-cyan-400">Platinum</td>
                      <td className="py-3.5 px-5">$250,000 Demo</td>
                      <td className="py-3.5 px-5 text-red-400">12.5%</td>
                      <td className="py-3.5 px-5 text-[#A2A9B9]">VIP test sandbox access</td>
                      <td className="py-3.5 px-5 text-right text-emerald-400 font-bold">Enabled</td>
                    </tr>
                    <tr className="hover:bg-[#141620]">
                      <td className="py-3.5 px-5 font-bold text-purple-400">Diamond</td>
                      <td className="py-3.5 px-5">$1,000,000 Demo</td>
                      <td className="py-3.5 px-5 text-red-400">15%</td>
                      <td className="py-3.5 px-5 text-[#A2A9B9]">Direct developer access</td>
                      <td className="py-3.5 px-5 text-right text-emerald-400 font-bold">Enabled</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 6: BONUS */}
          {/* ================================================================ */}
          {currentTab === "bonus" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  BONUS CONFIGURATION
                </h1>
                <p className="text-xs text-[#8E95A5] mt-1">
                  Manage simulation reload timers, playground faucet limits, and demo deposit multipliers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase">Daily Demo Faucet</h3>
                    <Sparkles className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-[#A2A9B9]">
                      <span>Allowance Amount:</span>
                      <strong className="text-white font-mono">$1,000.00 Demo</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#A2A9B9]">
                      <span>Cooldown Period:</span>
                      <strong className="text-white font-mono">24 Hours</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#A2A9B9]">
                      <span>Enforcement:</span>
                      <strong className="text-emerald-400 font-mono">Active (Browser LocalStorage)</strong>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase">Instant Playground Top-Up</h3>
                    <RefreshCw className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-[#A2A9B9]">
                      <span>Top-Up Increments:</span>
                      <strong className="text-white font-mono">+$500 / +$1,000 / +$5,000</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#A2A9B9]">
                      <span>Max Sandbox Balance:</span>
                      <strong className="text-white font-mono">$100,000.00 Demo</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#A2A9B9]">
                      <span>Audit Trail:</span>
                      <strong className="text-emerald-400 font-mono">Enabled</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 7: ACTIVITY MANAGEMENT */}
          {/* ================================================================ */}
          {currentTab === "activity" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    ACTIVITY LOGS
                  </h1>
                  <p className="text-xs text-[#8E95A5] mt-1">
                    PostgreSQL simulated live activity pool records.
                  </p>
                </div>

                {/* Search Activity */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6173]" />
                  <input
                    type="text"
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    placeholder="Search by user or game..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#101218] border border-[#252936] text-white text-xs placeholder-[#5A6173] focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Activity Table */}
              <div className="rounded-2xl bg-[#101218] border border-[#252936] overflow-hidden">
                <div className="p-4 border-b border-[#252936] flex items-center justify-between text-xs text-[#71788A]">
                  <span>Showing {filteredActivity.length} activity entries</span>
                  <button
                    onClick={loadDashboardData}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold uppercase cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#090A0E] text-[10px] text-[#71788A] uppercase border-b border-[#252936] sticky top-0">
                      <tr>
                        <th className="py-3 px-5">ID</th>
                        <th className="py-3 px-5">User</th>
                        <th className="py-3 px-5">Game</th>
                        <th className="py-3 px-5">Multiplier</th>
                        <th className="py-3 px-5">Payout</th>
                        <th className="py-3 px-5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C1F2A]">
                      {filteredActivity.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#141620]">
                          <td className="py-3 px-5 text-[#5A6173]">#{item.id || idx + 1}</td>
                          <td className="py-3 px-5 text-white font-bold">{item.username}</td>
                          <td className="py-3 px-5 text-[#A2A9B9]">{item.game}</td>
                          <td className="py-3 px-5 text-red-400 font-bold">{item.multiplier.toFixed(2)}x</td>
                          <td className="py-3 px-5 text-emerald-400 font-bold">
                            ${item.payout_amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-5 text-[#71788A] text-[11px]">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : "Just now"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 8: USERS DIRECTORY */}
          {/* ================================================================ */}
          {currentTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    REGISTERED DEMO USERS
                  </h1>
                  <p className="text-xs text-[#8E95A5] mt-1">
                    Registered demonstration accounts stored in PostgreSQL database.
                  </p>
                </div>

                {/* Search Users */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6173]" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#101218] border border-[#252936] text-white text-xs placeholder-[#5A6173] focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-2xl bg-[#101218] border border-[#252936] overflow-hidden">
                <div className="p-4 border-b border-[#252936] flex items-center justify-between text-xs text-[#71788A]">
                  <span>Total Users: {filteredUsers.length}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                    CREDENTIALS SECURED (BCRYPT)
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#090A0E] text-[10px] text-[#71788A] uppercase border-b border-[#252936]">
                      <tr>
                        <th className="py-3 px-5">ID</th>
                        <th className="py-3 px-5">Name</th>
                        <th className="py-3 px-5">Email</th>
                        <th className="py-3 px-5">Created At</th>
                        <th className="py-3 px-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C1F2A]">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[#5A6173] font-sans">
                            No users registered yet.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-[#141620]">
                            <td className="py-3.5 px-5 text-[#5A6173]">#{u.id}</td>
                            <td className="py-3.5 px-5 text-white font-bold">{u.name}</td>
                            <td className="py-3.5 px-5 text-[#A2A9B9]">{u.email}</td>
                            <td className="py-3.5 px-5 text-[#71788A]">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 9: GENERAL / SYSTEM STATUS */}
          {/* ================================================================ */}
          {currentTab === "general" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  SYSTEM & GENERAL CONFIGURATION
                </h1>
                <p className="text-xs text-[#8E95A5] mt-1">
                  Server environment, database health, and core runtime parameters.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <Database className="w-4 h-4 text-red-500" />
                    <span>Database Configuration</span>
                  </h3>
                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E95A5]">Engine:</span>
                      <strong className="text-white">{stats.dbEngine}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E95A5]">Connection Status:</span>
                      <strong className={stats.isDbConnected ? "text-emerald-400" : "text-amber-400"}>
                        {stats.isDbConnected ? "ONLINE / ACTIVE" : "RESILIENT FALLBACK"}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E95A5]">Connection Pool:</span>
                      <strong className="text-white">pg.Pool (3000ms timeout)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E95A5]">SSL Mode:</span>
                      <strong className="text-white">Authorized production SSL</strong>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span>Authentication & Security</span>
                  </h3>
                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E95A5]">Admin Password Hash:</span>
                      <strong className="text-white">bcrypt (cost 10)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E95A5]">Session Scheme:</span>
                      <strong className="text-white">HMAC-SHA256 HttpOnly Cookie</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E95A5]">Session Lifetime:</span>
                      <strong className="text-white">8 Hours (28,800s)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E95A5]">Cookie Security:</span>
                      <strong className="text-white">SameSite=Lax, Path=/</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
