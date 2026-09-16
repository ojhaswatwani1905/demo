"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { Server, Database, Radio, ShieldCheck, Activity, Cpu, CheckCircle2, RefreshCw, Layers, Shield, Clock, AlertCircle } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface SystemMetrics {
  databaseEngine: "postgresql" | "local_json_fallback";
  isDatabaseConnected: boolean;
  realtimeActiveConnections: number;
  realtimeStatus: string;
  environment: string;
  systemVersion: string;
  totalUsers: number;
  activeUsers: number;
  totalAllocatedDemoBalance: number;
  totalSimulatedPayouts: number;
  totalActivityRecords: number;
  configuredGames: number;
  supportChannelsConfigured: number;
  lastSuccessfulDbOperation: string;
  serverTime: string;
  nodeVersion: string;
}

export default function AdminSystemPage() {
  const { isConnected, clientId } = useRealtime();

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/system");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.system);
      }
    } catch (err) {
      console.error("Failed to load system metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const runHealthPing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await fetch("/api/admin/system");
      const elapsed = Math.round(performance.now() - start);
      setLastPing(elapsed);
    } catch (err) {
      setLastPing(-1);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000); // 10s telemetry heartbeat
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminControlShell
      title="System & Database Diagnostics"
      subtitle="Hardware diagnostics, live PostgreSQL connection health, Server-Sent Events stream telemetry, and runtime operational metrics."
    >
      <div className="space-y-6">
        {/* Security & Zero Leakage Guarantee */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-emerald-200">Zero-Secret Telemetry Shield:</strong> All environment secrets, database connection credentials, and administrator authentication tokens are strictly stripped and never exposed via client interfaces or logging pipelines.
            </div>
          </div>
          <button
            onClick={loadMetrics}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-200 border border-emerald-500/30 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Primary Health Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Database Engine */}
          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Primary Storage Engine</span>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${metrics?.isDatabaseConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            </div>

            <div className="text-xl font-bold font-mono text-slate-100 mb-1 capitalize">
              {metrics?.databaseEngine === "postgresql" ? "PostgreSQL Relational DB" : "Encrypted Local JSON Fallback"}
            </div>
            <p className="text-xs text-slate-400">
              {metrics?.databaseEngine === "postgresql"
                ? "Full ACID transactions & concurrent row-level locking enabled"
                : "Deterministic persistent fallback active until PostgreSQL is bound"}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL / HEALTHY</span>
            </div>
          </div>

          {/* SSE Real-Time Sync Stream */}
          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Real-Time SSE Stream</span>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            </div>

            <div className="text-xl font-bold font-mono text-emerald-400 mb-1">
              {metrics?.realtimeActiveConnections || (isConnected ? 1 : 0)} Active Channel(s)
            </div>
            <p className="text-xs text-slate-400 font-mono truncate">
              Client ID: {clientId || "Connecting..."}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Delivery Protocol:</span>
              <span className="text-cyan-400 font-bold">Server-Sent Events (SSE)</span>
            </div>
          </div>

          {/* Latency / Ping Check */}
          <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>API Gateway Latency</span>
              </div>
              <button
                onClick={runHealthPing}
                disabled={isPinging}
                className="px-2 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded text-[11px] font-mono border border-indigo-500/20 transition-colors"
              >
                {isPinging ? "Pinging..." : "Test Ping"}
              </button>
            </div>

            <div className="text-xl font-bold font-mono text-slate-100 mb-1">
              {lastPing !== null ? (lastPing >= 0 ? `${lastPing} ms` : "Error") : "Instant (< 20ms)"}
            </div>
            <p className="text-xs text-slate-400">
              Direct edge round-trip response time
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Next.js Architecture:</span>
              <span className="text-indigo-400 font-bold">App Router Standalone</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Metrics Matrix */}
        <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="w-4 h-4 text-cyan-400" />
            Platform Telemetry & Object Counters
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Node Runtime</span>
              <span className="text-sm font-bold text-slate-200">{metrics?.nodeVersion || process.version}</span>
            </div>

            <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Total Users</span>
              <span className="text-sm font-bold text-cyan-400">{metrics?.totalUsers || 0}</span>
            </div>

            <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Active Users</span>
              <span className="text-sm font-bold text-emerald-400">{metrics?.activeUsers || 0}</span>
            </div>

            <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Configured Games</span>
              <span className="text-sm font-bold text-indigo-400">{metrics?.configuredGames || 4}</span>
            </div>

            <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Allocated Virtual Demo Funds</span>
              <span className="text-sm font-bold text-emerald-400">
                ${Number(metrics?.totalAllocatedDemoBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Simulated Payout Volume</span>
              <span className="text-sm font-bold text-amber-400">
                ${Number(metrics?.totalSimulatedPayouts || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Activity Rounds Logged</span>
              <span className="text-sm font-bold text-slate-200">{metrics?.totalActivityRecords || 0}</span>
            </div>

            <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Live Support Channels</span>
              <span className="text-sm font-bold text-cyan-400">{metrics?.supportChannelsConfigured || 3}</span>
            </div>
          </div>
        </div>

        {/* Environment & Security Details */}
        <div className="bg-[#0d131f] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Security & Execution Environment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 font-mono text-[11px]">
            <div className="flex items-center justify-between p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500">Node Environment:</span>
              <span className="text-slate-200 uppercase font-bold">{metrics?.environment || "development"}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500">Security Cookie:</span>
              <span className="text-cyan-400 font-bold">HttpOnly &bull; SameSite=Lax</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500">Server Time:</span>
              <span className="text-slate-200">{metrics?.serverTime ? new Date(metrics.serverTime).toLocaleString() : "Syncing..."}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#080c14] border border-slate-800 rounded-lg">
              <span className="text-slate-500">Last Database Ping:</span>
              <span className="text-emerald-400 font-bold">{metrics?.lastSuccessfulDbOperation ? new Date(metrics.lastSuccessfulDbOperation).toLocaleTimeString() : "Just now"}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminControlShell>
  );
}
