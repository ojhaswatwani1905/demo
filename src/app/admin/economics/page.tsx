"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import {
  Percent,
  RefreshCw,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  History,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
  Clock,
  User,
  Power
} from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface GameConfigItem {
  enabled: boolean;
  useGlobal: boolean;
  houseEdge: number;
}

interface EconomicsGames {
  trader: GameConfigItem;
  roulette: GameConfigItem;
  plinko: GameConfigItem;
  mines: GameConfigItem;
  dice: GameConfigItem;
  [key: string]: GameConfigItem;
}

interface EconomicsConfig {
  version: number;
  globalHouseEdge: number;
  games: EconomicsGames;
  updatedAt: string;
  updatedBy: string;
}

interface HistoryRecord {
  id: number;
  version: number;
  globalHouseEdge: number;
  games: EconomicsGames;
  updatedAt: string;
  updatedBy: string;
}

type GameKey = "trader" | "roulette" | "plinko" | "mines" | "dice";

interface GameMetadata {
  id: GameKey;
  name: string;
  category: string;
  defaultRtp: string;
}

const SUPPORTED_GAMES: GameMetadata[] = [
  { id: "trader", name: "Trader", category: "Originals", defaultRtp: "96.00%" },
  { id: "roulette", name: "European Roulette", category: "Table", defaultRtp: "94.74%" },
  { id: "plinko", name: "Plinko", category: "Originals", defaultRtp: "94.00%" },
  { id: "mines", name: "Mines", category: "Originals", defaultRtp: "95.00%" },
  { id: "dice", name: "Dice", category: "Originals", defaultRtp: "97.00%" },
];

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 10) return "Just now";
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function normalizeInput(val: string): { valid: boolean; value?: number; error?: string } {
  const trimmed = val.trim();
  if (trimmed === "") {
    return { valid: false, error: "Value cannot be empty" };
  }
  const num = Number(trimmed);
  if (isNaN(num)) {
    return { valid: false, error: "Must be a numeric value" };
  }
  if (!isFinite(num)) {
    return { valid: false, error: "Cannot be Infinity" };
  }
  if (num < 0) {
    return { valid: false, error: "Cannot be negative (min 0.00%)" };
  }
  if (num > 50) {
    return { valid: false, error: "Exceeds safe threshold (max 50.00%)" };
  }
  // Check decimal places
  const parts = trimmed.split(".");
  if (parts.length > 1 && parts[1].length > 2) {
    return { valid: false, error: "Maximum 2 decimal places allowed" };
  }
  return { valid: true, value: Math.round(num * 100) / 100 };
}

export default function AdminEconomicsPage() {
  const { subscribe } = useRealtime();

  // Server state & local draft state
  const [serverConfig, setServerConfig] = useState<EconomicsConfig | null>(null);
  const [draftConfig, setDraftConfig] = useState<EconomicsConfig | null>(null);

  // String input buffers for immediate editing without losing formatting or cursor
  const [globalInputStr, setGlobalInputStr] = useState<string>("5.00");
  const [gameInputStrs, setGameInputStrs] = useState<Record<string, string>>({
    trader: "4.00",
    roulette: "5.26",
    plinko: "6.00",
    mines: "5.00",
    dice: "3.00",
  });

  // History state
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [inspectHistoryRecord, setInspectHistoryRecord] = useState<HistoryRecord | null>(null);

  // Loading & status states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Concurrency & Real-time conflict state
  const [conflictState, setConflictState] = useState<{
    detected: boolean;
    currentVersion?: number;
    message?: string;
  } | null>(null);

  const [realtimeNotice, setRealtimeNotice] = useState<{
    newVersion: number;
    updatedBy: string;
  } | null>(null);

  // Expandable preview of diffs
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // Data Fetching
  // --------------------------------------------------------------------------

  const loadConfig = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/economics");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setServerConfig(data.config);
          setDraftConfig(JSON.parse(JSON.stringify(data.config)));
          setGlobalInputStr(Number(data.config.globalHouseEdge).toFixed(2));

          const initialGameInputs: Record<string, string> = {};
          SUPPORTED_GAMES.forEach((g) => {
            const gameObj = data.config.games?.[g.id];
            initialGameInputs[g.id] = gameObj ? Number(gameObj.houseEdge).toFixed(2) : "5.00";
          });
          setGameInputStrs(initialGameInputs);
          setConflictState(null);
          setRealtimeNotice(null);
        }
      } else {
        const err = await res.json();
        setStatusMessage({ type: "error", text: err.error || "Failed to load economics configuration" });
      }
    } catch (err: any) {
      console.error("Failed to load economics config:", err);
      setStatusMessage({ type: "error", text: "Network error loading economics configuration" });
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/economics/history?limit=30");
      if (res.ok) {
        const data = await res.json();
        if (data.history) {
          setHistory(data.history);
        }
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
    loadHistory();
  }, [loadConfig, loadHistory]);

  // --------------------------------------------------------------------------
  // Real-time Event Subscription
  // --------------------------------------------------------------------------

  useEffect(() => {
    const unsub = subscribe("ECONOMICS_CONFIG_UPDATED", (payload: any) => {
      if (!payload) return;
      const newVersion = payload.version || payload.payload?.version;

      // Check if user currently has unsaved draft changes
      setDraftConfig((currentDraft) => {
        setServerConfig((currentServer) => {
          if (!currentDraft || !currentServer) return currentServer;

          const isDirty =
            JSON.stringify({ edge: currentDraft.globalHouseEdge, games: currentDraft.games }) !==
            JSON.stringify({ edge: currentServer.globalHouseEdge, games: currentServer.games });

          if (!isDirty) {
            // No unsaved changes -> seamlessly update UI
            loadConfig(true);
            loadHistory();
          } else {
            // Unsaved changes exist -> show non-destructive warning
            setRealtimeNotice({
              newVersion: newVersion || currentServer.version + 1,
              updatedBy: payload.updatedBy || payload.payload?.updatedBy || "another administrator",
            });
            loadHistory();
          }
          return currentServer;
        });
        return currentDraft;
      });
    });

    return unsub;
  }, [subscribe, loadConfig, loadHistory]);

  // --------------------------------------------------------------------------
  // Unsaved Changes Tracking & Diffing
  // --------------------------------------------------------------------------

  const diffs = useMemo(() => {
    if (!serverConfig || !draftConfig) return [];
    const list: Array<{ label: string; from: string; to: string }> = [];

    // Global check
    if (serverConfig.globalHouseEdge !== draftConfig.globalHouseEdge) {
      list.push({
        label: "Global House Edge",
        from: `${Number(serverConfig.globalHouseEdge).toFixed(2)}%`,
        to: `${Number(draftConfig.globalHouseEdge).toFixed(2)}%`,
      });
    }

    // Per-game check
    SUPPORTED_GAMES.forEach((g) => {
      const sGame = serverConfig.games?.[g.id];
      const dGame = draftConfig.games?.[g.id];
      if (!sGame || !dGame) return;

      if (sGame.useGlobal !== dGame.useGlobal) {
        list.push({
          label: `${g.name} Mode`,
          from: sGame.useGlobal ? "Global" : `Custom (${Number(sGame.houseEdge).toFixed(2)}%)`,
          to: dGame.useGlobal ? "Global" : `Custom (${Number(dGame.houseEdge).toFixed(2)}%)`,
        });
      } else if (!dGame.useGlobal && sGame.houseEdge !== dGame.houseEdge) {
        list.push({
          label: `${g.name} Custom Rate`,
          from: `${Number(sGame.houseEdge).toFixed(2)}%`,
          to: `${Number(dGame.houseEdge).toFixed(2)}%`,
        });
      }

      if (sGame.enabled !== dGame.enabled) {
        list.push({
          label: `${g.name} Status`,
          from: sGame.enabled ? "Enabled" : "Disabled",
          to: dGame.enabled ? "Enabled" : "Disabled",
        });
      }
    });

    return list;
  }, [serverConfig, draftConfig]);

  const hasUnsavedChanges = diffs.length > 0;

  // Window beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // --------------------------------------------------------------------------
  // Validation Errors
  // --------------------------------------------------------------------------

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    const globalCheck = normalizeInput(globalInputStr);
    if (!globalCheck.valid) {
      errors.global = globalCheck.error || "Invalid global rate";
    }

    SUPPORTED_GAMES.forEach((g) => {
      const gameObj = draftConfig?.games?.[g.id];
      if (gameObj && !gameObj.useGlobal) {
        const check = normalizeInput(gameInputStrs[g.id] ?? "");
        if (!check.valid) {
          errors[g.id] = check.error || "Invalid rate";
        }
      }
    });

    return errors;
  }, [globalInputStr, gameInputStrs, draftConfig]);

  const isValid = Object.keys(validationErrors).length === 0;

  // --------------------------------------------------------------------------
  // Local Draft Mutation Handlers
  // --------------------------------------------------------------------------

  const handleGlobalChange = (val: string) => {
    setGlobalInputStr(val);
    const check = normalizeInput(val);
    if (check.valid && check.value !== undefined) {
      setDraftConfig((prev) => (prev ? { ...prev, globalHouseEdge: check.value! } : prev));
    }
  };

  const handleGameModeToggle = (gameId: string, useGlobal: boolean) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      const gameObj = prev.games[gameId];
      if (!gameObj) return prev;
      return {
        ...prev,
        games: {
          ...prev.games,
          [gameId]: {
            ...gameObj,
            useGlobal,
          },
        },
      };
    });
  };

  const handleGameHouseEdgeChange = (gameId: string, val: string) => {
    setGameInputStrs((prev) => ({ ...prev, [gameId]: val }));
    const check = normalizeInput(val);
    if (check.valid && check.value !== undefined) {
      setDraftConfig((prev) => {
        if (!prev) return prev;
        const gameObj = prev.games[gameId];
        if (!gameObj) return prev;
        return {
          ...prev,
          games: {
            ...prev.games,
            [gameId]: {
              ...gameObj,
              houseEdge: check.value!,
            },
          },
        };
      });
    }
  };

  const handleGameStatusToggle = (gameId: string) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      const gameObj = prev.games[gameId];
      if (!gameObj) return prev;
      return {
        ...prev,
        games: {
          ...prev.games,
          [gameId]: {
            ...gameObj,
            enabled: !gameObj.enabled,
          },
        },
      };
    });
  };

  const handleResetDraft = () => {
    if (!serverConfig) return;
    setDraftConfig(JSON.parse(JSON.stringify(serverConfig)));
    setGlobalInputStr(Number(serverConfig.globalHouseEdge).toFixed(2));
    const initialGameInputs: Record<string, string> = {};
    SUPPORTED_GAMES.forEach((g) => {
      const gameObj = serverConfig.games?.[g.id];
      initialGameInputs[g.id] = gameObj ? Number(gameObj.houseEdge).toFixed(2) : "5.00";
    });
    setGameInputStrs(initialGameInputs);
    setStatusMessage(null);
  };

  // --------------------------------------------------------------------------
  // Apply Changes Handler (Optimistic Concurrency & Versioning)
  // --------------------------------------------------------------------------

  const handleApplyChanges = async () => {
    if (!draftConfig || !serverConfig || !isValid || isSaving) return;

    setIsSaving(true);
    setStatusMessage(null);
    setShowPreviewModal(false);

    try {
      const res = await fetch("/api/admin/economics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedVersion: serverConfig.version,
          globalHouseEdge: draftConfig.globalHouseEdge,
          games: draftConfig.games,
          reason: "Admin updated economics configuration via console",
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.error === "CONFIGURATION_VERSION_CONFLICT") {
        setConflictState({
          detected: true,
          currentVersion: data.currentVersion,
          message: data.message || "A newer configuration is already active on the server.",
        });
        setStatusMessage({
          type: "error",
          text: `Configuration Conflict: Server is at v${data.currentVersion}. Your changes were NOT applied.`,
        });
        return;
      }

      if (res.ok && data.success && data.config) {
        setServerConfig(data.config);
        setDraftConfig(JSON.parse(JSON.stringify(data.config)));
        setGlobalInputStr(Number(data.config.globalHouseEdge).toFixed(2));
        const updatedGameInputs: Record<string, string> = {};
        SUPPORTED_GAMES.forEach((g) => {
          const gameObj = data.config.games?.[g.id];
          updatedGameInputs[g.id] = gameObj ? Number(gameObj.houseEdge).toFixed(2) : "5.00";
        });
        setGameInputStrs(updatedGameInputs);
        setConflictState(null);
        setRealtimeNotice(null);

        setStatusMessage({
          type: "success",
          text: `Economics configuration v${data.config.version} successfully applied and broadcast via real-time!`,
        });

        loadHistory();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to update economics configuration.",
        });
      }
    } catch (err: any) {
      console.error("Apply changes error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Network error submitting configuration.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Effective Value Calculation from current draft state
  // --------------------------------------------------------------------------

  const getEffectiveRate = (gameId: string): number => {
    if (!draftConfig) return 5.0;
    const game = draftConfig.games?.[gameId];
    if (!game || game.useGlobal) {
      return draftConfig.globalHouseEdge;
    }
    return game.houseEdge;
  };

  return (
    <AdminControlShell
      title="Economics"
      subtitle="Configure transparent demo-game house-edge settings."
      actions={
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleResetDraft}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12151F] hover:bg-[#181B26] border border-[#262B3B] text-xs font-mono text-[#8E95A5] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Discard unsaved local modifications"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => loadConfig()}
            disabled={isLoading || isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12151F] hover:bg-[#181B26] border border-[#262B3B] text-xs font-mono text-[#A2A9B9] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Reload from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            disabled={!hasUnsavedChanges || !isValid || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
              hasUnsavedChanges && isValid && !isSaving
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 active:scale-98"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50 shadow-none"
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Applying..." : "Apply Changes"}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl pb-16">
        {/* Status Notice Banner (Success / Error) */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                : "bg-red-950/40 border-red-500/50 text-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Real-time External Update Notification Banner */}
        {realtimeNotice && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white">New configuration available (v{realtimeNotice.newVersion})</span>:{" "}
                Updated by <span className="underline">{realtimeNotice.updatedBy}</span>. You have unsaved changes in your draft.
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  loadConfig(false);
                  setRealtimeNotice(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-[11px] cursor-pointer"
              >
                Reload Latest
              </button>
              <button
                type="button"
                onClick={() => setRealtimeNotice(null)}
                className="text-amber-400 hover:text-white p-1"
                title="Dismiss notice and keep current draft"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Optimistic Concurrency 409 Conflict Banner */}
        {conflictState && conflictState.detected && (
          <div className="p-5 rounded-2xl bg-red-950/60 border border-red-500/80 text-red-100 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Configuration Version Conflict</h4>
                <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                  Another administrator updated the economics settings while you were editing. The server is now at{" "}
                  <strong className="text-white underline">v{conflictState.currentVersion}</strong>, but your draft was prepared against{" "}
                  <strong className="text-white">v{serverConfig?.version}</strong>. Your draft changes were preserved so you do not lose your work.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-8 pt-1">
              <button
                type="button"
                onClick={() => {
                  loadConfig(false);
                  setConflictState(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-md"
              >
                Reload Latest Server Config
              </button>
              <button
                type="button"
                onClick={() => {
                  if (conflictState.currentVersion) {
                    setServerConfig((prev) => (prev ? { ...prev, version: conflictState.currentVersion! } : prev));
                  }
                  setConflictState(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono border border-neutral-700 cursor-pointer"
              >
                Keep My Changes & Retry Next
              </button>
            </div>
          </div>
        )}

        {/* Top Status Header Metadata */}
        <div className="p-4 rounded-2xl bg-[#101218] border border-[#252936] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#8E95A5]">Version:</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-white font-bold">
                {serverConfig ? `v${serverConfig.version}` : "..."}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#8E95A5]" />
              <span className="text-[#8E95A5]">Last Updated:</span>
              <span className="text-neutral-200">
                {serverConfig ? formatTimeAgo(serverConfig.updatedAt) : "..."}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#8E95A5]" />
              <span className="text-[#8E95A5]">Updated By:</span>
              <span className="text-neutral-200 font-bold">
                {serverConfig?.updatedBy || "system"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[11px] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Unsaved Changes ({diffs.length})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                <ShieldCheck className="w-3 h-3" />
                Synchronized
              </span>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* SECTION 1: GLOBAL HOUSE EDGE                                    */}
        {/* ================================================================ */}
        <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
          <div className="flex items-center justify-between border-b border-[#252936] pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-red-500" />
                Global House Edge
              </h2>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                Default house-edge percentage used by games configured to inherit the global setting.
              </p>
            </div>

            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#090A0E] border border-[#252936] text-[#A2A9B9]">
              Policy: [ 0.00% – 50.00% ]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="globalHouseEdgeInput" className="block text-xs font-bold text-[#8E95A5]">
                Global Percentage Rate
              </label>
              <div className="relative">
                <input
                  id="globalHouseEdgeInput"
                  type="text"
                  inputMode="decimal"
                  value={globalInputStr}
                  onChange={(e) => handleGlobalChange(e.target.value)}
                  placeholder="5.00"
                  className={`w-full p-2.5 pr-8 rounded-xl bg-[#090A0E] border font-mono text-sm text-white focus:outline-none transition-colors ${
                    validationErrors.global
                      ? "border-red-500 focus:border-red-400"
                      : "border-[#252936] focus:border-red-500"
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-neutral-500 font-mono text-sm pointer-events-none">
                  %
                </span>
              </div>
              {validationErrors.global ? (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-mono">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {validationErrors.global}
                </p>
              ) : (
                <p className="text-[11px] text-[#71788A]">
                  Stored as 2 decimal places. Applied to all Global-mode games.
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#090A0E] border border-[#252936] flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-[#71788A]">Currently Inheriting</span>
              <div className="text-xl font-bold text-white mt-1">
                {SUPPORTED_GAMES.filter((g) => draftConfig?.games?.[g.id]?.useGlobal).length} of {SUPPORTED_GAMES.length} Games
              </div>
              <span className="text-[11px] text-emerald-400/90 font-mono mt-1">
                Preview active margin: {Number(draftConfig?.globalHouseEdge || 5).toFixed(2)}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0E] border border-[#252936] flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-[#71788A]">Custom Overrides</span>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {SUPPORTED_GAMES.filter((g) => !draftConfig?.games?.[g.id]?.useGlobal).length} Games
              </div>
              <span className="text-[11px] text-neutral-400 font-mono mt-1">
                Independently calibrated margins
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SECTION 2: PER-GAME CONFIGURATION TABLE / CARDS                  */}
        {/* ================================================================ */}
        <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
          <div className="flex items-center justify-between border-b border-[#252936] pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-500" />
                Per-Game Economics Calibration
              </h2>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                Toggle between Global inheritance and Custom override per game. Effective house edge updates live in draft.
              </p>
            </div>

            <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline-block">
              5 Recognized Games
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#252936] text-[#8E95A5] text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-bold pl-2">Game</th>
                  <th className="pb-3 font-bold">Configuration Mode</th>
                  <th className="pb-3 font-bold">Configured Value</th>
                  <th className="pb-3 font-bold">Effective Margin</th>
                  <th className="pb-3 font-bold text-right pr-2">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2330]">
                {SUPPORTED_GAMES.map((gameMeta) => {
                  const gameObj = draftConfig?.games?.[gameMeta.id] || {
                    enabled: true,
                    useGlobal: true,
                    houseEdge: 5.0,
                  };
                  const isGlobal = gameObj.useGlobal;
                  const effective = getEffectiveRate(gameMeta.id);
                  const error = validationErrors[gameMeta.id];

                  return (
                    <tr
                      key={gameMeta.id}
                      className={`hover:bg-[#121520] transition-colors ${
                        !gameObj.enabled ? "opacity-60" : ""
                      }`}
                    >
                      {/* Game Column */}
                      <td className="py-3.5 pl-2">
                        <div className="font-sans font-bold text-sm text-white flex items-center gap-2">
                          <span>{gameMeta.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                            {gameMeta.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#71788A] font-mono">
                          ID: {gameMeta.id} · Std: {gameMeta.defaultRtp}
                        </span>
                      </td>

                      {/* Mode Segmented Toggle */}
                      <td className="py-3.5">
                        <div className="inline-flex rounded-xl p-1 bg-[#090A0E] border border-[#252936]">
                          <button
                            type="button"
                            onClick={() => handleGameModeToggle(gameMeta.id, true)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isGlobal
                                ? "bg-red-600 text-white shadow-sm"
                                : "text-[#8E95A5] hover:text-white"
                            }`}
                          >
                            Global
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGameModeToggle(gameMeta.id, false)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              !isGlobal
                                ? "bg-red-600 text-white shadow-sm"
                                : "text-[#8E95A5] hover:text-white"
                            }`}
                          >
                            Custom
                          </button>
                        </div>
                      </td>

                      {/* Configured Input */}
                      <td className="py-3.5">
                        {isGlobal ? (
                          <div className="flex items-center gap-2 text-neutral-500">
                            <Lock className="w-3.5 h-3.5 text-neutral-600" />
                            <span className="font-mono text-xs">
                              Inherits Global ({Number(draftConfig?.globalHouseEdge || 5).toFixed(2)}%)
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="relative w-32">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={gameInputStrs[gameMeta.id] ?? ""}
                                onChange={(e) => handleGameHouseEdgeChange(gameMeta.id, e.target.value)}
                                className={`w-full p-1.5 pr-6 rounded-lg bg-[#090A0E] border font-mono text-xs text-white focus:outline-none transition-colors ${
                                  error
                                    ? "border-red-500 focus:border-red-400"
                                    : "border-[#252936] focus:border-red-500"
                                }`}
                              />
                              <span className="absolute right-2 top-1.5 text-neutral-500 text-xs pointer-events-none">
                                %
                              </span>
                            </div>
                            {error && (
                              <span className="text-[10px] text-red-400 block font-sans">
                                {error}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Effective Value */}
                      <td className="py-3.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090A0E] border border-[#252936]">
                          <span className="text-[10px] text-[#71788A] uppercase">Effective:</span>
                          <span className="font-bold text-sm text-emerald-400 font-mono">
                            {effective.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* Availability Toggle */}
                      <td className="py-3.5 text-right pr-2">
                        <button
                          type="button"
                          onClick={() => handleGameStatusToggle(gameMeta.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            gameObj.enabled
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{gameObj.enabled ? "Enabled" : "Disabled"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View */}
          <div className="block md:hidden space-y-4">
            {SUPPORTED_GAMES.map((gameMeta) => {
              const gameObj = draftConfig?.games?.[gameMeta.id] || {
                enabled: true,
                useGlobal: true,
                houseEdge: 5.0,
              };
              const isGlobal = gameObj.useGlobal;
              const effective = getEffectiveRate(gameMeta.id);
              const error = validationErrors[gameMeta.id];

              return (
                <div
                  key={gameMeta.id}
                  className={`p-4 rounded-xl bg-[#090A0E] border border-[#252936] space-y-3 ${
                    !gameObj.enabled ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        {gameMeta.name}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                          {gameMeta.category}
                        </span>
                      </h3>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">ID: {gameMeta.id}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGameStatusToggle(gameMeta.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        gameObj.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {gameObj.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">
                        Mode
                      </span>
                      <div className="inline-flex rounded-lg p-0.5 bg-[#121520] border border-[#252936] w-full">
                        <button
                          type="button"
                          onClick={() => handleGameModeToggle(gameMeta.id, true)}
                          className={`flex-1 py-1 text-xs font-semibold rounded ${
                            isGlobal ? "bg-red-600 text-white" : "text-neutral-400"
                          }`}
                        >
                          Global
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGameModeToggle(gameMeta.id, false)}
                          className={`flex-1 py-1 text-xs font-semibold rounded ${
                            !isGlobal ? "bg-red-600 text-white" : "text-neutral-400"
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">
                        Effective Margin
                      </span>
                      <div className="p-1.5 rounded-lg bg-[#121520] border border-[#252936] text-center font-mono font-bold text-sm text-emerald-400">
                        {effective.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {!isGlobal && (
                    <div className="pt-1">
                      <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">
                        Custom House Edge (%)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={gameInputStrs[gameMeta.id] ?? ""}
                          onChange={(e) => handleGameHouseEdgeChange(gameMeta.id, e.target.value)}
                          className={`w-full p-2 pr-7 rounded-lg bg-[#121520] border font-mono text-xs text-white focus:outline-none ${
                            error ? "border-red-500" : "border-[#252936]"
                          }`}
                        />
                        <span className="absolute right-2.5 top-2 text-neutral-500 text-xs font-mono">%</span>
                      </div>
                      {error && <span className="text-[10px] text-red-400 mt-1 block">{error}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick inline Diff Preview Bar */}
          {hasUnsavedChanges && (
            <div className="p-4 rounded-xl bg-[#090A0E] border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {diffs.length} unsaved modification{diffs.length === 1 ? "" : "s"} ready to apply
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono border border-neutral-700 cursor-pointer"
                >
                  Review Changes
                </button>
                <button
                  type="button"
                  onClick={handleApplyChanges}
                  disabled={!isValid || isSaving}
                  className="px-4 py-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  {isSaving ? "Applying..." : "Apply Now"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* SECTION 3: CONFIGURATION AUDIT HISTORY TABLE                     */}
        {/* ================================================================ */}
        <div className="p-6 rounded-2xl bg-[#101218] border border-[#252936] space-y-4">
          <div className="flex items-center justify-between border-b border-[#252936] pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-red-500" />
                Configuration Version History
              </h2>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                Immutable audit trail of previous economics configuration versions. Read-only historical records.
              </p>
            </div>

            <button
              type="button"
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#090A0E] hover:bg-[#121520] border border-[#252936] text-[11px] font-mono text-[#A2A9B9] hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingHistory ? "animate-spin" : ""}`} />
              <span>Refresh History</span>
            </button>
          </div>

          {isLoadingHistory && history.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 font-mono">
              Loading configuration audit history...
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 font-mono">
              No historical records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#252936] text-[#8E95A5] text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-bold pl-2">Version</th>
                    <th className="pb-3 font-bold">Global Edge</th>
                    <th className="pb-3 font-bold">Updated</th>
                    <th className="pb-3 font-bold">Updated By</th>
                    <th className="pb-3 font-bold hidden sm:table-cell">Games Summary</th>
                    <th className="pb-3 font-bold text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2330]">
                  {history.map((h, idx) => {
                    const isCurrent = h.version === serverConfig?.version;
                    const gamesCount = Object.keys(h.games || {}).length;
                    const customCount = Object.values(h.games || {}).filter((g: any) => !g.useGlobal).length;

                    return (
                      <tr key={h.id || idx} className="hover:bg-[#121520] transition-colors">
                        <td className="py-3 pl-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                              isCurrent
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-neutral-900 text-neutral-300 border border-neutral-800"
                            }`}
                          >
                            v{h.version}
                            {isCurrent && <span className="text-[9px] uppercase font-sans">Active</span>}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-neutral-200">
                          {Number(h.globalHouseEdge).toFixed(2)}%
                        </td>
                        <td className="py-3 text-neutral-400">
                          {formatTimeAgo(h.updatedAt)}
                        </td>
                        <td className="py-3 text-neutral-300">
                          {h.updatedBy || "system"}
                        </td>
                        <td className="py-3 text-neutral-500 hidden sm:table-cell text-[11px]">
                          {customCount === 0 ? "All Global" : `${customCount} Custom override${customCount === 1 ? "" : "s"}`} ({gamesCount} games)
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            type="button"
                            onClick={() => setInspectHistoryRecord(h)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090A0E] hover:bg-neutral-800 border border-[#252936] text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-neutral-400" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* MODAL: PREVIEW UNSAVED CHANGES BEFORE APPLY                      */}
      {/* ================================================================ */}
      {showPreviewModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowPreviewModal(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-[#101218] border border-[#252936] shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#252936] pb-3">
              <div>
                <h3 id="preview-title" className="text-base font-bold text-white flex items-center gap-2">
                  <Save className="w-4 h-4 text-red-500" />
                  Review Changes to Apply
                </h3>
                <p className="text-xs text-[#8E95A5] mt-0.5">
                  Target version increment: v{serverConfig?.version} → v{(serverConfig?.version || 0) + 1}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {diffs.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No changes detected.</p>
              ) : (
                diffs.map((d, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#090A0E] border border-[#252936] flex items-center justify-between text-xs font-mono"
                  >
                    <span className="font-bold text-white font-sans">{d.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 line-through">{d.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-emerald-400 font-bold">{d.to}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed font-sans">
              Applying will persist these values to the central database, create an immutable audit record, increment the version number, and broadcast an <code className="text-amber-400 font-mono">ECONOMICS_CONFIG_UPDATED</code> realtime SSE event.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyChanges}
                disabled={isSaving || !isValid}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-600/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Applying..." : "Confirm & Apply"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: READ-ONLY HISTORICAL DETAIL INSPECTION                    */}
      {/* ================================================================ */}
      {inspectHistoryRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onKeyDown={(e) => {
            if (e.key === "Escape") setInspectHistoryRecord(null);
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-[#101218] border border-[#252936] shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#252936] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="history-title" className="text-base font-bold text-white">
                    Historical Snapshot v{inspectHistoryRecord.version}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
                    READ-ONLY
                  </span>
                </div>
                <p className="text-xs text-[#8E95A5] mt-0.5">
                  Committed {new Date(inspectHistoryRecord.updatedAt).toUTCString()} by {inspectHistoryRecord.updatedBy || "system"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectHistoryRecord(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090A0E] border border-[#252936] flex items-center justify-between font-mono text-xs">
              <span className="text-[#8E95A5]">Global House Edge Rate</span>
              <span className="text-base font-bold text-amber-400">
                {Number(inspectHistoryRecord.globalHouseEdge).toFixed(2)}%
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E95A5]">
                Game Calibration State
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#252936] text-[#8E95A5] text-[10px] uppercase">
                      <th className="pb-2 font-bold pl-1">Game</th>
                      <th className="pb-2 font-bold">Mode</th>
                      <th className="pb-2 font-bold">Configured</th>
                      <th className="pb-2 font-bold">Effective</th>
                      <th className="pb-2 font-bold text-right pr-1">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2330]">
                    {SUPPORTED_GAMES.map((gm) => {
                      const gObj = inspectHistoryRecord.games?.[gm.id] || {
                        enabled: true,
                        useGlobal: true,
                        houseEdge: 5.0,
                      };
                      const eff = gObj.useGlobal
                        ? inspectHistoryRecord.globalHouseEdge
                        : gObj.houseEdge;

                      return (
                        <tr key={gm.id} className="text-neutral-200">
                          <td className="py-2.5 pl-1 font-bold font-sans">
                            {gm.name}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                gObj.useGlobal
                                  ? "bg-neutral-900 text-neutral-400"
                                  : "bg-red-950/60 text-red-300 border border-red-500/30"
                              }`}
                            >
                              {gObj.useGlobal ? "Global" : "Custom"}
                            </span>
                          </td>
                          <td className="py-2.5 text-neutral-400">
                            {gObj.useGlobal ? "—" : `${Number(gObj.houseEdge).toFixed(2)}%`}
                          </td>
                          <td className="py-2.5 font-bold text-emerald-400">
                            {Number(eff).toFixed(2)}%
                          </td>
                          <td className="py-2.5 text-right pr-1">
                            <span
                              className={`text-[10px] font-bold ${
                                gObj.enabled ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {gObj.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectHistoryRecord(null)}
                className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminControlShell>
  );
}
