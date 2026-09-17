"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { GameConfig, getResolvedDemoUrl } from "@/config/games";
import { GameHeader } from "./GameHeader";
import { GameInfo } from "./GameInfo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useWallet } from "@/context/WalletContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import {
  ExternalLink,
  Settings,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCw,
  Maximize2,
  Minimize2,
  Heart,
  ArrowLeft,
  Lock
} from "lucide-react";

interface GameLaunchShellProps {
  game: GameConfig;
}

export function GameLaunchShell({ game }: GameLaunchShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const { balance, openWalletModal } = useWallet();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const favorited = isFavorite(game.id);

  // Check resolved demo URL on mount and whenever game changes
  useEffect(() => {
    const url = getResolvedDemoUrl(game.id);
    setResolvedUrl(url);
    setIsIframeLoading(true);
    setIframeError(false);
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

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(balance);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-[#050508] text-[#F5F5F7] ${
        isFullscreen ? "h-screen w-screen p-0 fixed inset-0 z-50" : "min-h-[calc(100vh-4rem)]"
      }`}
    >
      {/* 1. TOP HEADER: BETADRiX Official Logo & Lobby Backlink */}
      <GameHeader
        game={game}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        demoUrl={resolvedUrl}
      />

      {/* 2. SUB-HEADER: Game Title & Meta */}
      {!isFullscreen && (
        <div className="bg-[#0A0B10] border-b border-[#181926] px-4 py-3 sm:px-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                {game.name}
              </h1>
              <Badge variant="demo" size="sm">DEMO GAME</Badge>
              <span className="text-[11px] font-mono text-[#8E8E9E] bg-[#12131D] px-2 py-0.5 rounded border border-[#202130]">
                {game.provider}
              </span>
            </div>
            <p className="text-xs text-[#8E8E9E] mt-0.5">
              Zero real-money risk • Theoretical RTP {game.rtp} • Max Multiplier {game.maxMultiplier}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isUrlConfigured && (
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141522] hover:bg-[#1E1F30] border border-[#252638] text-neutral-300 hover:text-white font-bold transition-colors"
                title="Launch game in a new browser tab"
              >
                <span>Open in Separate Tab</span>
                <ExternalLink className="w-3.5 h-3.5 text-red-400" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN GAME VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Game Area */}
        <div className="flex-1 flex flex-col bg-[#07070B] relative min-h-[580px] lg:min-h-[700px]">
          {!isAuthLoading && !isAuthenticated ? (
            /* AUTHENTICATION GATE */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#09090F] space-y-4">
              <div className="relative mb-2">
                <Image
                  src="/assets/ui/betadrix_logo.png"
                  alt="BETADRiX"
                  width={140}
                  height={41}
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="space-y-2 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>SIGN IN REQUIRED</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  AUTHENTICATE TO PLAY DEMO
                </h3>
                <p className="text-xs text-[#8E8E9E] leading-relaxed">
                  Sign in or create a demonstration player profile to launch {game.name} ({game.provider}) and synchronize your virtual demo credits.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => openAuthModal("signin")}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="px-5 py-2.5 rounded-xl bg-[#181B26] hover:bg-[#202534] border border-[#2B3042] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Create Account
                </button>
              </div>

              <div className="pt-2 text-[10px] text-[#636B7E] font-mono">
                100% Free virtual simulation • Zero real-money gambling
              </div>
            </div>
          ) : isUrlConfigured && !iframeError ? (
            /* REAL GAME IFRAME VIEWPORT */
            <div className="relative w-full flex-1 flex flex-col bg-black">
              {/* Clean BETADRiX Loading Overlay */}
              {isIframeLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#07080D] space-y-3">
                  <div className="relative">
                    <Image
                      src="/assets/ui/betadrix_logo.png"
                      alt="BETADRiX"
                      width={150}
                      height={44}
                      className="h-8 w-auto object-contain"
                      priority
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white font-bold">
                    <RotateCw className="w-4 h-4 animate-spin text-red-500" />
                    <span>Loading {game.name}...</span>
                  </div>
                  <p className="text-xs text-[#8E8E9E]">
                    Please wait while the demo game loads.
                  </p>
                </div>
              )}

              <iframe
                src={resolvedUrl}
                title={`${game.name} Demo Game`}
                className="w-full flex-1 min-h-[560px] sm:min-h-[660px] lg:min-h-[720px] border-0 bg-black"
                allow="autoplay; fullscreen; clipboard-read; clipboard-write; camera; microphone"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                onLoad={() => setIsIframeLoading(false)}
                onError={() => {
                  setIsIframeLoading(false);
                  setIframeError(true);
                }}
              />
            </div>
          ) : isUrlConfigured && iframeError ? (
            /* IFRAME BLOCKED / CSP FALLBACK */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#09090F] space-y-4">
              <div className="relative mb-2">
                <Image
                  src="/assets/ui/betadrix_logo.png"
                  alt="BETADRiX"
                  width={140}
                  height={41}
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="space-y-1.5 max-w-md">
                <Badge variant="demo" size="md">DEMO GAME READY</Badge>
                <h3 className="text-2xl font-black text-white mt-1">
                  OPEN DEMO GAME
                </h3>
                <p className="text-xs text-[#8E8E9E] leading-relaxed">
                  Due to provider security and browser iframe policies (CSP / X-Frame-Options), this demo game launches directly in an authorized window.
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
                  onClick={() => {
                    setIframeError(false);
                    setIsIframeLoading(true);
                  }}
                  className="p-3 rounded-xl bg-[#141420] text-[#8E8E9E] hover:text-white border border-[#252535]"
                  title="Retry embedded frame"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* UNCONFIGURED STATE (e.g. Plinko) */
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center relative overflow-hidden bg-[#08080E]">
              <div className="relative z-10 max-w-md mx-auto space-y-5 bg-[#0D0E16] p-6 sm:p-8 rounded-2xl border border-[#222332] shadow-2xl">
                {/* BETADRiX Logo */}
                <div className="flex justify-center mb-1">
                  <Image
                    src="/assets/ui/betadrix_logo.png"
                    alt="BETADRiX"
                    width={130}
                    height={38}
                    className="h-7 w-auto object-contain"
                  />
                </div>

                {/* Game artwork banner */}
                <div className="relative w-48 aspect-[250/90] mx-auto rounded-xl overflow-hidden border border-[#2A2B3D] bg-black p-0.5">
                  <Image
                    src={game.image}
                    alt={game.name}
                    fill
                    className="object-contain object-center"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-wide">
                    {game.name}
                  </h3>
                  <span className="text-xs font-mono text-[#8E8E9E] block">
                    {game.provider} • RTP {game.rtp}
                  </span>
                </div>

                {/* Status Notice */}
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Demo URL is not configured yet.</span>
                  </div>
                  <p className="text-xs text-[#A0A0B2] leading-relaxed">
                    Awaiting authorized game launch endpoint. Return to the lobby to play available games or select another active title.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    size="md"
                    href="/games"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    Back to Games Lobby
                  </Button>
                </div>

                <div className="text-[10px] font-mono text-[#707085] pt-1">
                  Strict Spyke source integration • No guessed or invented URLs
                </div>
              </div>
            </div>
          )}

          {/* 4. DEMO CONTROLS BAR UNDER IFRAME */}
          <div className="bg-[#0A0B10] border-t border-[#181926] px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#12131D] border border-[#1E202E] rounded-lg">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Demo Balance:</span>
                <span className="text-sm font-mono font-black text-white">{formattedBalance}</span>
              </div>
              <button
                onClick={openWalletModal}
                className="text-[11px] font-bold text-red-400 hover:text-red-300 underline transition-colors"
              >
                Top-Up Demo Credits
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(game.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12131D] hover:bg-[#1A1C2A] border border-[#202232] text-neutral-300 hover:text-white transition-colors text-xs font-semibold"
              >
                <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-red-500 text-red-500" : "text-neutral-400"}`} />
                <span>{favorited ? "Favorited" : "Favorite"}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12131D] hover:bg-[#1A1C2A] border border-[#202232] text-neutral-300 hover:text-white transition-colors text-xs font-semibold"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-red-500" /> : <Maximize2 className="w-3.5 h-3.5 text-red-500" />}
                <span>Fullscreen</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. SIDE PANEL: Game Details & Stats */}
        {!isFullscreen && (
          <aside className="w-full lg:w-96 bg-[#08090E] border-t lg:border-t-0 lg:border-l border-[#1A1B28] p-5 sm:p-6 overflow-y-auto">
            <GameInfo game={game} />
          </aside>
        )}
      </div>
    </div>
  );
}
