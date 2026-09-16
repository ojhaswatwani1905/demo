"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { HelpCircle, ExternalLink, Save, CheckCircle2, AlertCircle, RefreshCw, Send, MessageCircle } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

export default function AdminSupportPage() {
  const { subscribe } = useRealtime();

  const [telegramUrl, setTelegramUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSupportConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setTelegramUrl(data.config.telegramUrl || "");
          setWhatsappUrl(data.config.whatsappUrl || "");
          setUpdatedAt(data.config.updatedAt || null);
        }
      }
    } catch (err) {
      console.error("Failed to load support config:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupportConfig();
  }, []);

  useEffect(() => {
    const unsub = subscribe("SUPPORT_UPDATED", (payload: any) => {
      if (payload) {
        if (payload.telegramUrl !== undefined) setTelegramUrl(payload.telegramUrl || "");
        if (payload.whatsappUrl !== undefined) setWhatsappUrl(payload.whatsappUrl || "");
        if (payload.updatedAt) setUpdatedAt(payload.updatedAt);
      }
    });
    return unsub;
  }, [subscribe]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    // Validate URL formats if not empty
    if (telegramUrl.trim()) {
      try {
        new URL(telegramUrl.trim());
      } catch {
        setIsSaving(false);
        setStatusMessage({ type: "error", text: "Invalid Telegram URL format. Must start with http:// or https://" });
        return;
      }
    }

    if (whatsappUrl.trim()) {
      try {
        new URL(whatsappUrl.trim());
      } catch {
        setIsSaving(false);
        setStatusMessage({ type: "error", text: "Invalid WhatsApp URL format. Must start with http:// or https://" });
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramUrl: telegramUrl.trim() || null,
          whatsappUrl: whatsappUrl.trim() || null
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: "Support channels successfully persisted in PostgreSQL & broadcast to all connected users in real-time!"
        });
        if (data.config?.updatedAt) setUpdatedAt(data.config.updatedAt);
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to update support configuration" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to connect to server" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminControlShell
      title="Support Channel Endpoints"
      subtitle="Manage official player support links with instant real-time public updates"
      actions={
        <button
          type="button"
          onClick={loadSupportConfig}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12151F] hover:bg-[#181B26] border border-[#262B3B] text-xs font-mono text-[#A2A9B9] hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Reload</span>
        </button>
      }
    >
      <div className="max-w-3xl space-y-6">
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

        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-6">
          <div className="space-y-4">
            {/* Telegram URL Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A2A9B9]">
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Telegram Support Channel URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/your_telegram_channel"
                  className="flex-1 p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white font-mono text-xs focus:outline-none focus:border-red-500"
                />
                {telegramUrl ? (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-[#181B26] hover:bg-[#222736] border border-[#2B3042] text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>TEST TELEGRAM</span>
                    <ExternalLink className="w-3 h-3 text-sky-400" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-3 py-2 rounded-xl bg-[#141620] border border-[#252936] text-xs font-mono text-[#555B6E] cursor-not-allowed"
                  >
                    TEST TELEGRAM
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#71788A] font-mono">
                Changes will immediately update the Telegram button across all public footers and support cards.
              </p>
            </div>

            {/* WhatsApp URL Field */}
            <div className="space-y-2 pt-2 border-t border-[#1C1F2B]">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A2A9B9]">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Support Endpoint URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  placeholder="https://wa.me/15551234567"
                  className="flex-1 p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white font-mono text-xs focus:outline-none focus:border-red-500"
                />
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-[#181B26] hover:bg-[#222736] border border-[#2B3042] text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>TEST WHATSAPP</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-3 py-2 rounded-xl bg-[#141620] border border-[#252936] text-xs font-mono text-[#555B6E] cursor-not-allowed"
                  >
                    TEST WHATSAPP
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#71788A] font-mono">
                Direct WhatsApp customer assistance link. Must open with target=&quot;_blank&quot; and rel=&quot;noopener noreferrer&quot;.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1C1F2B] flex items-center justify-between">
            <div className="text-[11px] font-mono text-[#636C80]">
              {updatedAt && <span>Last saved: {new Date(updatedAt).toLocaleString()}</span>}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving to PostgreSQL..." : "Save Support Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminControlShell>
  );
}
