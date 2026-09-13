import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GAMES, getGameById } from "@/config/games";
import { GameLaunchShell } from "@/components/games/GameLaunchShell";

export async function generateStaticParams() {
  return GAMES.map(game => ({
    id: game.id,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const game = getGameById(id);

  if (!game) {
    return {
      title: "Game Not Found — YOURBRAND",
    };
  }

  return {
    title: `${game.name} Demo (Spribe) — YOURBRAND`,
    description: `Play ${game.name} demo by Spribe. Zero real-money risk, simulated test currency on YOURBRAND.`,
  };
}

export default async function GamePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const game = getGameById(id);

  if (!game) {
    notFound();
  }

  return <GameLaunchShell game={game} />;
}
