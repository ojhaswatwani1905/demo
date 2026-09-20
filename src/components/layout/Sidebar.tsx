"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gamepad2,
  Gift,
  Crown,
  Sparkles,
  ShieldCheck,
  X,
  Dice5,
  Layers,
  CircleDot,
  Bomb,
  Shield,
  Send,
  MessageCircle,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { Logo } from "./Logo";
import { useUI } from "@/context/UIContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen: propIsOpen, onClose: propOnClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUI();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isSidebarOpen;
  const handleClose = propOnClose !== undefined ? propOnClose : closeSidebar;

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Support URLs fetched from PostgreSQL site configuration
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

  const mainNav = [
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "Promotions", href: "/promotions", icon: Gift },
    { name: "VIP", href: "/vip", icon: Crown },
    { name: "Bonus", href: "/bonus", icon: Sparkles },
    { name: "Fairness & Integrity", href: "/fair", icon: ShieldCheck },
    { name: "Support", href: "/support", icon: HelpCircle },
  ];

  const gameNav = [
    { name: "Mines", href: "/games/mines", icon: Bomb, provider: "Turbo Games" },
    { name: "Dice", href: "/games/dice", icon: Dice5, provider: "Turbo Games" },
    { name: "Roulette", href: "/games/roulette", icon: CircleDot, provider: "Spribe" },
    { name: "Plinko", href: "/games/plinko", icon: Layers, provider: "BETADRiX" },
  ];

  const isItemActive = (href: string) => {
    if (href === "/games") return pathname === "/games" || pathname.startsWith("/games/");
    if (href === "/fair") return pathname === "/fair";
    if (href === "/support") return pathname === "/support";
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Drawer Backdrop (z-40) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Fixed on desktop (lg:translate-x-0), off-canvas drawer on mobile (z-50) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#101217] border-r border-[#232632] flex flex-col transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#232632] shrink-0">
          <div className="flex items-center gap-2">
            <Logo compact />
            <span className="text-[10px] font-mono font-bold bg-[#1C1F2A] text-red-400 px-1.5 py-0.5 rounded border border-[#2D3244]">
              DEMO
            </span>
          </div>
          <button
            onClick={handleClose}
            className="lg:hidden p-2 text-[#8E95A5] hover:text-white rounded-lg hover:bg-[#181B24] transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Main Links */}
          <nav className="space-y-0.5">
            {mainNav.map(item => {
              const active = isItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? "bg-red-600/10 text-white border-l-2 border-red-500 font-bold"
                      : "text-[#8E95A5] hover:text-white hover:bg-[#181B24]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-red-500" : "text-[#6A7182]"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Featured Active Games */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6072] px-3 mb-1">
              Active Games
            </div>
            <nav className="space-y-0.5">
              {gameNav.map(item => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? "bg-red-600/10 text-white border-l-2 border-red-500 font-bold"
                        : "text-[#8E95A5] hover:text-white hover:bg-[#181B24]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-red-500" : "text-[#6A7182]"}`} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#5A6072]">
                      {item.provider.split(" ")[0]}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Support Section (Telegram & WhatsApp from PostgreSQL) */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5A6072] px-3 mb-1">
              <HelpCircle className="w-3 h-3 text-red-500" />
              <span>Support</span>
            </div>
            <div className="space-y-1">
              {/* Telegram Support Link */}
              {telegramUrl ? (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#8E95A5] hover:text-white hover:bg-[#181B24] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Send className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                    <span>Telegram</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#5A6072] group-hover:text-white" />
                </a>
              ) : (
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#525766] cursor-not-allowed opacity-60"
                  title="Telegram support URL not configured"
                >
                  <div className="flex items-center gap-3">
                    <Send className="w-4 h-4 text-[#525766]" />
                    <span>Telegram</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-[#14161F] px-1.5 py-0.5 rounded border border-[#232736]">
                    Disabled
                  </span>
                </div>
              )}

              {/* WhatsApp Support Link */}
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#8E95A5] hover:text-white hover:bg-[#181B24] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>WhatsApp</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#5A6072] group-hover:text-white" />
                </a>
              ) : (
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#525766] cursor-not-allowed opacity-60"
                  title="WhatsApp support URL not configured"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-[#525766]" />
                    <span>WhatsApp</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-[#14161F] px-1.5 py-0.5 rounded border border-[#232736]">
                    Disabled
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#232632] space-y-2 shrink-0">
          <div className="px-2.5 py-2 rounded-lg bg-[#14161E] border border-[#232632] text-[10px] text-[#788094] flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Virtual simulation. Zero real-money risk.</span>
          </div>
        </div>
      </aside>
    </>
  );
}
