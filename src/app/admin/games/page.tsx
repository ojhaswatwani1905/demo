"use client";

import React, { useState, useEffect } from "react";
import { AdminControlShell } from "@/components/admin/AdminControlShell";
import { Gamepad2, Search, Edit3, Power, ExternalLink, ShieldAlert, CheckCircle2, RefreshCw, X, AlertTriangle, Play } from "lucide-react";
import { useRealtime } from "@/context/RealtimeContext";

interface GameConfig {
  id: string;
  game_id: string;
  name: string;
  category: string;
  is_enabled: boolean;
  min_bet: number;
  max_bet: number;
  launch_url: string;
  rtp_percentage: number;
  maintenance_message?: string;
  updated_at?: string;
}

export default function AdminGamesPage() {
  const { subscribe } = useRealtime();

  const [games, setGames] = useState<GameConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGame, setEditingGame] = useState<GameConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadGames = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/games");
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch (err) {
      console.error("Failed to load games:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    const unsub = subscribe("GAME_CONFIG_UPDATED", (payload: any) => {
      if (payload) {
        setGames(prev =>
          prev.map(g => (g.game_id === payload.game_id ? { ...g, ...payload } : g))
        );
      }
    });
    return unsub;
  }, [subscribe]);

  const toggleGameStatus = async (game: GameConfig) => {
    try {
      const res = await fetch("/api/admin/games", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: game.game_id,
          is_enabled: !game.is_enabled
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGames(prev =>
          prev.map(g => (g.game_id === game.game_id ? { ...g, is_enabled: !game.is_enabled } : g))
        );
        setStatusMessage({
          type: "success",
          text: `Game ${game.name} is now ${!game.is_enabled ? "ENABLED" : "DISABLED"} across platform!`
        });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to update game status" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error" });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/games", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingGame)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: `Configuration for ${editingGame.name} saved and synced!`
        });
        setEditingGame(null);
        loadGames();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to save game" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredGames = games.filter(
    g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.game_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminControlShell
      title="Games Catalog & Configuration"
      subtitle="Manage live demo games, virtual betting limits, launch endpoints, and operational statuses in real-time."
    >
      <div className="space-y-6">
        {/* Banner Alert */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Compliance Notice:</strong> Crash game has been permanently decommissioned. Plinko remains disabled by default until an authorized external URL is configured.
            </span>
          </div>
          <button
            onClick={loadGames}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-amber-200 border border-amber-500/30 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/40 border-red-500/30 text-red-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-[#0d131f] border border-[#1e293b] rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by game name, slug, or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-slate-100 focus:outline-none w-full placeholder:text-slate-500"
          />
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGames.map(game => {
            const isConfigured = Boolean(game.launch_url && game.launch_url.trim().length > 0);

            return (
              <div
                key={game.game_id}
                className={`bg-[#0d131f] border rounded-xl p-5 transition-all flex flex-col justify-between ${
                  game.is_enabled
                    ? "border-cyan-500/30 hover:border-cyan-500/60 shadow-lg shadow-cyan-950/20"
                    : "border-slate-800 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                          game.is_enabled
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                          {game.name}
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {game.category}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">ID: {game.game_id}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleGameStatus(game)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        game.is_enabled
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {game.is_enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  {/* Limits and Config */}
                  <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-[#080c14] rounded-lg border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Min Bet</span>
                      <span className="text-slate-200 font-semibold">${Number(game.min_bet || 1).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Max Bet</span>
                      <span className="text-slate-200 font-semibold">${Number(game.max_bet || 5000).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">RTP</span>
                      <span className="text-cyan-400 font-semibold">{game.rtp_percentage || 98.5}%</span>
                    </div>
                  </div>

                  {/* Launch URL Preview */}
                  <div className="text-xs mb-3">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Launch Endpoint</span>
                    <div className="p-2 bg-[#080c14] border border-slate-800 rounded font-mono text-slate-300 text-[11px] truncate flex items-center justify-between">
                      <span className="truncate">{game.launch_url || "(Not Configured / Offline)"}</span>
                      {isConfigured && (
                        <a
                          href={game.launch_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-cyan-400 hover:text-cyan-300 shrink-0"
                          title="Open Game In New Tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {game.maintenance_message && (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300 text-xs mb-3">
                      <strong>Maintenance:</strong> {game.maintenance_message}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => setEditingGame(game)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Configuration
                  </button>
                  {isConfigured && (
                    <a
                      href={game.launch_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-500/30 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Test Launch
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Modal */}
        {editingGame && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e1626] border border-cyan-500/30 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setEditingGame(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Edit Game Configuration</h3>
                  <p className="text-xs text-slate-400">Adjust limits, endpoints, and maintenance for {editingGame.name}</p>
                </div>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Game Display Name
                  </label>
                  <input
                    type="text"
                    value={editingGame.name}
                    onChange={e => setEditingGame({ ...editingGame, name: e.target.value })}
                    required
                    className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Launch / Iframe URL
                  </label>
                  <input
                    type="text"
                    value={editingGame.launch_url || ""}
                    onChange={e => setEditingGame({ ...editingGame, launch_url: e.target.value })}
                    placeholder="e.g. /games/mines or https://..."
                    className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Leaving empty or unconfigured marks game as offline/provider-pending.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Min Virtual Bet ($)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.01"
                      value={editingGame.min_bet}
                      onChange={e => setEditingGame({ ...editingGame, min_bet: parseFloat(e.target.value) || 1 })}
                      required
                      className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Max Virtual Bet ($)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={editingGame.max_bet}
                      onChange={e => setEditingGame({ ...editingGame, max_bet: parseFloat(e.target.value) || 5000 })}
                      required
                      className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      RTP Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="50"
                      max="100"
                      value={editingGame.rtp_percentage || 98.5}
                      onChange={e => setEditingGame({ ...editingGame, rtp_percentage: parseFloat(e.target.value) || 98.5 })}
                      required
                      className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Game Status
                    </label>
                    <select
                      value={editingGame.is_enabled ? "enabled" : "disabled"}
                      onChange={e => setEditingGame({ ...editingGame, is_enabled: e.target.value === "enabled" })}
                      className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="enabled">Active & Playable</option>
                      <option value="disabled">Disabled / Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Maintenance Notice (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingGame.maintenance_message || ""}
                    onChange={e => setEditingGame({ ...editingGame, maintenance_message: e.target.value })}
                    placeholder="Displayed when game is disabled..."
                    className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingGame(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminControlShell>
  );
}
