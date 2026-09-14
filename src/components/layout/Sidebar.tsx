"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Gamepad2,
  LayoutGrid,
  Gift,
  Settings,
  X,
  Dice5,
  Layers,
  CircleDot,
  Bomb,
  ShieldCheck,
  Shield
} from "lucide-react";
import { Logo } from "./Logo";
import { useUI } from "@/context/UIContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isFixedDesktop?: boolean;
}

export function Sidebar({ isOpen: propIsOpen, onClose: propOnClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUI();

  // Support controlled or context-driven state
  const isOpen = propIsOpen !== undefined ? propIsOpen : isSidebarOpen;
  const handleClose = propOnClose !== undefined ? propOnClose : closeSidebar;

  const mainNav = [
    { name: "Home", href: "/", icon: Home },
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "All Games", href: "/games#all-games", icon: LayoutGrid },
  ];

  const gameNav = [
    { name: "Mines", href: "/games/mines", icon: Bomb, provider: "Turbo Games" },
    { name: "Dice", href: "/games/dice", icon: Dice5, provider: "Turbo Games" },
    { name: "Roulette", href: "/games/roulette", icon: CircleDot, provider: "Spribe" },
    { name: "Plinko", href: "/games/plinko", icon: Layers, provider: "Spribe" },
  ];

  const secondaryNav = [
    { name: "Promotions", href: "/#promotions", icon: Gift },
    { name: "Provably Fair", href: "/fair", icon: ShieldCheck },
  ];

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/games") return pathname === "/games";
    if (href === "/fair") return pathname === "/fair";
    if (href.startsWith("/games/")) return pathname === href;
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-200"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Fixed on desktop (lg:translate-x-0), off-canvas drawer on mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#101217] border-r border-[#232632] flex flex-col transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header: Logo + Clear Close Button */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#232632] shrink-0">
          <div className="flex items-center gap-2">
            <Logo compact />
            <span className="text-[10px] font-mono font-bold bg-[#1C1F2A] text-red-400 px-1.5 py-0.5 rounded border border-[#2D3244]">
              DEMO
            </span>
          </div>
          <button
            onClick={handleClose}
            className="lg:hidden p-2 text-[#8E95A5] hover:text-white rounded-lg hover:bg-[#181B24] transition-colors"
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

          {/* Featured Games */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6072] px-3 mb-1">
              Featured Games
            </div>
            <nav className="space-y-0.5">
              {gameNav.map(item => {
                const active = isItemActive(item.href);
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

          {/* Offers & Fairness */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6072] px-3 mb-1">
              Information
            </div>
            <nav className="space-y-0.5">
              {secondaryNav.map(item => {
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
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#232632] space-y-2 shrink-0">
          <Link
            href="/admin"
            onClick={handleClose}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              pathname === "/admin"
                ? "bg-red-600/10 text-white border-l-2 border-red-500 font-bold"
                : "text-[#8E95A5] hover:text-white hover:bg-[#181B24]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-3.5 h-3.5 text-red-400" />
              <span>Spyke Admin</span>
            </div>
            <span className="text-[9px] font-mono bg-[#181B24] text-[#8E95A5] px-1.5 py-0.5 rounded border border-[#2B2F3D]">
              CONFIG
            </span>
          </Link>

          <div className="px-2.5 py-2 rounded-lg bg-[#14161E] border border-[#232632] text-[10px] text-[#788094] flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Virtual simulation. Zero real-money risk.</span>
          </div>
        </div>
      </aside>
    </>
  );
}
