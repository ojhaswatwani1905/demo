"use client";

import React from "react";
import { Shield, LogOut, Lock } from "lucide-react";

interface AdminHeaderProps {
  currentTabName: string;
  adminId: string;
  onLogout: () => void;
}

export function AdminHeader({ currentTabName, adminId, onLogout }: AdminHeaderProps) {
  return (
    <header className="h-16 px-6 sm:px-8 bg-[#101218] border-b border-[#252936] flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Administration Title & Active Tab */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          <span className="text-xs font-black text-white uppercase tracking-wider">
            BETADRiX ADMINISTRATION
          </span>
        </div>
        <span className="text-[#3F4555]">•</span>
        <span className="text-xs font-mono text-[#8E95A5] uppercase">
          {currentTabName}
        </span>
      </div>

      {/* Right side: Administrator Info & Logout Button */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#090A0E] border border-[#252936] text-[11px] font-mono text-[#8E95A5]">
          <Lock className="w-3 h-3 text-red-400" />
          <span>Active Session: <strong className="text-white capitalize">{adminId}</strong></span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181B26] hover:bg-red-950/40 text-[#8E95A5] hover:text-red-400 border border-[#2B3144] hover:border-red-500/40 transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
