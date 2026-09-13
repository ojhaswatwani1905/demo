"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { GameConfig, getResolvedDemoUrl } from "@/config/games";
import { GameHeader } from "./GameHeader";
import { GameInfo } from "./GameInfo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ExternalLink,
  Settings,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCw,
  Maximize2
} from "lucide-react";

interface GameLaunchShellProps {
  game: GameConfig;
}

export function GameLaunchShell({ game }: GameLaunchShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"game" | "info">("game");
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check resolved demo URL on mount and whenever game changes
  useEffect(() => {
    const url = getResolvedDemoUrl(game.id);
    setResolvedUrl(url);
    setIsLoading(false);
  }, [game.id]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn("Fullscreen request error", err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn("Exit fullscreen error", err);
      });
    }
  };

  const isUrlConfigured = Boolean(resolvedUrl && resolvedUrl.trim().length > 0);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-[#050508] ${
        isFullscreen ? "h-screen w-screen p-0" : "min-h-[calc(100vh-5rem)]"
      }`}
    >
      {/* Top Game Bar */}
      <GameHeader
        game={game}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Central Game Viewport Area */}
        <div className="flex-1 flex flex-col bg-[#07070B] relative min-h-[500px] lg:min-h-[640px]">
          {isUrlConfigured && !iframeError ? (
            /* Authorized Spribe URL Iframe Viewport */
            <div className="relative w-full h-full flex-1 flex flex-col">
              <iframe
                src={resolvedUrl}
                title={`${game.name} Spribe Demo`}
                className="w-full flex-1 border-0 min-h-[550px]"
                allow="autoplay; fullscreen; clipboard-read; clipboard-write"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                onError={() => setIframeError(true)}
              />

              {/* External Launch Assist Bar */}
              <div className="bg-[#0A0A10] border-t border-[#1C1C2A] px-4 py-2 flex items-center justify-between text-xs text-[#8E8E9E]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authorized Spribe Demo Session</span>
                </div>
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-red-400 hover:text-white font-bold transition-colors"
                >
                  <span>Open in Separate Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : isUrlConfigured && iframeError ? (
            /* Iframe Blocked / CSP Fallback State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#09090F] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(255,30,39,0.3)]">
                <ExternalLink className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <Badge variant="demo" size="md">SPRIBE DEMO READY</Badge>
                <h3 className="text-2xl font-black text-white mt-2">
                  OPEN DEMO GAME
                </h3>
                <p className="text-xs text-[#8E8E9E]">
                  Due to provider security and browser iframe embedding restrictions, this game launches directly in an authorized window.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  size="lg"
                  href={resolvedUrl}
                  isExternal
                  glow
                  icon={<Play className="w-4 h-4 fill-current" />}
                >
                  Open Demo Game
                </Button>
                <button
                  onClick={() => setIframeError(false)}
                  className="p-3 rounded-xl bg-[#141420] text-[#8E8E9E] hover:text-white border border-[#252535]"
                  title="Retry embedded frame"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Game Not Configured State — Graceful Polished Demonstration Shell */
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center relative overflow-hidden">
              {/* Reference UI Artwork Backdrop with High-Tech Dimming */}
              {game.uiPreview && (
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                  <Image
                    src={game.uiPreview}
                    alt={`${game.name} UI Reference`}
                    fill
                    className="object-cover object-center filter blur-[1px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070B] via-[#07070B]/85 to-[#07070B]" />
                </div>
              )}

              {/* Red ambient glow */}
              <div className="absolute w-96 h-96 bg-red-600/10 blur-[120px] pointer-events-none z-0" />

              <div className="relative z-10 max-w-lg mx-auto space-y-5 bg-[#0D0D15]/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#262638] shadow-2xl">
                {/* Game artwork badge */}
                <div className="relative w-48 aspect-[250/90] mx-auto rounded-xl overflow-hidden border border-red-500/50 shadow-[0_0_25px_rgba(255,30,39,0.3)] bg-black p-0.5">
                  <Image
                    src={game.image}
                    alt={game.name}
                    fill
                    className="object-contain object-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-black text-white uppercase tracking-wide">
                      {game.name}
                    </span>
                    <Badge variant="demo" size="sm">DEMO MODE</Badge>
                  </div>
                  <span className="text-xs font-mono text-[#8E8E9E] block">
                    Spribe Demo Title
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-left space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Demo URL is not configured yet</span>
                  </div>
                  <p className="text-xs text-[#A0A0B2] leading-relaxed">
                    Awaiting authorized game URL supplied through Spyke. Once supplied, configure in the Admin Panel or set the <code className="text-white font-mono">{game.demoUrlEnvKey}</code> environment variable.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    size="md"
                    href="/admin"
                    glow
                    icon={<Settings className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    Configure in Admin
                  </Button>

                  <Button
                    size="md"
                    variant="glass"
                    href="/casino"
                    className="w-full sm:w-auto"
                  >
                    Back to Games
                  </Button>
                </div>

                <div className="pt-2 text-[10px] font-mono text-[#707085]">
                  Strict Spyke source integration • No invented, guessed, or scraped URLs
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Game Details & Stats */}
        {!isFullscreen && (
          <aside className="w-full lg:w-96 bg-[#08080D] border-t lg:border-t-0 lg:border-l border-[#1C1C2A] p-5 sm:p-6 overflow-y-auto">
            <GameInfo game={game} />
          </aside>
        )}
      </div>
    </div>
  );
}
