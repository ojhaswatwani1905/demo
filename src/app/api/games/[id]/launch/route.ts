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

  // Returns launch metadata without exposing secrets
  return NextResponse.json({
    success: true,
    data: {
      gameId: staticGame?.id || id,
      gameName: name,
      provider,
      providerType: isInternal ? "Internal Demo Game" : (staticGame?.providerType || undefined),
      mode: "demo",
      isConfigured: Boolean(launchUrl && launchUrl.trim().length > 0),
      demoUrl: launchUrl || null,
      isActive: dbGame?.is_active ?? true,
      isEnabled: dbGame?.is_enabled ?? (dbGame?.is_active ?? true),
      supportIframe: true,
      requiresAuthorizedUrl: true,
    },
    disclaimer: "Demo platform only. No real money betting or wagering."
  });
}

