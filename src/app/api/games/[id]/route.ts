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

  return NextResponse.json({
    success: true,
    data: {
      id: game.id,
      name: game.name,
      provider: game.provider,
      category: game.category,
      image: game.image,
      description: game.description,
      badges: game.badges,
      rtp: game.rtp,
      minBet: game.minBet,
      maxBet: game.maxBet,
      maxMultiplier: game.maxMultiplier,
      mode: "demo",
      demoUrlConfigured: Boolean(game.defaultDemoUrl && game.defaultDemoUrl.length > 0),
    },
    platformNotice: "DEMO MODE ONLY — NO REAL MONEY TRANSACTIONS"
  });
}
