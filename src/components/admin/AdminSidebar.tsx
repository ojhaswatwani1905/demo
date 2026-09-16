"use client";

import React from "react";
import {
  LayoutDashboard,
  HelpCircle,
  Gift,
  Crown,
  Sparkles,
  Gamepad2,
  Activity,
  Users,
  Database,
  LogOut,
  ShieldCheck,
  Server
} from "lucide-react";

export type AdminTab =
  | "dashboard"
  | "support"
  | "games"
  | "promotions"
  | "vip"
  | "bonus"
  | "activity"
  | "users"
  | "general";

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  adminId: string;
  isDbConnected: boolean;
  dbEngine: string;
}

export function AdminSidebar({
  currentTab,
  onSelectTab,
  onLogout,
  adminId,
  isDbConnected,
  dbEngine
}: AdminSidebarProps) {
  const navItems: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "general", label: "General", icon: Database },
    { id: "support", label: "Support", icon: HelpCircle },
    { id: "promotions", label: "Promotions", icon: Gift },
    { id: "vip", label: "VIP", icon: Crown },
    { id: "bonus", label: "Bonus", icon: Sparkles },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "users", label: "Users", icon: Users },
  ];

  return (
    <aside className="w-60 bg-[#101218] border-r border-[#252936] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Top Header Branding */}
      <div>
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#252936]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-white">BETADRiX</span>
              <span className="text-[10px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-[#71788A] font-mono mt-0.5">Control Center</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#181B26] text-white border border-[#2D3344] shadow-sm text-red-400"
                    : "text-[#8E95A5] hover:text-white hover:bg-[#141620]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-[#656C7D]"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: System Status & User Profile */}
      <div className="p-3 space-y-3 border-t border-[#252936]">
        {/* System Status Card */}
        <div className="p-2.5 rounded-xl bg-[#090A0E] border border-[#252936] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#71788A] uppercase font-bold">
              System Status
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
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#A2A9B9]">{dbEngine}</span>
            <span className={isDbConnected ? "text-emerald-400" : "text-amber-400"}>
              {isDbConnected ? "Connected" : "Fallback"}
            </span>
          </div>
        </div>

        {/* Admin Identity & Logout */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#141620] border border-[#252936]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate capitalize">{adminId}</div>
              <div className="text-[10px] font-mono text-[#71788A] truncate">Administrator</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out of Administration"
            className="p-1.5 rounded-lg text-[#71788A] hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
