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

  const isPlinko = id.toLowerCase() === "plinko";
  const launchUrl = (dbGame?.launch_url !== undefined && dbGame.launch_url.trim() !== "")
    ? dbGame.launch_url.trim()
    : (isPlinko ? "https://plinko-1-b1u5.onrender.com/embed" : (staticGame?.defaultDemoUrl || ""));
  const provider = isPlinko
    ? "BETADRiX"
    : (dbGame?.provider || staticGame?.provider || "BETADRiX");
  const name = dbGame?.name || staticGame?.name || id;

  return NextResponse.json({
    success: true,
    data: {
      id: staticGame?.id || id,
      name,
      provider,
      providerType: isPlinko ? "Internal Demo Game" : undefined,
      category: dbGame?.category || staticGame?.category,
      image: staticGame?.image || dbGame?.image_url,
      description: isPlinko ? "Physics-based Plinko demo with virtual credits." : staticGame?.description,
      badges: staticGame?.badges || [],
      rtp: isPlinko ? undefined : staticGame?.rtp,
      minBet: isPlinko ? undefined : staticGame?.minBet,
      maxBet: isPlinko ? undefined : staticGame?.maxBet,
      maxMultiplier: isPlinko ? undefined : staticGame?.maxMultiplier,
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

