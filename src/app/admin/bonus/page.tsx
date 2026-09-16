"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { Sparkles, Save, CheckCircle2, AlertCircle, RefreshCw, Clock, Coins, Shield } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

export default function AdminBonusPage() {
  const { subscribe } = useRealtime();

  const [bonus, setBonus] = useState({
    daily_faucet_amount: 1000,
    faucet_cooldown_hours: 24,
    topup_options: [500, 1000, 5000],
    max_balance: 100000,
    bonus_multiplier: 1.0,
    is_active: true,
    reset_rules: "Balances can be reset once every 6 hours if virtual balance drops below $100.00"
  });

  const [topupInput, setTopupInput] = useState("500, 1000, 5000");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadBonus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bonus");
      if (res.ok) {
        const d = await res.json();
        if (d.settings) {
          setBonus({
            daily_faucet_amount: Number(d.settings.daily_faucet_amount || 1000),
            faucet_cooldown_hours: Number(d.settings.faucet_cooldown_hours || 24),
            topup_options: Array.isArray(d.settings.topup_options) ? d.settings.topup_options : [500, 1000, 5000],
            max_balance: Number(d.settings.max_balance || 100000),
            bonus_multiplier: Number(d.settings.bonus_multiplier || 1.0),
            is_active: d.settings.is_active ?? true,
            reset_rules: d.settings.reset_rules || ""
          });
          setTopupInput(
            Array.isArray(d.settings.topup_options)
              ? d.settings.topup_options.join(", ")
              : "500, 1000, 5000"
          );
        }
      }
    } catch (err) {
      console.error("Failed to load bonus settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBonus();
  }, []);

  useEffect(() => {
    const unsub = subscribe("BONUS_UPDATED", (payload: any) => {
      if (payload) {
        setBonus(prev => ({ ...prev, ...payload }));
      }
    });
    return unsub;
  }, [subscribe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const parsedTopups = topupInput
      .split(",")
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    const payload = {
      ...bonus,
      topup_options: parsedTopups.length > 0 ? parsedTopups : [500, 1000, 5000]
    };

    try {
      const res = await fetch("/api/admin/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "Bonus & faucet parameters successfully saved to PostgreSQL and broadcast via real-time!" });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to update bonus settings" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminControlShell
      title="Bonus & Faucet Controls"
      subtitle="Configure daily simulated reload faucets, cooldown timers, and quick refill limits"
      actions={
        <button
          type="button"
          onClick={loadBonus}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12151F] hover:bg-[#181B26] border border-[#262B3B] text-xs font-mono text-[#A2A9B9] hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Reload</span>
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium animate-in fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-500 text-emerald-200"
                : "bg-red-950/40 border-red-500 text-red-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-5">
          <div className="flex items-center justify-between border-b border-[#252936] pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Daily Demo Faucet Parameters
              </h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={bonus.is_active}
                onChange={(e) => setBonus({ ...bonus, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span>Bonus System Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Daily Demo Faucet Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={bonus.daily_faucet_amount}
                onChange={(e) => setBonus({ ...bonus, daily_faucet_amount: parseFloat(e.target.value) || 0 })}
                required
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white font-bold text-sm focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-[#636A7D] mt-1">Virtual credits claimed once every cycle</p>
            </div>

            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Faucet Cooldown Period (Hours)</label>
              <input
                type="number"
                min="1"
                max="168"
                value={bonus.faucet_cooldown_hours}
                onChange={(e) => setBonus({ ...bonus, faucet_cooldown_hours: parseInt(e.target.value, 10) || 24 })}
                required
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white font-bold text-sm focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-[#636A7D] mt-1">Wait time before tester can claim faucet again</p>
            </div>

            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Preset Refill Amounts ($ comma-separated)</label>
              <input
                type="text"
                value={topupInput}
                onChange={(e) => setTopupInput(e.target.value)}
                placeholder="500, 1000, 5000"
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white font-bold text-sm focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-[#636A7D] mt-1">Buttons available in demo wallet refill modal</p>
            </div>

            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Multiplier Boost Factor</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                value={bonus.bonus_multiplier}
                onChange={(e) => setBonus({ ...bonus, bonus_multiplier: parseFloat(e.target.value) || 1.0 })}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white font-bold text-sm focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-[#636A7D] mt-1">Simulated promotional campaign booster</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#8E95A5] mb-1 font-bold">Reset Policy Description</label>
              <textarea
                rows={2}
                value={bonus.reset_rules}
                onChange={(e) => setBonus({ ...bonus, reset_rules: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500 text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#252936] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Bonus Settings"}</span>
            </button>
          </div>
        </div>
      </form>
    </AdminControlShell>
  );
}
