import { NextRequest, NextResponse } from "next/server";
import { getDatabaseHealth, getSiteConfig } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";
import { GAMES } from "@/config/games";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const health = await getDatabaseHealth();
    const config = await getSiteConfig();

    // Count configured games from standard configuration
    const configuredGamesCount = GAMES.filter(g => g.defaultDemoUrl && g.defaultDemoUrl.trim() !== "").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: health.totalUsers,
        totalGames: GAMES.length,
        configuredGames: configuredGamesCount,
        dbEngine: health.engine,
        isDbConnected: health.isConnected,
        totalActivity: health.totalActivity,
        telegramConfigured: Boolean(config.telegram_url),
        whatsappConfigured: Boolean(config.whatsapp_url),
        siteName: config.site_name
      }
    });
  } catch (err) {
    console.error("Admin stats GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load admin metrics" },
      { status: 500 }
    );
  }
}
