"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Eye, RefreshCw, Save, X, ArrowRight } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface PromotionItem {
  id: number;
  title: string;
  short_desc: string;
  long_desc: string;
  banner_image: string;
  cta_text: string;
  start_date?: string;
  end_date?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminPromotionsPage() {
  const { subscribe } = useRealtime();

  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit/Create Modal State
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    item: Partial<PromotionItem>;
    isSubmitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    isEditing: false,
    item: {},
    isSubmitting: false,
    error: null
  });

  const loadPromotions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/promotions");
      if (res.ok) {
        const d = await res.json();
        if (d.promotions) setPromotions(d.promotions);
      }
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    const unsub = subscribe("PROMOTION_UPDATED", () => loadPromotions());
    return unsub;
  }, [subscribe]);

  const handleOpenCreate = () => {
    setModalData({
      isOpen: true,
      isEditing: false,
      item: {
        title: "",
        short_desc: "",
        long_desc: "",
        banner_image: "/assets/ui/promotions_hero.jpg",
        cta_text: "EXPLORE",
        display_order: promotions.length + 1,
        is_active: true
      },
      isSubmitting: false,
      error: null
    });
  };

  const handleOpenEdit = (promo: PromotionItem) => {
    setModalData({
      isOpen: true,
      isEditing: true,
      item: { ...promo },
      isSubmitting: false,
      error: null
    });
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalData(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const method = modalData.isEditing ? "PUT" : "POST";
      const res = await fetch("/api/admin/promotions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalData.item)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setModalData(prev => ({ ...prev, isOpen: false, isSubmitting: false }));
        loadPromotions();
      } else {
        setModalData(prev => ({ ...prev, isSubmitting: false, error: data.error || "Failed to save promotion" }));
      }
    } catch (err: any) {
      setModalData(prev => ({ ...prev, isSubmitting: false, error: err.message }));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this promotion? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadPromotions();
      }
    } catch (err) {
      console.error("Error deleting promotion:", err);
    }
  };

  const handleToggleActive = async (promo: PromotionItem) => {
    try {
      await fetch("/api/admin/promotions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: promo.id, is_active: !promo.is_active })
      });
      loadPromotions();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  return (
    <AdminControlShell
      title="Promotions Manager"
      subtitle="Create, edit, reorder, and activate demonstration campaign cards with live card previews"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPromotions}
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
            <span>Add Promotion</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-[#252936] bg-[#101218]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#151824] border-b border-[#252936] text-[#8E95A5]">
                <th className="p-3 w-12 text-center">Order</th>
                <th className="p-3">Promotion Campaign</th>
                <th className="p-3 hidden md:table-cell">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202434]">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-[#141722] transition-colors">
                  <td className="p-3 text-center text-[#71788A] font-bold">
                    #{p.display_order}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg overflow-hidden relative bg-[#090A0E] border border-white/10 shrink-0">
                        <Image src={p.banner_image || "/assets/ui/promotions_hero.jpg"} alt={p.title} fill className="object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-white block truncate max-w-xs">{p.title}</span>
                        <span className="text-[10px] text-[#71788A] font-sans">CTA: {p.cta_text}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-[#A2A9B9] hidden md:table-cell max-w-sm truncate">
                    {p.short_desc}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${
                        p.is_active
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40"
                          : "bg-red-950/40 text-red-400 border-red-500/30 hover:bg-red-900/40"
                      }`}
                    >
                      {p.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{p.is_active ? "Active" : "Disabled"}</span>
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-[#1B1F2C] hover:bg-[#252A3B] text-[#A2A9B9] hover:text-white transition-colors cursor-pointer"
                        title="Edit Promotion"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-200 border border-red-500/20 transition-colors cursor-pointer"
                        title="Delete Promotion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Create/Edit Modal with Live Preview */}
      {modalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#10131B] border border-[#282D3D] rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in my-8">
            <div className="flex items-center justify-between border-b border-[#222634] pb-3">
              <h3 className="text-base font-bold text-white uppercase">
                {modalData.isEditing ? "Edit Promotion Campaign" : "Create New Promotion Campaign"}
              </h3>
              <button
                type="button"
                onClick={() => setModalData(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg hover:bg-white/10 text-[#8E95A5] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LIVE PROMOTION CARD PREVIEW */}
            <div className="p-3.5 rounded-xl bg-[#090A0E] border border-[#222634] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#71788A] uppercase">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-red-400" />
                  <span>Public Card Live Preview</span>
                </span>
                <span className={modalData.item.is_active ? "text-emerald-400" : "text-red-400"}>
                  {modalData.item.is_active ? "Will appear active" : "Draft / Disabled"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#141724] border border-[#262B3C] flex items-center gap-4">
                <div className="w-20 h-16 rounded-lg relative overflow-hidden bg-black/50 shrink-0">
                  <Image src={modalData.item.banner_image || "/assets/ui/promotions_hero.jpg"} alt="Preview" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white uppercase truncate">
                    {modalData.item.title || "Promotion Headline"}
                  </h4>
                  <p className="text-xs text-[#9DA6B8] line-clamp-1 mt-0.5 font-sans">
                    {modalData.item.short_desc || "Short promotion summary will appear here..."}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 mt-2 font-mono uppercase">
                    <span>{modalData.item.cta_text || "EXPLORE"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[#8E95A5] mb-1 font-bold">Promotion Title</label>
                  <input
                    type="text"
                    value={modalData.item.title || ""}
                    onChange={(e) => setModalData({ ...modalData, item: { ...modalData.item, title: e.target.value } })}
                    required
                    placeholder="e.g. 100% Weekend Demo Match"
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500 font-sans text-sm font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#8E95A5] mb-1 font-bold">Short Description</label>
                  <input
                    type="text"
                    value={modalData.item.short_desc || ""}
                    onChange={(e) => setModalData({ ...modalData, item: { ...modalData.item, short_desc: e.target.value } })}
                    required
                    placeholder="Brief description for public cards"
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#8E95A5] mb-1 font-bold">Long Description</label>
                  <textarea
                    rows={2}
                    value={modalData.item.long_desc || ""}
                    onChange={(e) => setModalData({ ...modalData, item: { ...modalData.item, long_desc: e.target.value } })}
                    placeholder="Detailed terms and demo reward rules"
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#8E95A5] mb-1 font-bold">Banner Image Path</label>
                  <input
                    type="text"
                    value={modalData.item.banner_image || ""}
                    onChange={(e) => setModalData({ ...modalData, item: { ...modalData.item, banner_image: e.target.value } })}
                    placeholder="/assets/ui/promotions_hero.jpg"
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[#8E95A5] mb-1 font-bold">CTA Button Label</label>
                  <input
                    type="text"
                    value={modalData.item.cta_text || ""}
                    onChange={(e) => setModalData({ ...modalData, item: { ...modalData.item, cta_text: e.target.value } })}
                    placeholder="e.g. CLAIM DEMO RELOAD"
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[#8E95A5] mb-1 font-bold">Display Priority Order</label>
                  <input
                    type="number"
                    value={modalData.item.display_order ?? 1}
                    onChange={(e) => setModalData({ ...modalData, item: { ...modalData.item, display_order: parseInt(e.target.value, 10) || 1 } })}
                    className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalData.item.is_active ?? true}
                      onChange={(e) => setModalData({ ...modalData, item: { ...modalData.item, is_active: e.target.checked } })}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Active on Public Website</span>
                  </label>
                </div>
              </div>

              {modalData.error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                  {modalData.error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#222634]">
                <button
                  type="button"
                  onClick={() => setModalData(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl bg-[#1B1F2C] hover:bg-[#252A3C] text-white font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalData.isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase transition-colors shadow-lg shadow-red-600/30"
                >
                  {modalData.isSubmitting ? "Saving..." : "Save Promotion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminControlShell>
  );
}
