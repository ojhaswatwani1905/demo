import { NextResponse } from "next/server";
import { GAMES } from "@/config/games";

export async function GET() {
  const games = GAMES.map(game => ({
    id: game.id,
    name: game.name,
    provider: game.provider,
    category: game.category,
    image: game.image,
    badges: game.badges,
    rtp: game.rtp,
    mode: "demo",
    demoUrlConfigured: Boolean(game.defaultDemoUrl && game.defaultDemoUrl.length > 0)
  }));

  return NextResponse.json({
    success: true,
    data: games,
    platformNotice: "DEMO MODE ONLY — NO REAL MONEY BETTING OR PAYMENTS"
  });
}
