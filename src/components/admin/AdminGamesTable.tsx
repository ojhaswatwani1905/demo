"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { GAMES, GameConfig } from "@/config/games";
import { Badge } from "@/components/ui/Badge";
import { DemoUrlModal } from "./DemoUrlModal";
import { Edit, Play, CheckCircle2, XCircle, ExternalLink, ShieldCheck } from "lucide-react";

export function AdminGamesTable() {
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configuredMap, setConfiguredMap] = useState<Record<string, boolean>>({});

  const refreshConfigMap = () => {
    const map: Record<string, boolean> = {};
    GAMES.forEach(game => {
      const spykeStored = localStorage.getItem(`spyke_url_${game.id}`);
      const stored = spykeStored || localStorage.getItem(`spribe_demo_url_${game.id}`);
      const isConfigured = Boolean((stored && stored.trim() !== "") || (game.defaultDemoUrl && game.defaultDemoUrl.trim() !== ""));
      map[game.id] = isConfigured;
    });
    setConfiguredMap(map);
  };

  useEffect(() => {
    refreshConfigMap();
  }, []);

  const handleEdit = (game: GameConfig) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="rounded-2xl bg-[#0D0D15] border border-[#222232] overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#1E1E2C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black uppercase text-white tracking-wide">
              Initial Game Configuration
            </h3>
            <p className="text-xs text-[#8E8E9E] mt-0.5">
              Manage authorized Spribe demo endpoints and asset associations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8E8E9E] bg-[#141420] px-3 py-1 rounded-lg border border-[#252538]">
              5 Entries Registered
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="bg-[#09090F] text-[10px] font-mono uppercase text-[#707086] border-b border-[#1A1A26]">
                <th className="py-3 px-4 font-bold">Game</th>
                <th className="py-3 px-4 font-bold">Provider</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Asset Source</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171724]">
              {GAMES.map(game => {
                const isConfigured = configuredMap[game.id];
                return (
                  <tr key={game.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Game Name & Thumb */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 aspect-[250/90] rounded-lg overflow-hidden border border-[#252538] shrink-0 bg-black p-0.5">
                          <Image
                            src={game.image}
                            alt={game.name}
                            fill
                            className="object-contain object-center"
                          />
                        </div>
                        <div>
                          <span className="text-white font-bold block">{game.name}</span>
                          <span className="text-[10px] font-mono text-[#7E7E92]">ID: {game.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="py-3 px-4 text-[#A0A0B2] font-semibold">
                      {game.provider}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#171724] border border-[#252535] text-[10px] font-mono text-[#A0A0B5]">
                        {game.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isConfigured ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Configured</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/40 border border-red-500/40 text-red-400 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>Not Configured</span>
                        </div>
                      )}
                    </td>

                    {/* Asset */}
                    <td className="py-3 px-4 font-mono text-[10px] text-[#78788C]">
                      {game.image}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(game)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#161624] hover:bg-[#202032] border border-[#26263A] hover:border-red-500/50 text-white text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3 text-red-500" />
                          <span>Edit URL</span>
                        </button>

                        <Link
                          href={`/games/${game.id}`}
                          className="p-1.5 rounded-lg bg-[#161624] hover:bg-[#202032] border border-[#26263A] text-[#8E8E9E] hover:text-white transition-colors"
                          title="Preview Game Shell"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DemoUrlModal
        game={selectedGame}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={refreshConfigMap}
      />
    </>
  );
}
