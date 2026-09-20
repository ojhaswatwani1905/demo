"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { ShieldCheck, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
          confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to create account. Please check your inputs.");
        setIsSubmitting(false);
        return;
      }

      // Success: redirect to Games lobby
      router.push("/games");
    } catch (err) {
      console.error("Sign up submit error:", err);
      setErrorMessage("A network or server error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080C] text-[#EDEDF0] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Container card */}
      <div className="w-full max-w-4xl bg-[#101218] border border-[#222634] rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* LEFT SIDE: Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header / Logo */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/">
                <Logo />
              </Link>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181B26] border border-[#2B3042] text-[10px] font-mono text-red-400 font-bold">
                <ShieldCheck className="w-3 h-3 text-red-500" />
                <span>DEMO REGISTRATION</span>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Create Demo Account
              </h1>
              <p className="text-xs text-[#8E95A5]">
                Register your simulated player profile with instant $1,250.00 virtual playground balance.
              </p>
            </div>

            {/* Error message alert */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5E667A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                    className="w-full pl-9 pr-3.5 py-2 bg-[#14161F] border border-[#252A3A] rounded-lg text-xs text-white placeholder-[#50576C] focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5E667A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2 bg-[#14161F] border border-[#252A3A] rounded-lg text-xs text-white placeholder-[#50576C] focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5E667A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3.5 py-2 bg-[#14161F] border border-[#252A3A] rounded-lg text-xs text-white placeholder-[#50576C] focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5E667A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3.5 py-2 bg-[#14161F] border border-[#252A3A] rounded-lg text-xs text-white placeholder-[#50576C] focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
              </div>


              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? "Creating Account..." : "Complete Registration"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="pt-6 border-t border-[#1C202B] text-center mt-6">
            <p className="text-xs text-[#8E95A5]">
              Already have a demo account?{" "}
              <Link href="/sign-in" className="text-red-400 font-semibold hover:text-red-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Promotional Visual */}
        <div className="lg:col-span-5 relative bg-[#0B0C12] border-t lg:border-t-0 lg:border-l border-[#222634] flex flex-col justify-end overflow-hidden min-h-[320px] lg:min-h-full">
          <Image
            src="/assets/ui/casino_auth_promo.jpg"
            alt="BETADRiX Gaming Atmosphere"
            fill
            className="object-cover object-center brightness-90"
            sizes="(max-width: 1024px) 100vw, 420px"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C12] via-[#0B0C12]/40 to-transparent pointer-events-none" />

          {/* Bottom Branding */}
          <div className="relative z-10 p-6 sm:p-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>OFFICIAL CASINO SIMULATION</span>
            </div>
            <div className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
              BETADRiX DEMO
            </div>
            <p className="text-[11px] text-[#A0A8BC] leading-relaxed">
              Experience certified Turbo Games & Spribe demonstration titles with zero financial risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
