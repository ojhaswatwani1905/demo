"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { Users, Search, RefreshCw, Eye, Power, DollarSign, Clock, Shield, CheckCircle2, ShieldAlert, X, ChevronRight, History, Gamepad2 } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  last_activity?: string;
  status: string;
}

interface UserDetail extends AdminUser {
  stats?: {
    totalBets: number;
    totalWagered: number;
    totalPayouts: number;
  };
  recentBets?: any[];
  balanceLogs?: any[];
}

export default function AdminUsersPage() {
  const { subscribe } = useRealtime();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Quick balance adjustment modal inside user view
  const [balanceModalUser, setBalanceModalUser] = useState<AdminUser | null>(null);
  const [balanceAction, setBalanceAction] = useState<"add" | "remove" | "reset">("add");
  const [balanceAmount, setBalanceAmount] = useState("500");
  const [balanceReason, setBalanceReason] = useState("");
  const [isSubmittingBalance, setIsSubmittingBalance] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Real-time synchronization
  useEffect(() => {
    const unsubStatus = subscribe("USER_STATUS_UPDATED", (payload: any) => {
      if (payload && payload.user_id) {
        setUsers(prev =>
          prev.map(u =>
            u.id === payload.user_id
              ? { ...u, is_active: payload.is_active, status: payload.is_active ? "Active" : "Disabled" }
              : u
          )
        );
        if (selectedUser && selectedUser.id === payload.user_id) {
          setSelectedUser(prev => prev ? { ...prev, is_active: payload.is_active, status: payload.is_active ? "Active" : "Disabled" } : null);
        }
      }
    });

    const unsubBalance = subscribe("USER_BALANCE_UPDATED", (payload: any) => {
      if (payload && payload.user_id) {
        setUsers(prev =>
          prev.map(u => (u.id === payload.user_id ? { ...u, balance: Number(payload.new_balance) } : u))
        );
        if (selectedUser && selectedUser.id === payload.user_id) {
          setSelectedUser(prev => prev ? { ...prev, balance: Number(payload.new_balance) } : null);
        }
      }
    });

    return () => {
      unsubStatus();
      unsubBalance();
    };
  }, [subscribe, selectedUser]);

  const toggleUserStatus = async (user: AdminUser) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev =>
          prev.map(u => (u.id === user.id ? { ...u, is_active: !user.is_active, status: !user.is_active ? "Active" : "Disabled" } : u))
        );
        setStatusMessage({
          type: "success",
          text: `User ${user.name} account is now ${!user.is_active ? "ACTIVE" : "DISABLED"}!`
        });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to update user status" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error" });
    }
  };

  const handleOpenDetail = async (user: AdminUser) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data.user);
      } else {
        setSelectedUser({ ...user });
      }
    } catch (err) {
      setSelectedUser({ ...user });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModalUser) return;
    setIsSubmittingBalance(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${balanceModalUser.id}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: balanceAction,
          amount: parseFloat(balanceAmount) || 0,
          reason: balanceReason || `Admin manual ${balanceAction} adjustment`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: `Demo balance for ${balanceModalUser.name} updated to $${data.new_balance.toFixed(2)} (Instantly synced via SSE)!`
        });
        setBalanceModalUser(null);
        setBalanceReason("");
        loadUsers();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to adjust balance" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setIsSubmittingBalance(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (statusFilter === "active" && !u.is_active) return false;
    if (statusFilter === "disabled" && u.is_active) return false;
    return true;
  });

  return (
    <AdminControlShell
      title="User Management"
      subtitle="Inspect simulated player accounts, toggle platform access, inspect gameplay telemetry, and adjust virtual demo balances."
    >
      <div className="space-y-6">
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

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d131f] border border-[#1e293b] p-3 rounded-xl">
          <div className="flex items-center gap-2 bg-[#080c14] border border-slate-800 rounded-lg px-3 py-1.5 flex-1">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by user ID, username, or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadUsers()}
              className="bg-transparent text-sm text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#080c14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Accounts</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>

            <button
              onClick={loadUsers}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Sync
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080c14] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-right">Virtual Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {isLoading ? "Loading player database..." : "No matching simulated users found."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center text-xs">
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100 block">{u.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">UID: #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        ${Number(u.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            u.is_active
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                          {u.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {u.last_activity ? new Date(u.last_activity).toLocaleString() : "Recently"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setBalanceModalUser(u);
                              setBalanceAction("add");
                              setBalanceAmount("500");
                            }}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-colors"
                            title="Adjust Demo Balance"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleUserStatus(u)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              u.is_active
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                            }`}
                            title={u.is_active ? "Disable Account" : "Activate Account"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenDetail(u)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                            title="View Player Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Dossier Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e1626] border border-cyan-500/30 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg font-bold">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    {selectedUser.name}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${selectedUser.is_active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                      {selectedUser.is_active ? "ACTIVE" : "DISABLED"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">UID: #{selectedUser.id} &bull; {selectedUser.email}</p>
                </div>
              </div>

              {/* Stat Summary */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#080c14] border border-slate-800 rounded-xl text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Current Balance</span>
                  <span className="text-base font-bold text-emerald-400">
                    ${Number(selectedUser.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Total Rounds</span>
                  <span className="text-base font-bold text-slate-200">
                    {selectedUser.stats?.totalBets || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Volume Wagered</span>
                  <span className="text-base font-bold text-cyan-400">
                    ${Number(selectedUser.stats?.totalWagered || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Balance Audit History */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  Recent Balance Adjustments
                </h4>
                <div className="bg-[#080c14] border border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {selectedUser.balanceLogs && selectedUser.balanceLogs.length > 0 ? (
                    selectedUser.balanceLogs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-0 font-mono">
                        <div>
                          <span className="text-slate-300 font-medium block">{log.action_type.toUpperCase()} by {log.admin_id}</span>
                          <span className="text-[10px] text-slate-500">{log.reason || "Administrative adjustment"}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${log.action_type === "add" ? "text-emerald-400" : log.action_type === "remove" ? "text-red-400" : "text-cyan-400"}`}>
                            {log.action_type === "add" ? "+" : log.action_type === "remove" ? "-" : ""}${Number(log.amount || 0).toFixed(2)}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            Bal: ${Number(log.new_balance).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-2">No manual balance adjustments on record.</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => toggleUserStatus(selectedUser)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    selectedUser.is_active
                      ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  }`}
                >
                  {selectedUser.is_active ? "Disable Account Access" : "Activate Account Access"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBalanceModalUser(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Adjust Balance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Balance Modal */}
        {balanceModalUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e1626] border border-cyan-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setBalanceModalUser(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Adjust Demo Balance</h3>
                  <p className="text-xs text-slate-400">
                    Player: <span className="text-slate-200 font-semibold">{balanceModalUser.name}</span> &bull; Current: ${Number(balanceModalUser.balance || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <form onSubmit={handleBalanceSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceAction("add")}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      balanceAction === "add"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-[#080c14] text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    + Grant / Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAction("remove")}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      balanceAction === "remove"
                        ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : "bg-[#080c14] text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    - Deduct
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAction("reset")}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      balanceAction === "reset"
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                        : "bg-[#080c14] text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    Reset ($1,000)
                  </button>
                </div>

                {balanceAction !== "reset" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Adjustment Amount ($)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={balanceAmount}
                      onChange={e => setBalanceAmount(e.target.value)}
                      required
                      className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Audit Memo / Justification
                  </label>
                  <input
                    type="text"
                    value={balanceReason}
                    onChange={e => setBalanceReason(e.target.value)}
                    placeholder="e.g. Test session credit, bug compensation"
                    className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setBalanceModalUser(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBalance}
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2"
                  >
                    {isSubmittingBalance ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Apply Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminControlShell>
  );
}
