"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/layout/Logo";
import { X, ShieldCheck, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, onAuthSuccess } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setErrorMessage(null);
    }
  }, [isAuthModalOpen, authModalMode]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid credentials. Please check your details.");
        setIsSubmitting(false);
        return;
      }

      onAuthSuccess(data.user);
    } catch (err) {
      console.error("Sign in error:", err);
      setErrorMessage("A network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name or username.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to create account. Please try again.");
        setIsSubmitting(false);
        return;
      }

      onAuthSuccess(data.user);
    } catch (err) {
      console.error("Sign up error:", err);
      setErrorMessage("A network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-[#101218] border border-[#232634] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E212D] flex items-center justify-between bg-[#141620]">
          <div className="flex items-center gap-2.5">
            <Logo compact />
            <div className="h-4 w-px bg-[#262A38]" />
            <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider">
              {mode === "signin" ? "MEMBER SIGN IN" : "CREATE ACCOUNT"}
            </span>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[#8E95A5] hover:text-white hover:bg-[#1E212D] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-[#0C0D12] border-b border-[#1E212D] text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-colors ${
              mode === "signin"
                ? "bg-[#1C1F2C] text-white shadow-sm border border-[#2B3042]"
                : "text-[#7A8296] hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-colors ${
              mode === "signup"
                ? "bg-[#1C1F2C] text-white shadow-sm border border-[#2B3042]"
                : "text-[#7A8296] hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              {mode === "signin" ? "Sign In to Continue" : "Create Demo Profile"}
            </h2>
            <p className="text-xs text-[#8E95A5]">
              {mode === "signin"
                ? "Authenticate your player session to access authorized demo games and claim rewards."
                : "Sign up instantly for virtual demonstration access. Zero real money involved."}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              {/* Email / Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A3AAB8] uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5A6072] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="player@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#4E5466] focus:outline-none focus:border-red-500/60"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A3AAB8] uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5A6072] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#4E5466] focus:outline-none focus:border-red-500/60"
                  />
                </div>
              </div>


              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] cursor-pointer"
              >
                <span>{isSubmitting ? "Authenticating..." : "Sign In & Continue"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A3AAB8] uppercase tracking-wider block">
                  Player Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5A6072] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="DemoPlayer1"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#4E5466] focus:outline-none focus:border-red-500/60"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A3AAB8] uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5A6072] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="player@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#4E5466] focus:outline-none focus:border-red-500/60"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A3AAB8] uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5A6072] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#4E5466] focus:outline-none focus:border-red-500/60"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A3AAB8] uppercase tracking-wider block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5A6072] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#4E5466] focus:outline-none focus:border-red-500/60"
                    />
                  </div>
                </div>
              </div>


              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] cursor-pointer"
              >
                <span>{isSubmitting ? "Creating Profile..." : "Create Account & Continue"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Bottom Notice */}
          <div className="pt-2 text-[10px] text-[#636B7D] text-center">
            Virtual demonstration account • Zero real money or financial risk
          </div>
        </div>
      </div>
    </div>
  );
}
