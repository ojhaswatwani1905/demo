import { NextRequest, NextResponse } from "next/server";
import { getGameById } from "@/config/games";
import { getGameConfigById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const staticGame = getGameById(id);
  const dbGame = await getGameConfigById(id);

  if (!staticGame && !dbGame) {
    return NextResponse.json(
      { success: false, error: "Game not found in demo catalog" },
      { status: 404 }
    );
  }

  const isInternal = id.toLowerCase() === "plinko" || id.toLowerCase() === "trader";
  const launchUrl = (dbGame?.launch_url !== undefined && dbGame.launch_url.trim() !== "")
    ? dbGame.launch_url.trim()
    : (staticGame?.defaultDemoUrl || "");
  const provider = (isInternal || id.toLowerCase() === "roulette")
    ? "BETADRiX"
    : (dbGame?.provider || staticGame?.provider || "BETADRiX");
  const name = dbGame?.name || staticGame?.name || id;

  return NextResponse.json({
    success: true,
    data: {
      id: staticGame?.id || id,
      name,
      provider,
      providerType: isInternal ? "Internal Demo Game" : (staticGame?.providerType || undefined),
      category: dbGame?.category || staticGame?.category,
      image: staticGame?.image || dbGame?.image_url,
      description: staticGame?.description,
      badges: staticGame?.badges || [],
      rtp: staticGame?.rtp,
      minBet: staticGame?.minBet,
      maxBet: staticGame?.maxBet,
      maxMultiplier: staticGame?.maxMultiplier,
      mode: "demo",
      launchUrl: launchUrl || null,
      demoUrlConfigured: Boolean(launchUrl && launchUrl.trim().length > 0),
      isActive: dbGame?.is_active ?? true,
      isEnabled: dbGame?.is_enabled ?? (dbGame?.is_active ?? true),
      maintenanceMessage: dbGame?.maintenance_message || null,
    },
    platformNotice: "DEMO MODE ONLY — NO REAL MONEY TRANSACTIONS"
  });
}

