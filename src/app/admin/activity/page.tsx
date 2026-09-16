"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { Activity, Search, RefreshCw, Trash2, Filter, TrendingUp, DollarSign, Award, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface BetActivity {
  id: string | number;
  username: string;
  game: string;
  bet_amount: number;
  payout_amount: number;
  multiplier?: number;
  created_at: string;
  result?: string;
}

export default function AdminActivityPage() {
  const { subscribe } = useRealtime();

  const [activities, setActivities] = useState<BetActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userQuery, setUserQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadActivity = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (gameFilter !== "all") params.set("game", gameFilter);
      if (userQuery.trim()) params.set("user", userQuery.trim());

      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activity || []);
      }
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [gameFilter]);

  // Real-time synchronization
  useEffect(() => {
    const unsubActivity = subscribe("ACTIVITY_RECORDED", (newBet: BetActivity) => {
      if (newBet) {
        setActivities(prev => [newBet, ...prev.slice(0, 199)]);
      }
    });

    const unsubReset = subscribe("ACTIVITY_RESET", () => {
      setActivities([]);
    });

    return () => {
      unsubActivity();
      unsubReset();
    };
  }, [subscribe]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadActivity();
  };

  const handlePurgeActivity = async () => {
    setIsResetting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/activity", {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActivities([]);
        setShowConfirmReset(false);
        setStatusMessage({
          type: "success",
          text: "Activity & bet ledger successfully purged! Audit log recorded."
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to purge activity records"
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setIsResetting(false);
    }
  };

  // Quick summary stats
  const totalVolume = activities.reduce((sum, a) => sum + Number(a.bet_amount || 0), 0);
  const totalPayouts = activities.reduce((sum, a) => sum + Number(a.payout_amount || 0), 0);
  const totalBetsCount = activities.length;
  const netYield = totalVolume - totalPayouts;

  return (
    <AdminControlShell
      title="Live Activity & Bets Ledger"
      subtitle="Real-time transaction stream of virtual gameplay rounds, wagers, and simulated payouts across all game engines."
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0d131f] border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-mono tracking-wider">Total Rounds Logged</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">
              {totalBetsCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-cyan-400/80">Simulated gameplay records</span>
          </div>

          <div className="bg-[#0d131f] border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-mono tracking-wider">Demo Wager Volume</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">
              ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-400/80">Virtual coin turnover</span>
          </div>

          <div className="bg-[#0d131f] border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-mono tracking-wider">Simulated Payouts</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">
              ${totalPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-amber-400/80">Virtual winnings awarded</span>
          </div>

          <div className="bg-[#0d131f] border border-indigo-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-mono tracking-wider">Net Virtual Yield</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className={`text-2xl font-black font-mono ${netYield >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {netYield >= 0 ? "+" : ""}${netYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-indigo-400/80">Simulated house margin</span>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/40 border-red-500/30 text-red-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Action Controls & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d131f] border border-[#1e293b] p-3 rounded-xl">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 bg-[#080c14] border border-slate-800 rounded-lg px-3 py-1.5 flex-1">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter by player username..."
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
                className="bg-transparent text-sm text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#080c14] border border-slate-800 rounded-lg px-3 py-1.5">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={gameFilter}
                onChange={e => setGameFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-200 focus:outline-none"
              >
                <option value="all">All Games</option>
                <option value="roulette">Roulette</option>
                <option value="mines">Mines</option>
                <option value="dice">Dice</option>
                <option value="plinko">Plinko</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Filter
            </button>
          </form>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={loadActivity}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Sync
            </button>

            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge Ledger
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080c14] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Game</th>
                  <th className="py-3 px-4 text-right">Demo Bet</th>
                  <th className="py-3 px-4 text-center">Multiplier</th>
                  <th className="py-3 px-4 text-right">Demo Payout</th>
                  <th className="py-3 px-4 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      {isLoading ? "Loading activity stream..." : "No virtual gameplay activity found in ledger."}
                    </td>
                  </tr>
                ) : (
                  activities.map(item => {
                    const isWin = Number(item.payout_amount) > Number(item.bet_amount);
                    const isPush = Number(item.payout_amount) === Number(item.bet_amount);

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 text-slate-400">
                          {item.created_at ? new Date(item.created_at).toLocaleTimeString() : "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-sans font-medium">
                          {item.username || "Anonymous Demo"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 uppercase text-[10px]">
                            {item.game}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-200 font-semibold">
                          ${Number(item.bet_amount || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">
                          {item.multiplier ? `${Number(item.multiplier).toFixed(2)}x` : "—"}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-semibold ${
                            isWin ? "text-emerald-400" : isPush ? "text-slate-400" : "text-red-400/80"
                          }`}
                        >
                          ${Number(item.payout_amount || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              isWin
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isPush
                                ? "bg-slate-800 text-slate-300"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {isWin ? "WIN" : isPush ? "PUSH" : "LOSS"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal for Reset */}
        {showConfirmReset && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e1626] border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Purge Activity Ledger?</h3>
                  <p className="text-xs text-slate-400">This action will clear simulated gameplay logs.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-red-950/20 border border-red-500/20 p-3 rounded-lg leading-relaxed">
                All virtual betting history in the ledger will be reset. An immutable administrative audit event will be logged recording this purge.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePurgeActivity}
                  disabled={isResetting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Confirm Purge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminControlShell>
  );
}
