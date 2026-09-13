"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";
import { useFavorites } from "@/context/FavoritesContext";
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  Flame,
  Shield,
  Layers,
  Settings,
  ChevronDown,
  ExternalLink
} from "lucide-react";

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const pathname = usePathname();
  const { setIsSearchOpen } = useFavorites();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const showDemoNotice = (feature: string) => {
    setDemoNotice(`${feature} is simulated in this preview demonstration.`);
    setTimeout(() => setDemoNotice(null), 3500);
  };

  const navLinks = [
    { name: "Casino", href: "/casino" },
    { name: "Sports", href: "#sports", isDemoOnly: true },
    { name: "Live Casino", href: "/casino?cat=Originals" },
    { name: "Promotions", href: "/#promotions" },
    { name: "VIP", href: "#vip", isDemoOnly: true },
    { name: "Admin", href: "/admin" },
  ];

  return (
    <>
      {demoNotice && (
        <div className="fixed top-20 right-4 z-50 p-3.5 bg-[#12121D] border border-red-500/50 rounded-xl shadow-[0_0_25px_rgba(255,30,39,0.3)] text-xs text-white flex items-center gap-2 animate-in slide-in-from-top-2">
          <Shield className="w-4 h-4 text-red-500 shrink-0" />
          <span>{demoNotice}</span>
          <button onClick={() => setDemoNotice(null)} className="ml-2 text-[#8E8E9E] hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#08080C]/90 backdrop-blur-md border-b border-[#1F1F2C] shadow-lg shadow-black/60"
            : "bg-[#08080C]/70 backdrop-blur-sm border-b border-white/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Logo & Sidebar Toggle (if applicable) */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-[#8E8E9E] hover:text-white rounded-lg hover:bg-white/5"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Logo />
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              if (link.isDemoOnly) {
                return (
                  <button
                    key={link.name}
                    onClick={() => showDemoNotice(link.name)}
                    className="px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-lg text-[#A0A0B2] hover:text-white hover:bg-white/5"
                  >
                    {link.name}
                  </button>
                );
              }
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-lg ${
                    isActive
                      ? "text-white bg-red-600/20 border border-red-500/40 shadow-[0_0_12px_rgba(255,30,39,0.3)]"
                      : "text-[#A0A0B2] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Demo Balance, Deposit, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12121A] border border-[#222230] text-[#8E8E9E] hover:text-white hover:border-red-500/50 transition-all text-xs group"
              title="Search demo games (Ctrl+K / Cmd+K)"
            >
              <Search className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline font-medium">Search</span>
              <kbd className="hidden lg:inline-block text-[9px] font-mono bg-[#1C1C28] px-1.5 py-0.5 rounded border border-[#2E2E3E]">
                ⌘K
              </kbd>
            </button>

            {/* Balance Display (Desktop & Tablet) */}
            <div className="hidden sm:block">
              <BalanceDisplay />
            </div>

            {/* Balance Display (Mobile compact) */}
            <div className="sm:hidden">
              <BalanceDisplay compact />
            </div>

            {/* Notifications Button */}
            <button
              onClick={() => showDemoNotice("Notification feed (3 simulated platform alerts)")}
              className="p-2 rounded-xl bg-[#12121A] border border-[#222230] text-[#8E8E9E] hover:text-white hover:border-red-500/50 transition-all text-xs"
              title="Demo Notifications"
            >
              <Bell className="w-4 h-4 text-red-400" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#12121A] border border-[#222230] hover:border-red-500/50 transition-all text-xs group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-red-950 flex items-center justify-center text-white font-bold text-xs">
                  P1
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">Player01</span>
                  <span className="text-[9px] text-red-400 font-bold mt-0.5 tracking-wider">VIP BRONZE</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8E8E9E] group-hover:text-white transition-transform" />
              </button>

              {/* Profile Menu Flyout */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#0E0E16] border border-[#252538] rounded-xl shadow-[0_0_35px_rgba(0,0,0,0.8)] py-2 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#1C1C2A]">
                    <p className="text-xs font-bold text-white">Player01 (Demo Mode)</p>
                    <p className="text-[10px] text-red-400 font-mono mt-0.5">#DEMO-8842</p>
                  </div>

                  <Link
                    href="/casino"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#A0A0B2] hover:text-white hover:bg-white/5"
                  >
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>Casino Lobby</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      showDemoNotice("VIP Bronze tier rewards");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#A0A0B2] hover:text-white hover:bg-white/5 text-left"
                  >
                    <Shield className="w-4 h-4 text-red-500" />
                    <span>VIP Tier Status</span>
                  </button>

                  <Link
                    href="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#A0A0B2] hover:text-white hover:bg-white/5"
                  >
                    <Settings className="w-4 h-4 text-red-500" />
                    <span>Admin / Game URLs</span>
                  </Link>

                  <div className="my-1 border-t border-[#1C1C2A]" />

                  <div className="px-4 py-2">
                    <span className="text-[10px] text-[#707085] leading-tight block">
                      Demo Mode Active. No real personal data or payment credentials stored.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-[#8E8E9E] hover:text-white rounded-xl bg-[#12121A] border border-[#222230]"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Flyout Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-[#1F1F2C] bg-[#0A0A10] px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map(link => {
              if (link.isDemoOnly) {
                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      showDemoNotice(link.name);
                    }}
                    className="w-full text-left block px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-red-600/15"
                  >
                    {link.name}
                  </button>
                );
              }
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-red-600/15"
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#1C1C2A]">
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10"
              >
                <span>Demo Admin Panel</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
