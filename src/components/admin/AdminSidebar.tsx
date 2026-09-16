"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  Gift,
  Crown,
  Sparkles,
  Gamepad2,
  Activity,
  Users,
  Wallet,
  Server,
  FileText,
  LogOut,
  UserCheck,
  Radio,
  X
} from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface AdminSidebarProps {
  adminId?: string;
  isDbConnected?: boolean;
  dbEngine?: string;
}

export function AdminSidebar({
  adminId = "admin",
  isDbConnected = true,
  dbEngine = "PostgreSQL"
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { connectionStatus } = useRealtime();

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/general", label: "General", icon: Settings },
    { href: "/admin/support", label: "Support", icon: HelpCircle },
    { href: "/admin/promotions", label: "Promotions", icon: Gift },
    { href: "/admin/vip", label: "VIP", icon: Crown },
    { href: "/admin/bonus", label: "Bonus", icon: Sparkles },
    { href: "/admin/games", label: "Games", icon: Gamepad2 },
    { href: "/admin/activity", label: "Activity", icon: Activity },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/wallet", label: "Wallet / Balances", icon: Wallet },
    { href: "/admin/system", label: "System", icon: Server },
    { href: "/admin/audit", label: "Audit Log", icon: FileText }
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin");
      router.refresh();
    } catch {
      router.replace("/admin");
    }
  };

  return (
    <>
      <aside className="w-64 bg-[#0E1017] border-r border-[#222634] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none overflow-y-auto">
        <div>
          {/* Top Header Branding */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#222634] bg-[#0A0B10]">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-600/30">
                B
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wider text-white">BETADRiX</span>
                  <span className="text-[9px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 px-1 py-0.2 rounded">
                    CONTROL
                  </span>
                </div>
                <p className="text-[10px] text-[#71788A] font-mono leading-tight">Admin Console</p>
              </div>
            </Link>

            {/* Real-time SSE Pulse Badge */}
            <div
              title={`Real-time sync: ${connectionStatus}`}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-mono"
            >
              <Radio
                className={`w-3 h-3 ${
                  connectionStatus === "connected"
                    ? "text-emerald-400 animate-pulse"
                    : connectionStatus === "connecting"
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              />
              <span className="text-[#8E95A5] uppercase text-[8px] font-bold">
                {connectionStatus === "connected" ? "LIVE" : connectionStatus === "connecting" ? "SYNC" : "OFF"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? "bg-red-600/10 text-white border border-red-500/30 shadow-sm text-red-400"
                      : "text-[#8E95A5] hover:text-white hover:bg-[#141722]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-[#5D6578]"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: System Status, Admin Account, Logout */}
        <div className="p-3 space-y-2.5 border-t border-[#222634] bg-[#0A0B10]">
          {/* Database Diagnostics Pill */}
          <div className="p-2.5 rounded-xl bg-[#12141D] border border-[#222634] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#71788A] uppercase font-bold">
                DB Engine
              </span>
              <span className="flex h-2 w-2 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isDbConnected ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isDbConnected ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className={isDbConnected ? "text-emerald-400" : "text-amber-400"}>
                {dbEngine}
              </span>
              <span className="text-[10px] text-[#555B6E]">
                {isDbConnected ? "ACTIVE" : "FALLBACK"}
              </span>
            </div>
          </div>

          {/* Admin Account Button */}
          <button
            type="button"
            onClick={() => setShowAccountModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#12141D] hover:bg-[#181B26] border border-[#222634] text-xs font-mono text-[#C4CBD8] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-red-400" />
              <span className="font-bold truncate">{adminId}</span>
            </div>
            <span className="text-[9px] text-[#636C80] uppercase">Account</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? "Ending Session..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* Admin Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#10131B] border border-[#282D3D] rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#222634] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white uppercase">Administrator Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-[#8E95A5] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-lg bg-[#0A0C12] border border-[#222634]">
                <span className="text-[#71788A]">Admin ID</span>
                <span className="text-white font-bold">{adminId}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#0A0C12] border border-[#222634]">
                <span className="text-[#71788A]">Role</span>
                <span className="text-red-400 font-bold">SUPER ADMINISTRATOR</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#0A0C12] border border-[#222634]">
                <span className="text-[#71788A]">Auth Type</span>
                <span className="text-[#C4CBD8]">HMAC-SHA256 Cookie Token</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#0A0C12] border border-[#222634]">
                <span className="text-[#71788A]">Session Invalidation</span>
                <span className="text-emerald-400">Server-Side Revocable</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#1C202C] hover:bg-[#252A3A] text-white text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
