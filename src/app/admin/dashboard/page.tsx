"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import {
  Users,
  Wallet,
  Activity,
  Gamepad2,
  HelpCircle,
  Server,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  Gift,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink
} from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

export default function AdminDashboardPage() {
  const { subscribe } = useRealtime();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGames: 4,
    configuredGames: 3,
    totalAllocatedDemoBalance: 0,
    totalSimulatedPayouts: 0,
    dbEngine: "PostgreSQL",
    isDbConnected: true,
    totalActivity: 0,
    telegramConfigured: false,
    whatsappConfigured: false,
    siteName: "BETADRiX DEMO",
    lastSuccessfulDbOp: new Date().toISOString()
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Balance Quick Action Modal
  const [balanceModal, setBalanceModal] = useState<{
    isOpen: boolean;
    userId: number;
    userName: string;
    currentBalance: number;
    actionType: "add" | "remove";
    amount: string;
    reason: string;
    isSubmitting: boolean;
    feedback: string | null;
  }>({
    isOpen: false,
    userId: 1,
    userName: "",
    currentBalance: 0,
    actionType: "add",
    amount: "500",
    reason: "Admin quick adjustment",
    isSubmitting: false,
    feedback: null
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, actRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/activity"),
        fetch("/api/admin/users")
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.stats) setStats(d.stats);
      }
      if (actRes.ok) {
        const d = await actRes.json();
        if (d.activity) setRecentActivity(d.activity.slice(0, 8));
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        if (d.users) setUsersList(d.users);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time listener: auto-update dashboard without reload
  useEffect(() => {
    const unsub1 = subscribe("USER_BALANCE_UPDATED", () => loadData());
    const unsub2 = subscribe("ACTIVITY_UPDATED", () => loadData());
    const unsub3 = subscribe("SUPPORT_UPDATED", () => loadData());
    const unsub4 = subscribe("GENERAL_CONFIG_UPDATED", () => loadData());
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [subscribe, loadData]);

  const handleQuickBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModal.userId) return;

    setBalanceModal(prev => ({ ...prev, isSubmitting: true, feedback: null }));
    try {
      const res = await fetch(`/api/admin/users/${balanceModal.userId}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(balanceModal.amount),
          actionType: balanceModal.actionType,
          reason: balanceModal.reason
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBalanceModal(prev => ({
          ...prev,
          isSubmitting: false,
          feedback: `Success! New balance: $${data.data.newBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
        }));
        loadData();
        setTimeout(() => {
          setBalanceModal(prev => ({ ...prev, isOpen: false, feedback: null }));
        }, 1200);
      } else {
        setBalanceModal(prev => ({
          ...prev,
          isSubmitting: false,
          feedback: `Error: ${data.error || "Failed to adjust balance"}`
        }));
      }
    } catch (err: any) {
      setBalanceModal(prev => ({
        ...prev,
        isSubmitting: false,
        feedback: `Error: ${err.message}`
      }));
    }
  };

  const openBalanceModalForUser = (action: "add" | "remove") => {
    const targetUser = usersList[0] || { id: 1, name: "Primary Tester", balance: 1250 };
    setBalanceModal({
      isOpen: true,
      userId: targetUser.id,
      userName: targetUser.name,
      currentBalance: Number(targetUser.balance || 0),
      actionType: action,
      amount: action === "add" ? "500" : "200",
      reason: action === "add" ? "Admin demo credit top-up" : "Admin demo balance debit",
      isSubmitting: false,
      feedback: null
    });
  };

  return (
    <AdminControlShell
      title="Platform Overview"
      subtitle="Real-time operational dashboard with live PostgreSQL data & event streaming"
      actions={
        <button
          type="button"
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12151F] hover:bg-[#181B26] border border-[#262B3B] text-xs font-mono text-[#A2A9B9] hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-2xl bg-[#101218] border border-[#252936] space-y-2">
          <div className="flex items-center justify-between text-[#8E95A5]">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Testers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#71788A]">
            <span>Active accounts:</span>
            <span className="text-emerald-400 font-bold">{stats.activeUsers}</span>
          </div>
        </div>

        {/* Total Demo Balance Allocated */}
        <div className="p-4 rounded-2xl bg-[#101218] border border-[#252936] space-y-2">
          <div className="flex items-center justify-between text-[#8E95A5]">
            <span className="text-xs font-bold uppercase tracking-wider">Virtual Balance Pool</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ${stats.totalAllocatedDemoBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#71788A]">
            <span>Simulated Payouts:</span>
            <span className="text-white font-bold">${stats.totalSimulatedPayouts.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Live Activity Records */}
        <div className="p-4 rounded-2xl bg-[#101218] border border-[#252936] space-y-2">
          <div className="flex items-center justify-between text-[#8E95A5]">
            <span className="text-xs font-bold uppercase tracking-wider">Simulated Activity</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalActivity.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#71788A]">
            <span>Active games:</span>
            <span className="text-purple-400 font-bold">Mines, Dice, Roulette, Plinko</span>
          </div>
        </div>

        {/* Database & Engine Health */}
        <div className="p-4 rounded-2xl bg-[#101218] border border-[#252936] space-y-2">
          <div className="flex items-center justify-between text-[#8E95A5]">
            <span className="text-xs font-bold uppercase tracking-wider">Persistent Storage</span>
            <Server className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">{stats.dbEngine}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#71788A]">
            <span>Support channels:</span>
            <span className={stats.telegramConfigured ? "text-emerald-400 font-bold" : "text-amber-400"}>
              {stats.telegramConfigured ? "Configured" : "Needs setup"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick Administrative Actions */}
      <div className="p-5 rounded-2xl bg-[#101218] border border-[#252936] space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#A2A9B9]">
          Direct Control Center Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => openBalanceModalForUser("add")}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#151824] hover:bg-red-600/10 hover:border-red-500/40 border border-[#2B3042] text-white transition-all cursor-pointer group"
          >
            <PlusCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-xs font-bold uppercase tracking-wider">+ Add Balance</span>
            <span className="text-[10px] text-[#71788A] font-mono mt-0.5">Instant Real-time</span>
          </button>

          <button
            type="button"
            onClick={() => openBalanceModalForUser("remove")}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#151824] hover:bg-red-600/10 hover:border-red-500/40 border border-[#2B3042] text-white transition-all cursor-pointer group"
          >
            <MinusCircle className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-xs font-bold uppercase tracking-wider">- Debit Balance</span>
            <span className="text-[10px] text-[#71788A] font-mono mt-0.5">Audit Logged</span>
          </button>

          <Link
            href="/admin/promotions"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#151824] hover:bg-red-600/10 hover:border-red-500/40 border border-[#2B3042] text-white transition-all cursor-pointer group"
          >
            <Gift className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Promotions</span>
            <span className="text-[10px] text-[#71788A] font-mono mt-0.5">CRUD Manager</span>
          </Link>

          <Link
            href="/admin/support"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#151824] hover:bg-red-600/10 hover:border-red-500/40 border border-[#2B3042] text-white transition-all cursor-pointer group"
          >
            <HelpCircle className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Support Links</span>
            <span className="text-[10px] text-[#71788A] font-mono mt-0.5">Telegram/WA</span>
          </Link>

          <Link
            href="/admin/games"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#151824] hover:bg-red-600/10 hover:border-red-500/40 border border-[#2B3042] text-white transition-all cursor-pointer group"
          >
            <Gamepad2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Games Lobby</span>
            <span className="text-[10px] text-[#71788A] font-mono mt-0.5">Spyke Feeds</span>
          </Link>

          <Link
            href="/admin/users"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#151824] hover:bg-red-600/10 hover:border-red-500/40 border border-[#2B3042] text-white transition-all cursor-pointer group"
          >
            <Users className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Users Directory</span>
            <span className="text-[10px] text-[#71788A] font-mono mt-0.5">Balances & Detail</span>
          </Link>
        </div>
      </div>

      {/* 3. Real-time Live Activity Ledger */}
      <div className="p-5 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-tight text-white flex items-center gap-2">
              <span>Recent Simulated Play Activity</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-mono">
                Live Data
              </span>
            </h2>
            <p className="text-xs text-[#8E95A5] mt-0.5">
              Continuously updating demonstration gameplay records from PostgreSQL
            </p>
          </div>
          <Link
            href="/admin/activity"
            className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#252936]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#151824] border-b border-[#252936] text-[#8E95A5]">
                <th className="p-3">Tester Username</th>
                <th className="p-3">Game Title</th>
                <th className="p-3 text-right">Multiplier</th>
                <th className="p-3 text-right">Payout Amount</th>
                <th className="p-3 text-right">Simulated Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202434] bg-[#0C0E14]">
              {recentActivity.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-[#121520] transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{item.username}</span>
                  </td>
                  <td className="p-3 text-[#C4CBD8]">
                    <span className="px-2 py-0.5 rounded bg-[#1B1F2D] border border-white/10">
                      {item.game}
                    </span>
                  </td>
                  <td className="p-3 text-right text-amber-400 font-bold">
                    {item.multiplier}x
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-400">
                    +${Number(item.payout_amount).toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-[#71788A]">
                    {item.created_at ? new Date(item.created_at).toLocaleTimeString() : "Just now"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Balance Adjustment Modal */}
      {balanceModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#10131B] border border-[#282D3D] rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#222634] pb-3">
              <div className="flex items-center gap-2">
                {balanceModal.actionType === "add" ? (
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <MinusCircle className="w-5 h-5 text-red-400" />
                )}
                <h3 className="text-base font-bold text-white uppercase">
                  {balanceModal.actionType === "add" ? "Deposit Demo Credit" : "Debit Demo Balance"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBalanceModal(prev => ({ ...prev, isOpen: false }))}
                className="text-xs font-mono text-[#71788A] hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleQuickBalanceSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#8E95A5] mb-1">Target Tester User</label>
                <select
                  value={balanceModal.userId}
                  onChange={(e) => {
                    const uId = parseInt(e.target.value, 10);
                    const sel = usersList.find(u => u.id === uId);
                    setBalanceModal(prev => ({
                      ...prev,
                      userId: uId,
                      userName: sel ? sel.name : "",
                      currentBalance: sel ? sel.balance : 0
                    }));
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
                >
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) — Balance: ${Number(u.balance).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8E95A5] mb-1">Virtual Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={balanceModal.amount}
                  onChange={(e) => setBalanceModal(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white font-bold text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[#8E95A5] mb-1">Reason for Audit Log</label>
                <input
                  type="text"
                  value={balanceModal.reason}
                  onChange={(e) => setBalanceModal(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  placeholder="e.g. VIP test reload"
                  className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {balanceModal.feedback && (
                <div className={`p-3 rounded-xl border text-xs ${balanceModal.feedback.startsWith("Success") ? "bg-emerald-950/40 border-emerald-500 text-emerald-200" : "bg-red-950/40 border-red-500 text-red-200"}`}>
                  {balanceModal.feedback}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceModal(prev => ({ ...prev, isOpen: false }))}
                  className="w-1/2 py-2.5 rounded-xl bg-[#1C202C] hover:bg-[#252A3A] text-white font-bold uppercase transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={balanceModal.isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase transition-colors shadow-lg shadow-red-600/30"
                >
                  {balanceModal.isSubmitting ? "Updating..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminControlShell>
  );
}
