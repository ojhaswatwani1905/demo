"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, ShieldCheck, HelpCircle, Menu, X, Send, MessageCircle, ExternalLink } from "lucide-react";
import { useUI } from "@/context/UIContext";

export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar, isSidebarOpen } = useUI();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setTelegramUrl(data.config.telegramUrl || null);
          setWhatsappUrl(data.config.whatsappUrl || null);
        }
      })
      .catch(err => {
        console.error("Failed to load support config:", err);
      });
  }, []);

  // Ensure MobileNav is never rendered on any admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Navigation Bar: Icon-only, NO Home, NO text labels */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101217] border-t border-[#232632] px-4 py-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] shadow-2xl">
        <div className="grid grid-cols-4 items-center">
          {/* 1. Games */}
          <Link
            href="/games"
            className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
              pathname === "/games"
                ? "text-red-500 bg-red-500/10"
                : "text-[#8E95A5] hover:text-white"
            }`}
            aria-label="Games Lobby"
            title="Games Lobby"
          >
            <Gamepad2 className="w-5 h-5" />
          </Link>

          {/* 2. Fairness & Integrity */}
          <Link
            href="/fair"
            className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
              pathname === "/fair"
                ? "text-red-500 bg-red-500/10"
                : "text-[#8E95A5] hover:text-white"
            }`}
            aria-label="Fairness & Integrity"
            title="Fairness & Integrity"
          >
            <ShieldCheck className="w-5 h-5" />
          </Link>

          {/* 3. Support Quick Modal */}
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
              isSupportModalOpen
                ? "text-red-500 bg-red-500/10"
                : "text-[#8E95A5] hover:text-white"
            }`}
            aria-label="Platform Support"
            title="Platform Support"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* 4. Menu Drawer Trigger */}
          <button
            onClick={toggleSidebar}
            className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
              isSidebarOpen
                ? "text-red-500 bg-red-500/10"
                : "text-[#8E95A5] hover:text-white"
            }`}
            aria-label="Menu"
            title="Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Quick Support Modal for Mobile */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#13151D] border border-[#232736] rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Support Channels
                </h3>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="p-1 rounded-lg text-[#8E95A5] hover:text-white hover:bg-[#1C1F2B]"
                aria-label="Close support dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8E95A5] leading-relaxed">
              Connect directly with our demo platform support specialists.
            </p>

            <div className="space-y-2">
              {telegramUrl ? (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#181B26] hover:bg-[#202534] border border-[#262C3D] text-xs font-bold text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-sky-400" />
                    <span>Telegram Support</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#6E768B]" />
                </a>
              ) : (
                <div className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141620] border border-[#222634] text-xs text-[#525766] opacity-60">
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-[#525766]" />
                    <span>Telegram (Disabled)</span>
                  </div>
                  <span className="text-[10px] font-mono">Not Configured</span>
                </div>
              )}

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#181B26] hover:bg-[#202534] border border-[#262C3D] text-xs font-bold text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Support</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#6E768B]" />
                </a>
              ) : (
                <div className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141620] border border-[#222634] text-xs text-[#525766] opacity-60">
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-4 h-4 text-[#525766]" />
                    <span>WhatsApp (Disabled)</span>
                  </div>
                  <span className="text-[10px] font-mono">Not Configured</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSupportModalOpen(false)}
              className="w-full py-2 rounded-xl bg-[#181B26] hover:bg-[#202534] text-xs font-semibold text-[#8E95A5] hover:text-white border border-[#262B3B] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
