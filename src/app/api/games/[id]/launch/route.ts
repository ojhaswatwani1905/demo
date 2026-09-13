import { NextRequest, NextResponse } from "next/server";
import { getGameById } from "@/config/games";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const game = getGameById(id);

  if (!game) {
    return NextResponse.json(
      { success: false, error: "Game not found in demo catalog" },
      { status: 404 }
    );
  }

  // Returns launch metadata without exposing secrets
  return NextResponse.json({
    success: true,
    data: {
      gameId: game.id,
      gameName: game.name,
      provider: game.provider,
      mode: "demo",
      isConfigured: Boolean(game.defaultDemoUrl && game.defaultDemoUrl.trim().length > 0),
      // Only returns demoUrl if explicitly configured via environment variable
      demoUrl: game.defaultDemoUrl || null,
      supportIframe: true,
      requiresAuthorizedUrl: true,
    },
    disclaimer: "Demo platform only. No real money betting or wagering."
  });
}
