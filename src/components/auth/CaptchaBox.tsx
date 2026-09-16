"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCw, ShieldAlert, CheckCircle2 } from "lucide-react";

interface CaptchaBoxProps {
  onChallengeChange: (token: string, answer: string) => void;
  error?: string | null;
  refreshTrigger?: number;
}

export function CaptchaBox({ onChallengeChange, error, refreshTrigger }: CaptchaBoxProps) {
  const [token, setToken] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [type, setType] = useState<"math" | "text">("math");
  const [answerInput, setAnswerInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCaptcha = useCallback(async () => {
    setIsLoading(true);
    setAnswerInput("");
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.challenge) {
        setToken(data.challenge.token);
        setQuestion(data.challenge.question);
        setType(data.challenge.type);
        onChallengeChange(data.challenge.token, "");
      }
    } catch (err) {
      console.error("Failed to load CAPTCHA:", err);
    } finally {
      setIsLoading(false);
    }
  }, [onChallengeChange]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha, refreshTrigger]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAnswerInput(val);
    onChallengeChange(token, val);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
          <span>Security Verification</span>
          <span className="text-[10px] text-red-400 font-mono">*</span>
        </label>
        <span className="text-[10px] text-[#636B7E]">
          {type === "math" ? "Solve arithmetic" : "Type characters"}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* CAPTCHA Visual Display */}
        <div className="h-10 px-3.5 rounded-lg bg-[#181B26] border border-[#2B3144] flex items-center justify-center font-mono font-black text-sm tracking-widest text-red-400 select-none shadow-inner min-w-[110px]">
          {isLoading ? (
            <RotateCw className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <span className="drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
              {question || "..."}
            </span>
          )}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={isLoading}
          className="h-10 px-3 rounded-lg bg-[#14161F] border border-[#232736] text-[#8E95A5] hover:text-white hover:border-[#383F55] transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
          title="Regenerate verification challenge"
          aria-label="Regenerate CAPTCHA"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        {/* Input field */}
        <input
          type="text"
          value={answerInput}
          onChange={handleInputChange}
          placeholder="Enter answer"
          autoComplete="off"
          className="h-10 flex-1 px-3 bg-[#11131A] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#555C70] font-mono focus:outline-none focus:border-red-500/80 transition-colors"
          required
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
