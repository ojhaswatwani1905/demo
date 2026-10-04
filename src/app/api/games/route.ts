import { NextResponse } from "next/server";
import { GAMES } from "@/config/games";
import { getGameConfigs } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbGames = await getGameConfigs();
  const dbMap = new Map(dbGames.map(g => [g.game_id.toLowerCase(), g]));

  const games = GAMES.map(staticGame => {
    const dbGame = dbMap.get(staticGame.id.toLowerCase());
    const isInternal = staticGame.id.toLowerCase() === "plinko" || staticGame.id.toLowerCase() === "trader";
    const launchUrl = (dbGame?.launch_url !== undefined && dbGame.launch_url.trim() !== "")
      ? dbGame.launch_url.trim()
      : staticGame.defaultDemoUrl;
    const provider = (isInternal || staticGame.id.toLowerCase() === "roulette")
      ? "BETADRiX"
      : (dbGame?.provider || staticGame.provider);

    return {
      id: staticGame.id,
      name: dbGame?.name || staticGame.name,
      provider,
      providerType: isInternal ? "Internal Demo Game" : (staticGame.providerType || undefined),
      category: dbGame?.category || staticGame.category,
      image: staticGame.image,
      badges: staticGame.badges,
      rtp: staticGame.rtp,
      mode: "demo",
      launchUrl: launchUrl || null,
      demoUrlConfigured: Boolean(launchUrl && launchUrl.trim().length > 0),
      isActive: dbGame?.is_active ?? true,
      isEnabled: dbGame?.is_enabled ?? (dbGame?.is_active ?? true),
    };
  });

  return NextResponse.json({
    success: true,
    data: games,
    platformNotice: "DEMO MODE ONLY — NO REAL MONEY BETTING OR PAYMENTS"
  });
}

