"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

export default function AdminGeneralPage() {
  const { subscribe } = useRealtime();

  const [formData, setFormData] = useState({
    platform_name: "BETADRiX DEMO",
    demo_mode: true,
    default_demo_balance: 1250,
    currency_symbol: "$",
    maintenance_mode: false,
    registration_enabled: true,
    signin_enabled: true,
    topup_enabled: true,
    max_demo_balance: 100000,
    default_language: "English",
    timezone: "UTC"
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        if (data.general) {
          setFormData({
            platform_name: data.general.platform_name || "BETADRiX DEMO",
            demo_mode: data.general.demo_mode ?? true,
            default_demo_balance: Number(data.general.default_demo_balance || 1250),
            currency_symbol: data.general.currency_symbol || "$",
            maintenance_mode: Boolean(data.general.maintenance_mode),
            registration_enabled: data.general.registration_enabled ?? true,
            signin_enabled: data.general.signin_enabled ?? true,
            topup_enabled: data.general.topup_enabled ?? true,
            max_demo_balance: Number(data.general.max_demo_balance || 100000),
            default_language: data.general.default_language || "English",
            timezone: data.general.timezone || "UTC"
          });
        }
      }
    } catch (err) {
      console.error("Failed to load general config:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    const unsub = subscribe("GENERAL_CONFIG_UPDATED", (payload: any) => {
      if (payload) {
        setFormData(prev => ({ ...prev, ...payload }));
      }
    });
    return unsub;
  }, [subscribe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ general: formData })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "General platform configuration successfully saved to PostgreSQL and broadcast via real-time!" });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to update configuration" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error saving configuration" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminControlShell
      title="General Settings"
      subtitle="Configure core playground parameters, initial balances, and system availability toggles"
      actions={
        <button
          type="button"
          onClick={loadConfig}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12151F] hover:bg-[#181B26] border border-[#262B3B] text-xs font-mono text-[#A2A9B9] hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Reload</span>
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
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

        {/* Section 1: Platform Identification */}
        <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A2A9B9] border-b border-[#252936] pb-2">
            Platform Identity & Localization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Platform Brand Name</label>
              <input
                type="text"
                value={formData.platform_name}
                onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                required
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Currency Display Symbol</label>
              <input
                type="text"
                value={formData.currency_symbol}
                onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                required
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Default Display Language</label>
              <select
                value={formData.default_language}
                onChange={(e) => setFormData({ ...formData, default_language: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
              >
                <option value="English">English (US)</option>
                <option value="Spanish">Spanish</option>
                <option value="Portuguese">Portuguese</option>
                <option value="German">German</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Default Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="EST">EST (Eastern Standard Time)</option>
                <option value="PST">PST (Pacific Standard Time)</option>
                <option value="CET">CET (Central European Time)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Virtual Balance Allocations */}
        <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A2A9B9] border-b border-[#252936] pb-2">
            Simulated Balance Limits (Playground Only)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Default User Registration Balance ($)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.default_demo_balance}
                onChange={(e) => setFormData({ ...formData, default_demo_balance: parseFloat(e.target.value) || 0 })}
                required
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white font-bold text-sm focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-[#60677A] mt-1">Starting balance allocated upon sign-up</p>
            </div>

            <div>
              <label className="block text-[#8E95A5] mb-1 font-bold">Maximum Demo Balance Allowed ($)</label>
              <input
                type="number"
                step="0.01"
                min="1000"
                value={formData.max_demo_balance}
                onChange={(e) => setFormData({ ...formData, max_demo_balance: parseFloat(e.target.value) || 0 })}
                required
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white font-bold text-sm focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-[#60677A] mt-1">Upper limit cap on virtual demo wallets</p>
            </div>
          </div>
        </div>

        {/* Section 3: Availability & Feature Toggles */}
        <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A2A9B9] border-b border-[#252936] pb-2">
            Access Control & Availability Toggles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#090A0E] border border-[#252936] cursor-pointer hover:border-white/20 transition-colors">
              <div>
                <span className="font-bold text-white block">Maintenance Mode</span>
                <span className="text-[10px] text-[#71788A]">Show maintenance banner on public lobby</span>
              </div>
              <input
                type="checkbox"
                checked={formData.maintenance_mode}
                onChange={(e) => setFormData({ ...formData, maintenance_mode: e.target.checked })}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#090A0E] border border-[#252936] cursor-pointer hover:border-white/20 transition-colors">
              <div>
                <span className="font-bold text-white block">Demo Mode Active</span>
                <span className="text-[10px] text-[#71788A]">Strictly virtual simulation badges</span>
              </div>
              <input
                type="checkbox"
                checked={formData.demo_mode}
                onChange={(e) => setFormData({ ...formData, demo_mode: e.target.checked })}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#090A0E] border border-[#252936] cursor-pointer hover:border-white/20 transition-colors">
              <div>
                <span className="font-bold text-white block">Registration Enabled</span>
                <span className="text-[10px] text-[#71788A]">Allow new testers to sign up</span>
              </div>
              <input
                type="checkbox"
                checked={formData.registration_enabled}
                onChange={(e) => setFormData({ ...formData, registration_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#090A0E] border border-[#252936] cursor-pointer hover:border-white/20 transition-colors">
              <div>
                <span className="font-bold text-white block">Top-Up Faucet Enabled</span>
                <span className="text-[10px] text-[#71788A]">Allow playground balance refills</span>
              </div>
              <input
                type="checkbox"
                checked={formData.topup_enabled}
                onChange={(e) => setFormData({ ...formData, topup_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving to PostgreSQL..." : "Save Platform Settings"}</span>
          </button>
        </div>
      </form>
    </AdminControlShell>
  );
}
