"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { Crown, Plus, Edit2, Trash2, CheckCircle2, XCircle, RefreshCw, X, Shield } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface VipTier {
  id: number;
  name: string;
  badge: string;
  min_activity: number;
  demo_bonus: number;
  benefits: string[];
  display_order: number;
  is_active: boolean;
}

export default function AdminVipPage() {
  const { subscribe } = useRealtime();

  const [tiers, setTiers] = useState<VipTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    item: Partial<VipTier>;
    benefitsText: string;
    isSubmitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    isEditing: false,
    item: {},
    benefitsText: "",
    isSubmitting: false,
    error: null
  });

  const loadTiers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/vip");
      if (res.ok) {
        const d = await res.json();
        if (d.tiers) setTiers(d.tiers);
      }
    } catch (err) {
      console.error("Failed to load VIP tiers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

  useEffect(() => {
    const unsub = subscribe("VIP_UPDATED", () => loadTiers());
    return unsub;
  }, [subscribe]);

  const handleOpenCreate = () => {
    setModal({
      isOpen: true,
      isEditing: false,
      item: {
        name: "",
        badge: "",
        min_activity: 10000,
        demo_bonus: 1000,
        display_order: tiers.length + 1,
        is_active: true
      },
      benefitsText: "Priority demo queue\n1.5x Daily Faucet refills\nExclusive demo previews",
      isSubmitting: false,
      error: null
    });
  };

  const handleOpenEdit = (tier: VipTier) => {
    setModal({
      isOpen: true,
      isEditing: true,
      item: { ...tier },
      benefitsText: Array.isArray(tier.benefits) ? tier.benefits.join("\n") : "",
      isSubmitting: false,
      error: null
    });
  };

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    setModal(prev => ({ ...prev, isSubmitting: true, error: null }));

    const parsedBenefits = modal.benefitsText
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      ...modal.item,
      benefits: parsedBenefits
    };

    try {
      const method = modal.isEditing ? "PUT" : "POST";
      const res = await fetch("/api/admin/vip", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setModal(prev => ({ ...prev, isOpen: false, isSubmitting: false }));
        loadTiers();
      } else {
        setModal(prev => ({ ...prev, isSubmitting: false, error: data.error || "Failed to save VIP tier" }));
      }
    } catch (err: any) {
      setModal(prev => ({ ...prev, isSubmitting: false, error: err.message }));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this VIP tier?")) return;
    try {
      const res = await fetch(`/api/admin/vip?id=${id}`, { method: "DELETE" });
      if (res.ok) loadTiers();
    } catch (err) {
      console.error("Error deleting VIP tier:", err);
    }
  };

  const handleToggleActive = async (tier: VipTier) => {
    try {
      await fetch("/api/admin/vip", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tier.id, is_active: !tier.is_active })
      });
      loadTiers();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  return (
    <AdminControlShell
      title="VIP Tier Architecture"
      subtitle="Configure demonstration VIP tiers, simulated loyalty progression, and demo benefits"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadTiers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12151F] hover:bg-[#181B26] border border-[#262B3B] text-xs font-mono text-[#A2A9B9] hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-red-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add VIP Tier</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`p-5 rounded-2xl bg-[#101218] border transition-all space-y-4 ${
                t.is_active ? "border-[#252936] hover:border-red-500/40" : "border-[#252936]/60 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase">{t.name}</h3>
                    <span className="text-[10px] font-mono font-bold text-red-400">
                      BADGE: {t.badge}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#71788A] font-bold">#{t.display_order}</span>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-[#8E95A5]">
                  <span>Min Demo Activity:</span>
                  <span className="text-white font-bold">${t.min_activity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#8E95A5]">
                  <span>Demo Tier Bonus:</span>
                  <span className="text-emerald-400 font-bold">+${t.demo_bonus.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090A0E] border border-[#222634] space-y-1 text-[11px] text-[#A2A9B9]">
                <span className="font-mono text-[9px] text-[#71788A] uppercase block font-bold">Simulated Perks:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {(t.benefits || []).map((b, idx) => (
                    <li key={idx} className="truncate">{b}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#1C1F2B] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(t)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer border ${
                    t.is_active
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                      : "bg-red-950/40 text-red-400 border-red-500/30"
                  }`}
                >
                  {t.is_active ? "Active" : "Disabled"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg bg-[#1B1F2C] hover:bg-[#252A3B] text-[#A2A9B9] hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for VIP Tier */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#10131B] border border-[#282D3D] rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in my-8">
            <div className="flex items-center justify-between border-b border-[#222634] pb-3">
              <h3 className="text-base font-bold text-white uppercase">
                {modal.isEditing ? "Edit VIP Tier" : "Add New VIP Tier"}
              </h3>
              <button
                type="button"
                onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg hover:bg-white/10 text-[#8E95A5] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[#8E95A5] mb-1 font-bold">Tier Name</label>
                  <input
                    type="text"
                    value={modal.item.name || ""}
                    onChange={(e) => setModal({ ...modal, item: { ...modal.item, name: e.target.value } })}
                    required
                    placeholder="e.g. VIP Diamond"
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500 text-sm font-bold"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[#8E95A5] mb-1 font-bold">Badge Code</label>
                  <input
                    type="text"
                    value={modal.item.badge || ""}
                    onChange={(e) => setModal({ ...modal, item: { ...modal.item, badge: e.target.value } })}
                    required
                    placeholder="e.g. DIAMOND"
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[#8E95A5] mb-1 font-bold">Min Demo Turnover ($)</label>
                  <input
                    type="number"
                    value={modal.item.min_activity ?? 0}
                    onChange={(e) => setModal({ ...modal, item: { ...modal.item, min_activity: parseFloat(e.target.value) || 0 } })}
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[#8E95A5] mb-1 font-bold">Simulated Tier Bonus ($)</label>
                  <input
                    type="number"
                    value={modal.item.demo_bonus ?? 0}
                    onChange={(e) => setModal({ ...modal, item: { ...modal.item, demo_bonus: parseFloat(e.target.value) || 0 } })}
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#8E95A5] mb-1 font-bold">Benefits (One per line)</label>
                  <textarea
                    rows={4}
                    value={modal.benefitsText}
                    onChange={(e) => setModal({ ...modal, benefitsText: e.target.value })}
                    placeholder="Standard demo reload&#10;Access to high limit sandbox&#10;Community tournaments"
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500 font-mono text-xs"
                  />
                </div>
              </div>

              {modal.error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                  {modal.error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#222634]">
                <button
                  type="button"
                  onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl bg-[#1B1F2C] hover:bg-[#252A3C] text-white font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modal.isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase transition-colors shadow-lg shadow-red-600/30"
                >
                  {modal.isSubmitting ? "Saving..." : "Save Tier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminControlShell>
  );
}
