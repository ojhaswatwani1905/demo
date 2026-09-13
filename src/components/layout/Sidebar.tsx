"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Flame,
  Layers,
  Sparkles,
  Dice5,
  Gamepad2,
  Trophy,
  Gift,
  Heart,
  Clock,
  Settings,
  Shield,
  X,
  Sliders,
  HelpCircle
} from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isFixedDesktop?: boolean;
}

export function Sidebar({ isOpen, onClose, isFixedDesktop = false }: SidebarProps) {
  const pathname = usePathname();
  const { favorites, recentGames } = useFavorites();

  const mainNavigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Casino Lobby", href: "/casino", icon: Flame, badge: "HOT" },
    { name: "Crash", href: "/games/crash", icon: Sparkles },
    { name: "Mines", href: "/games/mines", icon: Gamepad2 },
    { name: "Plinko", href: "/games/plinko", icon: Layers },
    { name: "Dice", href: "/games/dice", icon: Dice5 },
    { name: "Roulette", href: "/games/roulette", icon: Sliders },
  ];

  const categories = [
    { name: "Originals", href: "/casino?cat=Originals", icon: Flame },
    { name: "Table Games", href: "/casino?cat=Table", icon: Dice5 },
    { name: "Promotions", href: "/#promotions", icon: Gift },
  ];

  const bottomNavigation = [
    { name: "Admin Config", href: "/admin", icon: Settings, badge: "DEMO" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#09090F] border-r border-[#1C1C2A] flex flex-col transition-transform duration-300 ease-in-out ${
          isFixedDesktop ? "lg:translate-x-0" : ""
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1C1C2A] lg:hidden">
          <span className="text-sm font-black tracking-wider text-white uppercase">
            YOUR<span className="text-red-500">BRAND</span> MENU
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E9E] hover:text-white bg-[#141420]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6E6E82] px-3 mb-2">
              Discover
            </div>
            <nav className="space-y-1">
              {mainNavigation.map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                      isActive
                        ? "bg-[#1F0A0E] text-white border-l-2 border-red-500 shadow-[inset_0_0_15px_rgba(255,30,39,0.25)]"
                        : "text-[#A0A0B2] hover:text-white hover:bg-[#14141E]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? "text-red-500" : "text-[#7E7E94] group-hover:text-red-400"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/40">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Categories */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6E6E82] px-3 mb-2">
              Categories
            </div>
            <nav className="space-y-1">
              {categories.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8E8E9E] hover:text-white hover:bg-[#14141E] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#666678]" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Favorites & Recent Status */}
          <div className="pt-2 border-t border-[#171724]">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6E6E82] px-3 mb-2 flex items-center justify-between">
              <span>Quick Access</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500/30" />
            </div>
            <div className="px-3 py-2 bg-[#0E0E16] rounded-xl border border-[#1F1F2C] text-xs text-[#8E8E9E] space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Starred Games:</span>
                <span className="text-white font-mono font-bold">{favorites.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recent Plays:</span>
                <span className="text-white font-mono font-bold">{recentGames.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3.5 border-t border-[#1C1C2A] space-y-2">
          {bottomNavigation.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#250D11] text-white border border-red-500/50"
                    : "text-[#8E8E9E] hover:text-white hover:bg-[#14141E]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-red-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1F1F2C] text-red-300 border border-[#2E2E40]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-[10px] text-[#A0A0B0] leading-snug">
            <span className="text-red-400 font-bold block mb-0.5 uppercase tracking-wide">
              Safe Demonstration
            </span>
            No real currency or betting engines.
          </div>
        </div>
      </aside>
    </>
  );
}
