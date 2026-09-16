"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { ShieldAlert, Search, RefreshCw, Filter, Clock, Eye, X, CheckCircle2, FileText, Database, Shield } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface AdminAuditLog {
  id: string | number;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  old_value?: any;
  new_value?: any;
  reason?: string;
  ip_address?: string;
  created_at: string;
}

export default function AdminAuditPage() {
  const { subscribe } = useRealtime();

  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/audit?type=admin&limit=200");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.adminLogs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Listen for realtime events that indicate an admin action was taken
  useEffect(() => {
    const unsubConfig = subscribe("CONFIG_UPDATED", () => loadLogs());
    const unsubPromo = subscribe("PROMOTION_UPDATED", () => loadLogs());
    const unsubVip = subscribe("VIP_TIER_UPDATED", () => loadLogs());
    const unsubBonus = subscribe("BONUS_UPDATED", () => loadLogs());
    const unsubGame = subscribe("GAME_CONFIG_UPDATED", () => loadLogs());
    const unsubStatus = subscribe("USER_STATUS_UPDATED", () => loadLogs());
    const unsubBalance = subscribe("USER_BALANCE_UPDATED", () => loadLogs());

    return () => {
      unsubConfig();
      unsubPromo();
      unsubVip();
      unsubBonus();
      unsubGame();
      unsubStatus();
      unsubBalance();
    };
  }, [subscribe]);

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== "all" && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        log.admin_id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target_type.toLowerCase().includes(q) ||
        String(log.target_id).toLowerCase().includes(q) ||
        (log.reason && log.reason.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    return true;
  });

  return (
    <AdminControlShell
      title="Admin Audit Trail & Immutable Log"
      subtitle="Complete chronological history of configuration edits, balance grants, user status toggles, and administrative operations."
    >
      <div className="space-y-6">
        {/* Compliance Header Card */}
        <div className="bg-[#0a121e] border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>
              <strong>Cryptographic Integrity:</strong> Audit logs are append-only. Every administrative mutation stores the before/after state diff, administrator signature, timestamp, and network identifier.
            </span>
          </div>
          <button
            onClick={loadLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Sync
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d131f] border border-[#1e293b] p-3 rounded-xl">
          <div className="flex items-center gap-2 bg-[#080c14] border border-slate-800 rounded-lg px-3 py-1.5 flex-1">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search audit trail by admin ID, action, target, or memo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="bg-[#080c14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="balance">Balance Operations</option>
              <option value="status">User Status</option>
              <option value="config">Platform Config</option>
              <option value="game">Game Config</option>
              <option value="promo">Promotions</option>
              <option value="vip">VIP Tiers</option>
              <option value="bonus">Bonus / Faucet</option>
              <option value="activity">Activity Purges</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080c14] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Target ID</th>
                  <th className="py-3 px-4">Audit Reason</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                      {isLoading ? "Fetching audit records..." : "No administrative audit records match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-cyan-400 font-semibold">
                        {log.admin_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] uppercase font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 capitalize font-sans">
                        {log.target_type}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {log.target_id || "Global"}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans truncate max-w-[180px]" title={log.reason || ""}>
                        {log.reason || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-sans font-medium transition-colors"
                        >
                          View Diff
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diff Inspection Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e1626] border border-cyan-500/30 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 font-mono">
              <button
                onClick={() => setSelectedLog(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 font-sans"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-sans">Audit Record Diff #{selectedLog.id}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedLog.action} &bull; Admin: {selectedLog.admin_id} &bull; {new Date(selectedLog.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans mb-1">Previous State</span>
                  <pre className="p-3 bg-[#080c14] border border-slate-800 rounded-lg text-slate-300 overflow-x-auto text-[11px] max-h-60">
                    {selectedLog.old_value ? JSON.stringify(selectedLog.old_value, null, 2) : "(Empty / Null)"}
                  </pre>
                </div>

                <div>
                  <span className="text-cyan-400 block text-[10px] uppercase font-sans mb-1 font-bold">New Updated State</span>
                  <pre className="p-3 bg-[#080c14] border border-cyan-500/30 rounded-lg text-emerald-400 overflow-x-auto text-[11px] max-h-60">
                    {selectedLog.new_value ? JSON.stringify(selectedLog.new_value, null, 2) : "(Empty / Null)"}
                  </pre>
                </div>
              </div>

              {selectedLog.reason && (
                <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg text-xs font-sans text-slate-300">
                  <strong className="text-slate-400">Reason / Memo:</strong> {selectedLog.reason}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-800 font-sans">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminControlShell>
  );
}
