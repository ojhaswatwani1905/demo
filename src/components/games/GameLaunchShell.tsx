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
import { useRealtime } from "@/context/RealtimeContext";
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

// Canonical Plinko Origin
const CANONICAL_PLINKO_ORIGIN = "https://plinko-1-b1u5.onrender.com";

function getPlinkoTargetOrigin(url?: string): string {
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.origin === CANONICAL_PLINKO_ORIGIN) return CANONICAL_PLINKO_ORIGIN;
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return parsed.origin;
      }
    } catch {
      // fallback
    }
  }
  return CANONICAL_PLINKO_ORIGIN;
}

function isTrustedPlinkoOrigin(origin: string, url?: string): boolean {
  if (origin === CANONICAL_PLINKO_ORIGIN) return true;
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.origin === origin) {
        if (origin === CANONICAL_PLINKO_ORIGIN) return true;
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
          return true;
        }
      }
    } catch {
      // ignore
    }
  }
  try {
    const originUrl = new URL(origin);
    if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

// Canonical Roulette Origin
const CANONICAL_ROULETTE_ORIGIN = "https://roulette-8k8u.onrender.com";

function getRouletteTargetOrigin(url?: string): string {
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.origin === CANONICAL_ROULETTE_ORIGIN) return CANONICAL_ROULETTE_ORIGIN;
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return parsed.origin;
      }
    } catch {
      // fallback
    }
  }
  return CANONICAL_ROULETTE_ORIGIN;
}

function isTrustedRouletteOrigin(origin: string, url?: string): boolean {
  if (origin === CANONICAL_ROULETTE_ORIGIN) return true;
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.origin === origin) {
        if (origin === CANONICAL_ROULETTE_ORIGIN) return true;
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
          return true;
        }
      }
    } catch {
      // ignore
    }
  }
  try {
    const originUrl = new URL(origin);
    if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

// Canonical Trader Origin
const CANONICAL_TRADER_ORIGIN = "https://trader-ygps.onrender.com";

function getTraderTargetOrigin(url?: string): string {
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.origin === CANONICAL_TRADER_ORIGIN) return CANONICAL_TRADER_ORIGIN;
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return parsed.origin;
      }
    } catch {
      // fallback
    }
  }
  return CANONICAL_TRADER_ORIGIN;
}

function isTrustedTraderOrigin(origin: string, url?: string): boolean {
  if (origin === CANONICAL_TRADER_ORIGIN) return true;
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.origin === origin) {
        if (origin === CANONICAL_TRADER_ORIGIN) return true;
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
          return true;
        }
      }
    } catch {
      // ignore
    }
  }
  try {
    const originUrl = new URL(origin);
    if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export type PlinkoTransactionStatus = "PENDING" | "ACCEPTED" | "RESULT_RECEIVED" | "SETTLED" | "REJECTED";

export interface PlinkoTransaction {
  requestId: string;
  betAmount: number;
  status: PlinkoTransactionStatus;
  timestamp: number;
  game: "plinko" | "roulette" | "trader";
  roundId?: string;
  slotId?: string;
  outcome?: string;
  multiplier?: number;
  winningNumber?: number;
  payout?: number;
  acceptedAt?: number;
  settledAt?: number;
}

interface GameLaunchShellProps {
  game: GameConfig;
}

function reportGameplayActivity(data: {
  game: string;
  bet_amount: number;
  payout_amount: number;
  multiplier: number;
  balance?: number;
}) {
  try {
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Demo Player",
        game: data.game,
        bet_amount: data.bet_amount,
        payout_amount: data.payout_amount,
        multiplier: data.multiplier,
        user_id: 1,
        balance: data.balance
      })
    }).catch(() => {});
  } catch {
    // Non-blocking background sync
  }
}

export function GameLaunchShell({ game }: GameLaunchShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>(game);
  const [resolvedUrl, setResolvedUrl] = useState<string>(
    game.defaultDemoUrl && game.defaultDemoUrl.trim() !== ""
      ? game.defaultDemoUrl.trim()
      : getResolvedDemoUrl(game.id)
  );
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const { balance, openWalletModal, deductBalance, creditBalance } = useWallet();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const { subscribe } = useRealtime();
  const favorited = isFavorite(gameConfig.id);

  const isGameActive = gameConfig.isActive !== false && gameConfig.isEnabled !== false;
  const latestBalanceRef = useRef(balance);
  const isGameActiveRef = useRef(isGameActive);

  useEffect(() => {
    latestBalanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    isGameActiveRef.current = isGameActive;
  }, [isGameActive]);

  // DUPLICATE PROTECTION: Explicit transaction state tracking map (requestId -> PlinkoTransaction)
  const transactionsRef = useRef<Map<string, PlinkoTransaction>>(new Map());

  // PostMessage helper to send messages strictly to trusted Plinko origin (Never "*")
  const sendToPlinko = React.useCallback((message: any) => {
    if (!iframeRef.current?.contentWindow) return;
    const targetOrigin = getPlinkoTargetOrigin(resolvedUrl);
    iframeRef.current.contentWindow.postMessage(message, targetOrigin);
  }, [resolvedUrl]);

  // BETADRiX_PLINKO_INIT dispatcher
  const sendPlinkoInit = React.useCallback(() => {
    if (gameConfig.id.toLowerCase() !== "plinko") return;
    sendToPlinko({
      type: "BETADRiX_PLINKO_INIT",
      balance: latestBalanceRef.current,
      currency: "USD",
    });
  }, [gameConfig.id, sendToPlinko]);

  // PostMessage helper to send messages strictly to trusted Roulette origin (Never "*")
  const sendToRoulette = React.useCallback((message: any) => {
    if (!iframeRef.current?.contentWindow) return;
    const targetOrigin = getRouletteTargetOrigin(resolvedUrl);
    iframeRef.current.contentWindow.postMessage(message, targetOrigin);
  }, [resolvedUrl]);

  // BETADRiX_ROULETTE_INIT dispatcher
  const sendRouletteInit = React.useCallback(() => {
    if (gameConfig.id.toLowerCase() !== "roulette") return;
    sendToRoulette({
      type: "BETADRiX_ROULETTE_INIT",
      balance: latestBalanceRef.current,
      currency: "USD",
    });
  }, [gameConfig.id, sendToRoulette]);

  // PostMessage helper to send messages strictly to trusted Trader origin (Never "*")
  const sendToTrader = React.useCallback((message: any) => {
    if (!iframeRef.current?.contentWindow) return;
    const targetOrigin = getTraderTargetOrigin(resolvedUrl);
    iframeRef.current.contentWindow.postMessage(message, targetOrigin);
  }, [resolvedUrl]);

  // BETADRiX_TRADER_INIT dispatcher
  const sendTraderInit = React.useCallback(() => {
    if (gameConfig.id.toLowerCase() !== "trader") return;
    sendToTrader({
      type: "BETADRiX_TRADER_INIT",
      balance: latestBalanceRef.current,
      currency: "USD",
    });
  }, [gameConfig.id, sendToTrader]);

  // Helper to mark iframe game as fully ready and remove loading overlay
  const markGameReady = React.useCallback(() => {
    setIsIframeLoading(false);
    setIframeError(false);
  }, []);

  // Sync state if game prop changes (only reset loading if URL actually changes)
  useEffect(() => {
    setGameConfig(game);
    const url = (game.defaultDemoUrl && game.defaultDemoUrl.trim() !== "")
      ? game.defaultDemoUrl.trim()
      : getResolvedDemoUrl(game.id);

    setResolvedUrl(prev => {
      if (prev !== url) {
        setIsIframeLoading(true);
        setIframeError(false);
        return url;
      }
      return prev;
    });
  }, [game]);

  // Balance Synchronization: Whenever BETADRiX WalletContext balance changes while Plinko, Roulette or Trader is open, send BETADRiX_BALANCE_UPDATE
  const isInitialMount = useRef(true);
  useEffect(() => {
    const gid = gameConfig.id.toLowerCase();
    if (gid !== "plinko" && gid !== "roulette" && gid !== "trader") return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (gid === "plinko") {
      sendToPlinko({
        type: "BETADRiX_BALANCE_UPDATE",
        balance: balance,
      });
    } else if (gid === "roulette") {
      sendToRoulette({
        type: "BETADRiX_BALANCE_UPDATE",
        balance: balance,
      });
    } else if (gid === "trader") {
      sendToTrader({
        type: "BETADRiX_BALANCE_UPDATE",
        balance: balance,
      });
    }
  }, [balance, gameConfig.id, sendToPlinko, sendToRoulette, sendToTrader]);

  // Real-time synchronization when Admin updates game config
  useEffect(() => {
    const unsub = subscribe("GAME_CONFIG_UPDATED", (payload: any) => {
      if (payload && (payload.game_id?.toLowerCase() === game.id.toLowerCase() || payload.id === game.id)) {
        if (payload.launch_url !== undefined) {
          const newUrl = payload.launch_url.trim();
          setResolvedUrl(prev => {
            if (prev !== newUrl) {
              setIsIframeLoading(true);
              setIframeError(false);
              return newUrl;
            }
            return prev;
          });
        }
        setGameConfig(prev => ({
          ...prev,
          name: payload.name || prev.name,
          provider: (game.id.toLowerCase() === "plinko" || game.id.toLowerCase() === "roulette" || game.id.toLowerCase() === "trader")
            ? "BETADRiX"
            : (payload.provider || prev.provider),
          defaultDemoUrl: payload.launch_url !== undefined ? payload.launch_url.trim() : prev.defaultDemoUrl,
          isActive: payload.is_active !== undefined ? payload.is_active : (payload.is_enabled !== undefined ? payload.is_enabled : prev.isActive),
          isEnabled: payload.is_enabled !== undefined ? payload.is_enabled : (payload.is_active !== undefined ? payload.is_active : prev.isEnabled),
          maintenanceMessage: payload.maintenance_message !== undefined ? payload.maintenance_message : prev.maintenanceMessage,
        }));
      }
    });
    return unsub;
  }, [subscribe, game.id]);

  // Safety fallback timeout (8-10s): If iframe onLoad and PLINKO_READY do not fire, show fallback UI
  useEffect(() => {
    if (!resolvedUrl || resolvedUrl.trim() === "") return;

    const timeoutTimer = setTimeout(() => {
      setIsIframeLoading(currentLoading => {
        if (currentLoading) {
          console.warn(`[GameLaunchShell] Game loading timed out after 9s for ${gameConfig.name}. Showing fallback.`);
          setIframeError(true);
          return false;
        }
        return currentLoading;
      });
    }, 9000);

    return () => clearTimeout(timeoutTimer);
  }, [resolvedUrl, gameConfig.name]);

  // Native DOM load event listener and immediate readiness verification
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleNativeLoad = () => {
      markGameReady();
      if (gameConfig.id.toLowerCase() === "plinko") {
        sendPlinkoInit();
      } else if (gameConfig.id.toLowerCase() === "roulette") {
        sendRouletteInit();
      } else if (gameConfig.id.toLowerCase() === "trader") {
        sendTraderInit();
      }
    };

    iframe.addEventListener("load", handleNativeLoad);

    // If iframe already loaded before effect runs (cached document)
    try {
      if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
        markGameReady();
        if (gameConfig.id.toLowerCase() === "plinko") {
          sendPlinkoInit();
        } else if (gameConfig.id.toLowerCase() === "roulette") {
          sendRouletteInit();
        } else if (gameConfig.id.toLowerCase() === "trader") {
          sendTraderInit();
        }
      }
    } catch {
      // Cross-origin access restriction is expected
    }

    return () => {
      iframe.removeEventListener("load", handleNativeLoad);
    };
  }, [resolvedUrl, markGameReady, sendPlinkoInit, sendRouletteInit, sendTraderInit]);

  // PostMessage listener supporting PLINKO, ROULETTE, and TRADER events
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      const gid = gameConfig.id.toLowerCase();
      // 1. Origin validation: strictly check against trusted origin for active game. Never trust "*"
      if (gid === "plinko") {
        if (!isTrustedPlinkoOrigin(event.origin, resolvedUrl)) return;
      } else if (gid === "roulette") {
        if (!isTrustedRouletteOrigin(event.origin, resolvedUrl)) return;
      } else if (gid === "trader") {
        if (!isTrustedTraderOrigin(event.origin, resolvedUrl)) return;
      } else {
        return;
      }

      // 2. Source validation: ensure message comes from the embedded Plinko iframe window where applicable
      if (iframeRef.current?.contentWindow && event.source !== iframeRef.current.contentWindow) return;

      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "PLINKO_READY") {
        markGameReady();
        sendPlinkoInit();
      } else if (data.type === "PLINKO_BET_REQUEST") {
        const requestId = typeof data.requestId === "string" ? data.requestId : data.payload?.requestId;
        const amount = typeof data.amount === "number" ? data.amount : data.payload?.amount;

        // 1. Validate requestId exists and is non-empty
        if (!requestId || typeof requestId !== "string" || requestId.trim() === "") {
          console.warn("[BETADRiX Plinko] Bet request rejected: missing or invalid requestId");
          return;
        }

        // 2. DUPLICATE PROTECTION: Check if requestId has already been received
        if (transactionsRef.current.has(requestId)) {
          console.warn(`[BETADRiX Plinko] Duplicate bet request detected for ${requestId}. Ignored.`);
          return;
        }

        // 3. Register transaction as PENDING
        transactionsRef.current.set(requestId, {
          requestId,
          betAmount: typeof amount === "number" ? amount : 0,
          status: "PENDING",
          timestamp: Date.now(),
          game: "plinko",
        });
        const tx = transactionsRef.current.get(requestId)!;

        // 4. Validate game is active
        if (!isGameActiveRef.current) {
          tx.status = "REJECTED";
          sendToPlinko({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            reason: "GAME_NOT_ACTIVE",
          });
          return;
        }

        // 5. Validate amount is finite and > 0
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
          tx.status = "REJECTED";
          sendToPlinko({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            reason: "INVALID_AMOUNT",
          });
          return;
        }

        // 6. Validate amount <= user's current demo balance
        const currentBal = latestBalanceRef.current;
        if (amount > currentBal) {
          tx.status = "REJECTED";
          sendToPlinko({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            reason: "INSUFFICIENT_BALANCE",
          });
          return;
        }

        // 7. Deduct bet from authoritative BETADRiX balance
        const newBal = deductBalance(amount);
        if (newBal === null) {
          tx.status = "REJECTED";
          sendToPlinko({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            reason: "INSUFFICIENT_BALANCE",
          });
          return;
        }

        // 8. Acceptance: record transaction as ACCEPTED
        tx.status = "ACCEPTED";
        tx.betAmount = amount;
        tx.acceptedAt = Date.now();

        sendToPlinko({
          type: "BETADRiX_BET_ACCEPTED",
          requestId,
          amount,
          balance: newBal,
        });
      } else if (data.type === "PLINKO_RESULT") {
        const requestId = typeof data.requestId === "string" ? data.requestId : data.payload?.requestId;
        const multiplier = typeof data.multiplier === "number" ? data.multiplier : data.payload?.multiplier;

        if (!requestId || typeof requestId !== "string" || requestId.trim() === "") {
          console.warn("[BETADRiX Plinko] Result rejected: missing requestId");
          return;
        }

        // Validate known requestId
        const tx = transactionsRef.current.get(requestId);
        if (!tx) {
          console.warn(`[BETADRiX Plinko] Result rejected: unknown requestId ${requestId}`);
          return;
        }

        // DUPLICATE PROTECTION: ensure request has not already been settled
        if (tx.status === "SETTLED") {
          console.warn(`[BETADRiX Plinko] Duplicate result event ignored for already settled requestId ${requestId}`);
          return;
        }

        if (tx.status !== "ACCEPTED") {
          console.warn(`[BETADRiX Plinko] Result rejected for requestId ${requestId} with status ${tx.status}`);
          return;
        }

        // Transition to RESULT_RECEIVED
        tx.status = "RESULT_RECEIVED";

        // Validate multiplier is numeric, finite, and non-negative
        if (typeof multiplier !== "number" || !Number.isFinite(multiplier) || multiplier < 0) {
          console.warn(`[BETADRiX Plinko] Invalid multiplier ${multiplier} received for requestId ${requestId}`);
          return;
        }

        // Calculate payout: payout = betAmount * multiplier using demo wallet precision (.toFixed(2))
        const multiplierNum = Number(multiplier);
        const payout = Number((tx.betAmount * multiplierNum).toFixed(2));

        // Mark transaction as SETTLED before/with crediting to guarantee single settlement
        tx.status = "SETTLED";
        tx.settledAt = Date.now();
        tx.multiplier = multiplierNum;
        tx.payout = payout;

        // Credit payout to the same authoritative BETADRiX wallet
        const newBal = creditBalance(payout);

        reportGameplayActivity({
          game: "Plinko",
          bet_amount: tx.betAmount,
          payout_amount: payout,
          multiplier: multiplierNum,
          balance: newBal
        });

        sendToPlinko({
          type: "BETADRiX_RESULT_SETTLED",
          requestId,
          betAmount: tx.betAmount,
          multiplier: multiplierNum,
          payout,
          balance: newBal,
        });
      }
      else if (data.type === "ROULETTE_READY") {
        markGameReady();
        sendRouletteInit();
      } else if (data.type === "ROULETTE_BET_REQUEST") {
        const requestId = typeof data.requestId === "string" ? data.requestId : data.payload?.requestId;
        const amount = typeof data.amount === "number" ? data.amount : data.payload?.amount;

        // 1. Validate requestId exists and is non-empty
        if (!requestId || typeof requestId !== "string" || requestId.trim() === "") {
          console.warn("[BETADRiX Roulette] Bet request rejected: missing or invalid requestId");
          return;
        }

        // 2. DUPLICATE PROTECTION: Check if requestId has already been received
        if (transactionsRef.current.has(requestId)) {
          console.warn(`[BETADRiX Roulette] Duplicate bet request detected for ${requestId}. Ignored.`);
          return;
        }

        // 3. Register transaction as PENDING
        transactionsRef.current.set(requestId, {
          requestId,
          betAmount: typeof amount === "number" ? amount : 0,
          status: "PENDING",
          timestamp: Date.now(),
          game: "roulette",
        });
        const tx = transactionsRef.current.get(requestId)!;

        // 4. Validate game is active
        if (!isGameActiveRef.current) {
          tx.status = "REJECTED";
          sendToRoulette({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            reason: "GAME_NOT_ACTIVE",
          });
          return;
        }

        // 5. Validate amount is finite and > 0
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
          tx.status = "REJECTED";
          sendToRoulette({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            reason: "INVALID_AMOUNT",
          });
          return;
        }

        // 6. Validate amount <= user's current demo balance
        const currentBal = latestBalanceRef.current;
        if (amount > currentBal) {
          tx.status = "REJECTED";
          sendToRoulette({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            reason: "INSUFFICIENT_BALANCE",
          });
          return;
        }

        // 7. Deduct bet from authoritative BETADRiX balance
        const newBal = deductBalance(amount);
        if (newBal === null) {
          tx.status = "REJECTED";
          sendToRoulette({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            reason: "INSUFFICIENT_BALANCE",
          });
          return;
        }

        // 8. Acceptance: record transaction as ACCEPTED
        tx.status = "ACCEPTED";
        tx.betAmount = amount;
        tx.acceptedAt = Date.now();

        sendToRoulette({
          type: "BETADRiX_BET_ACCEPTED",
          requestId,
          amount,
          balance: newBal,
        });
      } else if (data.type === "ROULETTE_RESULT") {
        const requestId = typeof data.requestId === "string" ? data.requestId : data.payload?.requestId;
        const payout = typeof data.payout === "number" ? data.payout : data.payload?.payout;
        const winningNumber = typeof data.winningNumber === "number" ? data.winningNumber : data.payload?.winningNumber;

        if (!requestId || typeof requestId !== "string" || requestId.trim() === "") {
          console.warn("[BETADRiX Roulette] Result rejected: missing requestId");
          return;
        }

        const tx = transactionsRef.current.get(requestId);
        if (!tx) {
          console.warn(`[BETADRiX Roulette] Result rejected: unknown requestId ${requestId}`);
          return;
        }

        // DUPLICATE PROTECTION: ensure request has not already been settled
        if (tx.status === "SETTLED") {
          console.warn(`[BETADRiX Roulette] Duplicate result event ignored for already settled requestId ${requestId}`);
          return;
        }

        if (tx.status !== "ACCEPTED") {
          console.warn(`[BETADRiX Roulette] Result rejected for requestId ${requestId} with status ${tx.status}`);
          return;
        }

        tx.status = "RESULT_RECEIVED";

        if (typeof payout !== "number" || !Number.isFinite(payout) || payout < 0) {
          console.warn(`[BETADRiX Roulette] Invalid payout ${payout} received for requestId ${requestId}`);
          return;
        }

        if (winningNumber !== undefined) {
          if (typeof winningNumber !== "number" || !Number.isInteger(winningNumber) || winningNumber < 0 || winningNumber > 36) {
            console.warn(`[BETADRiX Roulette] Invalid winningNumber ${winningNumber} received for requestId ${requestId}`);
            return;
          }
        }

        const payoutNum = Number(payout.toFixed(2));
        tx.status = "SETTLED";
        tx.settledAt = Date.now();
        tx.payout = payoutNum;
        if (winningNumber !== undefined) {
          tx.winningNumber = winningNumber;
        }

        const newBal = creditBalance(payoutNum);

        reportGameplayActivity({
          game: "Roulette",
          bet_amount: tx.betAmount,
          payout_amount: payoutNum,
          multiplier: tx.betAmount > 0 ? Number((payoutNum / tx.betAmount).toFixed(2)) : 0,
          balance: newBal
        });

        sendToRoulette({
          type: "BETADRiX_RESULT_SETTLED",
          requestId,
          betAmount: tx.betAmount,
          payout: payoutNum,
          balance: newBal,
        });
      } else if (data.type === "TRADER_READY") {
        markGameReady();
        sendTraderInit();
      } else if (data.type === "TRADER_BET_REQUEST") {
        const gameId = typeof data.gameId === "string" ? data.gameId : data.payload?.gameId;
        const requestId = typeof data.requestId === "string" ? data.requestId : data.payload?.requestId;
        const roundId = data.roundId !== undefined ? String(data.roundId) : (data.payload?.roundId !== undefined ? String(data.payload.roundId) : undefined);
        const slotId = typeof data.slotId === "string" ? data.slotId : data.payload?.slotId;
        const amount = typeof data.amount === "number" ? data.amount : data.payload?.amount;

        // 1. Validate gameId === "trader"
        if (!gameId || gameId.toLowerCase() !== "trader") {
          console.warn("[BETADRiX Trader] Bet request rejected: invalid or mismatching gameId", gameId);
          return;
        }

        // 2. Validate requestId exists and is non-empty
        if (!requestId || typeof requestId !== "string" || requestId.trim() === "") {
          console.warn("[BETADRiX Trader] Bet request rejected: missing or invalid requestId");
          return;
        }

        // 3. Validate roundId and slotId
        if (!roundId || roundId.trim() === "" || !slotId || typeof slotId !== "string" || slotId.trim() === "") {
          console.warn("[BETADRiX Trader] Bet request rejected: missing roundId or slotId");
          sendToTrader({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            roundId,
            slotId,
            reason: "INVALID_ROUND_OR_SLOT",
          });
          return;
        }

        // 4. DUPLICATE PROTECTION: Check if requestId has already been received
        if (transactionsRef.current.has(requestId)) {
          console.warn(`[BETADRiX Trader] Duplicate bet request detected for ${requestId}. Ignored.`);
          return;
        }

        // 5. Check if an active unsettled wager already exists for this exact roundId and slotId
        for (const existingTx of transactionsRef.current.values()) {
          if (
            existingTx.game === "trader" &&
            existingTx.roundId === roundId &&
            existingTx.slotId === slotId &&
            existingTx.status === "ACCEPTED"
          ) {
            console.warn(`[BETADRiX Trader] Bet request rejected: active wager already exists for round ${roundId} slot ${slotId}`);
            sendToTrader({
              type: "BETADRiX_BET_REJECTED",
              requestId,
              roundId,
              slotId,
              reason: "SLOT_ALREADY_ACTIVE",
            });
            return;
          }
        }

        // 6. Register transaction as PENDING
        transactionsRef.current.set(requestId, {
          requestId,
          roundId,
          slotId,
          betAmount: typeof amount === "number" ? amount : 0,
          status: "PENDING",
          timestamp: Date.now(),
          game: "trader",
        });
        const tx = transactionsRef.current.get(requestId)!;

        // 7. Validate game is active
        if (!isGameActiveRef.current) {
          tx.status = "REJECTED";
          sendToTrader({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            roundId,
            slotId,
            reason: "GAME_NOT_ACTIVE",
          });
          return;
        }

        // 8. Validate amount is finite and > 0
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
          tx.status = "REJECTED";
          sendToTrader({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            roundId,
            slotId,
            reason: "INVALID_AMOUNT",
          });
          return;
        }

        // 9. Validate amount <= user's current demo balance
        const currentBal = latestBalanceRef.current;
        if (amount > currentBal) {
          tx.status = "REJECTED";
          sendToTrader({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            roundId,
            slotId,
            reason: "INSUFFICIENT_BALANCE",
          });
          return;
        }

        // 10. Deduct bet from authoritative BETADRiX balance
        const newBal = deductBalance(amount);
        if (newBal === null) {
          tx.status = "REJECTED";
          sendToTrader({
            type: "BETADRiX_BET_REJECTED",
            requestId,
            roundId,
            slotId,
            reason: "INSUFFICIENT_BALANCE",
          });
          return;
        }

        // 11. Acceptance: record transaction as ACCEPTED
        tx.status = "ACCEPTED";
        tx.betAmount = amount;
        tx.acceptedAt = Date.now();

        sendToTrader({
          type: "BETADRiX_BET_ACCEPTED",
          requestId,
          roundId,
          slotId,
          amount,
          balance: newBal,
        });
      } else if (data.type === "TRADER_RESULT") {
        const gameId = typeof data.gameId === "string" ? data.gameId : data.payload?.gameId;
        const requestId = typeof data.requestId === "string" ? data.requestId : data.payload?.requestId;
        const roundId = data.roundId !== undefined ? String(data.roundId) : (data.payload?.roundId !== undefined ? String(data.payload.roundId) : undefined);
        const slotId = typeof data.slotId === "string" ? data.slotId : data.payload?.slotId;
        const outcome = typeof data.outcome === "string" ? data.outcome : data.payload?.outcome;
        const multiplier = typeof data.multiplier === "number" ? data.multiplier : data.payload?.multiplier;

        // 1. Validate gameId
        if (gameId && gameId.toLowerCase() !== "trader") {
          console.warn(`[BETADRiX Trader] Result rejected: invalid gameId ${gameId}`);
          return;
        }

        // 2. Validate requestId exists
        if (!requestId || typeof requestId !== "string" || requestId.trim() === "") {
          console.warn("[BETADRiX Trader] Result rejected: missing requestId");
          return;
        }

        // 3. Find authoritative stored wager
        const tx = transactionsRef.current.get(requestId);
        if (!tx) {
          console.warn(`[BETADRiX Trader] Result rejected: unknown requestId ${requestId}`);
          return;
        }

        if (tx.game !== "trader") {
          console.warn(`[BETADRiX Trader] Result rejected: game mismatch for ${requestId}`);
          return;
        }

        // 4. Round and Slot Isolation: Validate roundId and slotId match authoritative stored wager
        if (roundId !== undefined && tx.roundId !== undefined && String(roundId) !== String(tx.roundId)) {
          console.warn(`[BETADRiX Trader] Result rejected: roundId mismatch for ${requestId} (stored: ${tx.roundId}, received: ${roundId})`);
          return;
        }

        if (slotId !== undefined && tx.slotId !== undefined && String(slotId) !== String(tx.slotId)) {
          console.warn(`[BETADRiX Trader] Result rejected: slotId mismatch for ${requestId} (stored: ${tx.slotId}, received: ${slotId})`);
          return;
        }

        // 5. DUPLICATE PROTECTION: ensure request has not already been settled
        if (tx.status === "SETTLED") {
          console.warn(`[BETADRiX Trader] Duplicate result event ignored for already settled requestId ${requestId}`);
          return;
        }

        if (tx.status !== "ACCEPTED") {
          console.warn(`[BETADRiX Trader] Result rejected for requestId ${requestId} with status ${tx.status}`);
          return;
        }

        const normalizedOutcome = (outcome || "").toUpperCase();

        if (normalizedOutcome === "CASHOUT") {
          // Validate multiplier
          if (typeof multiplier !== "number" || !Number.isFinite(multiplier) || multiplier <= 0) {
            console.warn(`[BETADRiX Trader] Invalid multiplier ${multiplier} received for cashout ${requestId}`);
            return;
          }

          // Authoritative Payout: NEVER TRUST CLIENT PAYOUT
          const multiplierNum = Number(multiplier);
          const authoritativePayout = Number((tx.betAmount * multiplierNum).toFixed(2));

          // Mark settled
          tx.status = "SETTLED";
          tx.settledAt = Date.now();
          tx.outcome = "CASHOUT";
          tx.multiplier = multiplierNum;
          tx.payout = authoritativePayout;

          // Credit authoritative balance
          const newBal = creditBalance(authoritativePayout);

          reportGameplayActivity({
            game: "Trader",
            bet_amount: tx.betAmount,
            payout_amount: authoritativePayout,
            multiplier: multiplierNum,
            balance: newBal
          });

          sendToTrader({
            type: "BETADRiX_RESULT_SETTLED",
            requestId,
            roundId: tx.roundId,
            slotId: tx.slotId,
            payout: authoritativePayout,
            balance: newBal,
          });

          sendToTrader({
            type: "BETADRiX_BALANCE_UPDATE",
            balance: newBal,
          });
        } else if (normalizedOutcome === "CRASH") {
          // Positions still active at crash settle with payout = 0. Wager becomes LOST.
          tx.status = "SETTLED";
          tx.settledAt = Date.now();
          tx.outcome = "CRASH";
          tx.multiplier = typeof multiplier === "number" && Number.isFinite(multiplier) ? multiplier : 0;
          tx.payout = 0;

          // Current authoritative balance remains unchanged (wager was already deducted upon placement)
          const currentBal = latestBalanceRef.current;

          reportGameplayActivity({
            game: "Trader",
            bet_amount: tx.betAmount,
            payout_amount: 0,
            multiplier: 0,
            balance: currentBal
          });

          sendToTrader({
            type: "BETADRiX_RESULT_SETTLED",
            requestId,
            roundId: tx.roundId,
            slotId: tx.slotId,
            payout: 0,
            balance: currentBal,
          });

          sendToTrader({
            type: "BETADRiX_BALANCE_UPDATE",
            balance: currentBal,
          });
        } else {
          console.warn(`[BETADRiX Trader] Unrecognized outcome ${outcome} for requestId ${requestId}`);
        }
      }
    };

    window.addEventListener("message", handleWindowMessage);
    return () => {
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [resolvedUrl, markGameReady, sendPlinkoInit, sendRouletteInit, sendTraderInit, deductBalance, creditBalance, sendToPlinko, sendToRoulette, sendToTrader]);

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
        game={gameConfig}
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
                {gameConfig.name}
              </h1>
              <Badge variant="demo" size="sm">DEMO GAME</Badge>
              <span className="text-[11px] font-mono text-[#8E8E9E] bg-[#12131D] px-2 py-0.5 rounded border border-[#202130]">
                {gameConfig.provider}
              </span>
              {gameConfig.providerType && (
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                  {gameConfig.providerType}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8E8E9E] mt-0.5">
              Zero real-money risk
              {gameConfig.rtp ? ` • Theoretical RTP ${gameConfig.rtp}` : ""}
              {gameConfig.maxMultiplier ? ` • Max Multiplier ${gameConfig.maxMultiplier}` : ""}
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
          {gameConfig.id.toLowerCase() !== "plinko" && gameConfig.id.toLowerCase() !== "roulette" && gameConfig.id.toLowerCase() !== "trader" && !isAuthLoading && !isAuthenticated ? (
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
                  Sign in or create a demonstration player profile to launch {gameConfig.name} ({gameConfig.provider}) and synchronize your virtual demo credits.
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
          ) : !isGameActive ? (
            /* DISABLED / MAINTENANCE STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center relative overflow-hidden bg-[#08080E]">
              <div className="relative z-10 max-w-md mx-auto space-y-5 bg-[#0D0E16] p-6 sm:p-8 rounded-2xl border border-amber-500/30 shadow-2xl">
                <div className="flex justify-center mb-1">
                  <Image
                    src="/assets/ui/betadrix_logo.png"
                    alt="BETADRiX"
                    width={130}
                    height={38}
                    className="h-7 w-auto object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-wide">
                    {gameConfig.name}
                  </h3>
                  <span className="text-xs font-mono text-[#8E8E9E] block">
                    {gameConfig.provider}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Game Under Maintenance</span>
                  </div>
                  <p className="text-xs text-[#A0A0B2] leading-relaxed">
                    {gameConfig.maintenanceMessage || "This game is temporarily unavailable due to administrative maintenance. Please check back later."}
                  </p>
                </div>

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
                    <span>Loading {gameConfig.name}...</span>
                  </div>
                  <p className="text-xs text-[#8E8E9E]">
                    Please wait while the demo game loads.
                  </p>
                </div>
              )}

              <iframe
                ref={iframeRef}
                key={resolvedUrl}
                src={resolvedUrl}
                title={`${gameConfig.name} Demo Game`}
                className="w-full flex-1 min-h-[560px] sm:min-h-[660px] lg:min-h-[720px] border-0 bg-black"
                allow="autoplay; fullscreen; clipboard-read; clipboard-write; camera; microphone"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                onLoad={() => markGameReady()}
                onError={() => {
                  setIsIframeLoading(false);
                  setIframeError(true);
                }}
              />
            </div>
          ) : isUrlConfigured && iframeError ? (
            /* IFRAME LOAD TIMEOUT / CSP / BLOCKED FALLBACK */
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
                <Badge variant="demo" size="md">DEMO GAME</Badge>
                <h3 className="text-2xl font-black text-white mt-1">
                  {gameConfig.id.toLowerCase() === "plinko" || gameConfig.id.toLowerCase() === "roulette" || gameConfig.id.toLowerCase() === "trader" ? `Unable to load ${gameConfig.name}` : `OPEN ${gameConfig.name.toUpperCase()}`}
                </h3>
                <p className="text-xs text-[#8E8E9E] leading-relaxed">
                  {(gameConfig.id.toLowerCase() === "plinko" || gameConfig.id.toLowerCase() === "roulette" || gameConfig.id.toLowerCase() === "trader")
                    ? `The ${gameConfig.name} demo could not be embedded directly or timed out. You can launch it directly in a separate browser tab.`
                    : "Due to browser iframe security restrictions, this demo game can be opened directly in a new window."}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Separate Tab</span>
                </a>
                <button
                  onClick={() => {
                    setIframeError(false);
                    setIsIframeLoading(true);
                  }}
                  className="p-3 rounded-xl bg-[#141420] text-[#8E8E9E] hover:text-white border border-[#252535] cursor-pointer"
                  title="Retry embedded frame"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* GENERIC UNCONFIGURED / UNAVAILABLE STATE */
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
                    src={gameConfig.image}
                    alt={gameConfig.name}
                    fill
                    className="object-contain object-center"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-wide">
                    {gameConfig.name}
                  </h3>
                  <span className="text-xs font-mono text-[#8E8E9E] block">
                    {gameConfig.provider}
                  </span>
                </div>

                {/* Status Notice */}
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Game Currently Unavailable</span>
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
                onClick={() => toggleFavorite(gameConfig.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12131D] hover:bg-[#1A1C2A] border border-[#202232] text-neutral-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
              >
                <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-red-500 text-red-500" : "text-neutral-400"}`} />
                <span>{favorited ? "Favorited" : "Favorite"}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12131D] hover:bg-[#1A1C2A] border border-[#202232] text-neutral-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
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
            <GameInfo game={gameConfig} />
          </aside>
        )}
      </div>
    </div>
  );
}
