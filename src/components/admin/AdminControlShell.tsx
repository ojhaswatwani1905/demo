"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { Shield, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface AdminControlShellProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminControlShell({
  title,
  subtitle,
  actions,
  children
}: AdminControlShellProps) {
  const router = useRouter();
  const { connectionStatus, lastEventTime } = useRealtime();

  const [adminId, setAdminId] = useState<string>("admin");
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [dbEngine, setDbEngine] = useState<string>("PostgreSQL");
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  useEffect(() => {
    // Verify admin session immediately
    fetch("/api/admin/auth/session")
      .then((res) => {
        if (!res.ok) {
          router.replace("/admin");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          setAdminId(data.adminId || "admin");
          setIsVerifying(false);
        } else {
          router.replace("/admin");
        }
      })
      .catch(() => {
        router.replace("/admin");
      });

    // Check system status
    fetch("/api/admin/stats")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.stats) {
          setDbEngine(data.stats.dbEngine || "PostgreSQL");
          setIsDbConnected(Boolean(data.stats.isDbConnected));
        }
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
          Connecting to Administration Center...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#08090C] text-[#EDEDF0] font-sans antialiased selection:bg-red-600 selection:text-white">
      {/* 1. Left Admin Sidebar */}
      <AdminSidebar
        adminId={adminId}
        isDbConnected={isDbConnected}
        dbEngine={dbEngine}
      />

      {/* 2. Main Admin Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Control Bar */}
        <header className="h-16 px-6 sm:px-8 border-b border-[#222634] bg-[#0E1017]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#71788A]">ADMIN CONTROL /</span>
              <h1 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                {title}
              </h1>
            </div>
            <p className="text-[11px] text-[#8E95A5] hidden sm:block truncate">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {actions}

            {/* Real-time Indicator Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12151F] border border-[#262B3B] text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="text-[#A2A9B9] font-medium">Realtime:</span>
              <span className="text-white font-bold uppercase">{connectionStatus}</span>
              {lastEventTime && (
                <span className="text-[9px] text-[#636C80] hidden lg:inline">
                  • {new Date(lastEventTime).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Toast Notification Alert */}
          {toast && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-2 shadow-lg ${
                toast.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : toast.type === "error"
                  ? "bg-red-950/40 border-red-500/40 text-red-200"
                  : "bg-blue-950/40 border-blue-500/40 text-blue-200"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="flex-1">{toast.message}</span>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
