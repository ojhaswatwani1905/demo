"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, AlertCircle, ArrowRight, Server, CheckCircle2 } from "lucide-react";

interface AdminLoginProps {
  onSuccess?: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!adminId.trim() || !password.trim()) {
      setErrorMessage("Please enter both Admin ID and Password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: adminId.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/admin/dashboard");
          router.refresh();
        }
      } else {
        setErrorMessage(data.error || "Invalid administrator credentials.");
      }
    } catch (err) {
      console.error("Admin login network error:", err);
      setErrorMessage("Unable to connect to administration service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#08090C]">
      {/* Central Admin Box: Two-column on desktop, single-column on mobile */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-[#101218] border border-[#252936] shadow-2xl overflow-hidden">
        
        {/* LEFT COLUMN: Administrator Login Form (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
          <div className="space-y-6 sm:space-y-8">
            {/* Header Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/60 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
                <Shield className="w-3 h-3 text-red-500" />
                <span>Internal Security</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                BETADRiX ADMIN
              </h1>
              <p className="text-xs sm:text-sm text-[#8E95A5] mt-1 font-medium">
                Authorized administrator login and platform control.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Admin ID Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A2A9B9]">
                  Admin ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6173]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Enter administrator ID"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white placeholder-[#5A6173] text-sm focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A2A9B9]">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6173]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090A0E] border border-[#252936] text-white placeholder-[#5A6173] text-sm focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Notice */}
          <div className="pt-6 sm:pt-8 mt-6 border-t border-[#1C1F2A] flex items-center justify-between text-[11px] text-[#5A6173] font-mono">
            <span>Secure Administration</span>
            <span>v2.4.0 • Internal</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Professional Administration Security Visual (5 cols on lg) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-[#090A0E] border-l border-[#252936] flex-col justify-between p-8 overflow-hidden">
          {/* Background image: Clean administrative datacenter rack */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/ui/admin_security_panel.jpg"
              alt="Administration Environment"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover object-center brightness-[0.45]"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/60 to-transparent" />
          </div>

          {/* Overlay Content */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/70 border border-white/10 text-white text-[10px] font-mono">
              <Server className="w-3 h-3 text-red-500" />
              <span>CONTROL ENVIRONMENT</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              SECURE PLATFORM OPERATIONS
            </h3>
            <p className="text-xs text-[#9DA6B8] leading-relaxed">
              Restricted management console for system configuration, support channel endpoints, and live demonstration metrics.
            </p>
          </div>

          {/* Compliance Checklist */}
          <div className="relative z-10 space-y-2 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-[#C4CBD8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
              <span>PostgreSQL Connection Pooling</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C4CBD8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
              <span>HMAC-SHA256 Signed Sessions</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C4CBD8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
              <span>Role-Based API Enforcement</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
