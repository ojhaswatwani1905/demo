"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { GameConfig } from "@/config/games";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, AlertCircle, Link2, Check, Trash2 } from "lucide-react";

interface DemoUrlModalProps {
  game: GameConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function DemoUrlModal({ game, isOpen, onClose, onSaved }: DemoUrlModalProps) {
  const [url, setUrl] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (game) {
      const stored =
        localStorage.getItem(`spyke_url_${game.id}`) ||
        localStorage.getItem(`spribe_demo_url_${game.id}`) ||
        game.defaultDemoUrl ||
        "";
      setUrl(stored);
      setSaveSuccess(false);
      setErrorMsg("");
    }
  }, [game]);

  if (!game) return null;

  const handleSave = () => {
    const trimmed = url.trim();
    if (trimmed.length > 0 && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setErrorMsg("Please enter a valid URL starting with https://");
      return;
    }

    if (trimmed === "") {
      localStorage.removeItem(`spyke_url_${game.id}`);
      localStorage.removeItem(`spribe_demo_url_${game.id}`);
    } else {
      localStorage.setItem(`spyke_url_${game.id}`, trimmed);
      localStorage.setItem(`spribe_demo_url_${game.id}`, trimmed);
    }

    setSaveSuccess(true);
    onSaved();
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    localStorage.removeItem(`spyke_url_${game.id}`);
    localStorage.removeItem(`spribe_demo_url_${game.id}`);
    setUrl("");
    setSaveSuccess(true);
    onSaved();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`CONFIGURE SPYKE URL — ${game.name.toUpperCase()}`}
      subtitle={`Enter the authorized game URL supplied by Spyke for ${game.name}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-[#A0A0B0] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-red-400 block mb-0.5 uppercase">
              URLs Supplied Through Spyke Only
            </span>
            Supply the official URL provided by Spyke. Do not invent, guess, scrape, or substitute third-party URLs.
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#B0B0C0] mb-1.5">
            Spyke Game URL
          </label>
          <div className="relative">
            <Link2 className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                setErrorMsg("");
              }}
              placeholder="https://..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#14141F] border border-[#262638] rounded-xl text-xs text-white placeholder-[#606075] focus:outline-none focus:border-red-500 font-mono"
            />
          </div>
          {errorMsg && (
            <p className="text-[11px] text-red-400 mt-1">{errorMsg}</p>
          )}
          <p className="text-[10px] text-[#707085] mt-1.5">
            Environment variable source: <code className="text-red-400/90">{game.demoUrlEnvKey}</code>
          </p>
        </div>

        {saveSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>Spyke URL Configuration Saved Successfully</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-3">
          {url && (
            <button
              onClick={handleClear}
              className="py-2.5 px-3.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-bold text-red-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              glow
            >
              Save Spyke URL
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
