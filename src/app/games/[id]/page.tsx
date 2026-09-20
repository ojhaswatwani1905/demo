import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GAMES, getGameById, GameConfig } from "@/config/games";
import { getGameConfigById } from "@/lib/db";
import { GameLaunchShell } from "@/components/games/GameLaunchShell";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return GAMES.map(game => ({
    id: game.id,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const staticGame = getGameById(id);
  const dbGame = await getGameConfigById(id);

  if (!staticGame && !dbGame) {
    return {
      title: "Game Not Found — BETADRiX",
    };
  }

  const name = dbGame?.name || staticGame?.name || id;
  const provider = (id.toLowerCase() === "plinko")
    ? "BETADRiX"
    : (dbGame?.provider || staticGame?.provider || "BETADRiX");

  return {
    title: `${name} Demo (${provider}) — BETADRiX`,
    description: `Play ${name} demo by ${provider}. Zero real-money risk, simulated test currency on BETADRiX.`,
  };
}

export default async function GamePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const staticGame = getGameById(id);
  const dbGame = await getGameConfigById(id);

  if (!staticGame && !dbGame) {
    notFound();
  }

  // Merge static metadata with persisted database configuration
  const mergedGame: GameConfig = {
    ...staticGame!,
    name: dbGame?.name || staticGame?.name || id,
    provider: dbGame?.provider || staticGame?.provider || "BETADRiX",
    category: (dbGame?.category as any) || staticGame?.category || "Originals",
    defaultDemoUrl: (dbGame?.launch_url !== undefined && dbGame.launch_url.trim() !== "")
      ? dbGame.launch_url.trim()
      : (staticGame?.defaultDemoUrl || ""),
    isActive: dbGame?.is_active !== undefined ? dbGame.is_active : (dbGame?.is_enabled !== undefined ? dbGame.is_enabled : true),
    isEnabled: dbGame?.is_enabled !== undefined ? dbGame.is_enabled : (dbGame?.is_active !== undefined ? dbGame.is_active : true),
    maintenanceMessage: dbGame?.maintenance_message,
  };

  // Explicitly ensure Plinko has no legacy Spribe metadata or fake RTP / multiplier
  if (id.toLowerCase() === "plinko") {
    mergedGame.name = dbGame?.name || "PLINKO";
    mergedGame.provider = (dbGame?.provider && dbGame.provider !== "Spribe") ? dbGame.provider : "BETADRiX";
    mergedGame.providerType = "Internal Demo Game";
    mergedGame.description = "Physics-based Plinko demo with virtual credits.";
    mergedGame.defaultDemoUrl = (dbGame?.launch_url && dbGame.launch_url.trim() !== "")
      ? dbGame.launch_url.trim()
      : "https://plinko-1-b1u5.onrender.com/embed";
    delete mergedGame.rtp;
    delete mergedGame.minBet;
    delete mergedGame.maxBet;
    delete mergedGame.maxMultiplier;
  }

  return <GameLaunchShell game={mergedGame} />;
}

