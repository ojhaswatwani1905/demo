"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { Wallet, Search, ArrowUpRight, ArrowDownRight, RotateCcw, CheckCircle2, ShieldAlert, RefreshCw, Clock, User, Shield, Info } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  balance: number;
  is_active: boolean;
}

interface BalanceAuditLog {
  id: string | number;
  user_id: number;
  username?: string;
  admin_id: string;
  action_type: "add" | "remove" | "reset";
  amount: number;
  old_balance: number;
  new_balance: number;
  reason: string;
  created_at: string;
}

export default function AdminWalletPage() {
  const { subscribe } = useRealtime();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [actionType, setActionType] = useState<"add" | "remove" | "reset">("add");
  const [amount, setAmount] = useState("500");
  const [reason, setReason] = useState("");
  const [logs, setLogs] = useState<BalanceAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, auditRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/audit?type=balance&limit=50")
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
        if (!selectedUserId && uData.users && uData.users.length > 0) {
          setSelectedUserId(uData.users[0].id);
        }
      }

      if (auditRes.ok) {
        const aData = await auditRes.json();
        setLogs(aData.balanceLogs || []);
      }
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time synchronization
  useEffect(() => {
    const unsub = subscribe("USER_BALANCE_UPDATED", (payload: any) => {
      if (payload) {
        setUsers(prev =>
          prev.map(u => (u.id === payload.user_id ? { ...u, balance: Number(payload.new_balance) } : u))
        );

        // Prepend new balance adjustment to the log table
        const newLog: BalanceAuditLog = {
          id: `log-${Date.now()}`,
          user_id: payload.user_id,
          username: users.find(u => u.id === payload.user_id)?.name || `User #${payload.user_id}`,
          admin_id: payload.admin_id || "admin",
          action_type: payload.action,
          amount: payload.amount,
          old_balance: payload.old_balance,
          new_balance: payload.new_balance,
          reason: payload.reason || "Administrative adjustment",
          created_at: new Date().toISOString()
        };

        setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      }
    });

    return unsub;
  }, [subscribe, users]);

  const selectedUser = users.find(u => u.id === Number(selectedUserId));

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType,
          amount: parseFloat(amount) || 0,
          reason: reason.trim() || `Admin manual ${actionType} virtual balance operation`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: `Virtual balance updated to $${data.new_balance.toFixed(2)} for ${selectedUser?.name || "user"}. Instant SSE broadcast dispatched!`
        });
        setReason("");
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to adjust balance" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminControlShell
      title="Demo Balance & Virtual Wallet Controller"
      subtitle="Safely manage player test balances with database rollback protection, atomic transactions, and zero-reload instant SSE synchronization."
    >
      <div className="space-y-6">
        {/* Compliance Notice */}
        <div className="bg-[#0a121e] border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-cyan-300">Playground Balance Guarantee:</strong> All balances, adjustments, grants, and deductions are purely simulated virtual chips. Every balance modification triggers an immutable audit log record and an immediate real-time SSE push event to the player's active session without requiring page refreshes.
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Panel */}
          <div className="lg:col-span-1 bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Balance Controller</h3>
                <p className="text-xs text-slate-400">Execute atomic balance modification</p>
              </div>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              {/* Select User */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Simulated Player
                </label>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(Number(e.target.value))}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (#{u.id}) — ${Number(u.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected User Balance Card */}
              {selectedUser && (
                <div className="bg-[#080c14] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Current Balance</span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      ${Number(selectedUser.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${selectedUser.is_active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                    {selectedUser.is_active ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>
              )}

              {/* Action Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Modification Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("add")}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      actionType === "add"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                        : "bg-[#080c14] text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    + Grant / Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType("remove")}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      actionType === "remove"
                        ? "bg-red-500/20 text-red-400 border-red-500/50"
                        : "bg-[#080c14] text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    - Deduct
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType("reset")}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      actionType === "reset"
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                        : "bg-[#080c14] text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset ($1K)
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              {actionType !== "reset" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Amount ($ Virtual Coins)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {[100, 500, 1000, 5000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(String(val))}
                        className="flex-1 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors"
                      >
                        +${val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Justification Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Audit Memo / Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. VIP test grant, session reload"
                  className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedUserId}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Execute Transaction
              </button>
            </form>
          </div>

          {/* Audit History Panel */}
          <div className="lg:col-span-2 bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Balance Adjustment Audit Trail
                  </h3>
                </div>
                <button
                  onClick={loadData}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Sync
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080c14] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Player</th>
                      <th className="py-2.5 px-3">Admin</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                      <th className="py-2.5 px-3 text-right">Adjustment</th>
                      <th className="py-2.5 px-3 text-right">New Balance</th>
                      <th className="py-2.5 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                          {isLoading ? "Loading audit logs..." : "No virtual balance adjustments on record."}
                        </td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                            {log.created_at ? new Date(log.created_at).toLocaleTimeString() : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200 font-sans">
                            {log.username || `UID #${log.user_id}`}
                          </td>
                          <td className="py-2.5 px-3 text-cyan-400 text-[11px]">
                            {log.admin_id}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                log.action_type === "add"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : log.action_type === "remove"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              }`}
                            >
                              {log.action_type}
                            </span>
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-bold ${
                              log.action_type === "add"
                                ? "text-emerald-400"
                                : log.action_type === "remove"
                                ? "text-red-400"
                                : "text-cyan-400"
                            }`}
                          >
                            {log.action_type === "add" ? "+" : log.action_type === "remove" ? "-" : ""}${Number(log.amount || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-200">
                            ${Number(log.new_balance || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px] truncate max-w-[120px]" title={log.reason}>
                            {log.reason}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Showing last {logs.length} transactions</span>
              <span>All changes cryptographically signed & logged</span>
            </div>
          </div>
        </div>
      </div>
    </AdminControlShell>
  );
}
