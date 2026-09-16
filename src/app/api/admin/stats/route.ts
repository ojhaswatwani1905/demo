import { NextRequest, NextResponse } from "next/server";
import { getDetailedSystemStats, getSiteConfig } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";

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
    const system = await getDetailedSystemStats();
    const config = await getSiteConfig();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: system.totalUsers,
        activeUsers: system.activeUsers,
        totalGames: 4,
        configuredGames: system.configuredGames,
        totalAllocatedDemoBalance: system.totalAllocatedDemoBalance,
        totalSimulatedPayouts: system.totalSimulatedPayouts,
        dbEngine: system.engine,
        isDbConnected: system.isDbConnected,
        totalActivity: system.totalActivityRecords,
        telegramConfigured: Boolean(config.telegram_url),
        whatsappConfigured: Boolean(config.whatsapp_url),
        siteName: config.site_name,
        lastSuccessfulDbOp: system.lastSuccessfulDbOp
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

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }
  return NextResponse.json({ success: false, error: "Not allowed" }, { status: 405 });
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  return POST(req);
}
