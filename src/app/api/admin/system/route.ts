import { NextRequest, NextResponse } from "next/server";
import { getDetailedSystemStats } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";
import { getRealtimeConnectionCount } from "@/lib/realtime";

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
    const stats = await getDetailedSystemStats();
    const activeSSE = getRealtimeConnectionCount();

    // Zero secret leakage: only operational metrics
    return NextResponse.json({
      success: true,
      system: {
        databaseEngine: stats.engine,
        isDatabaseConnected: stats.isDbConnected,
        realtimeActiveConnections: activeSSE,
        realtimeStatus: activeSSE > 0 ? "Connected / Broadcasting" : "Idle / Listening",
        environment: stats.environment,
        systemVersion: stats.systemVersion,
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        totalAllocatedDemoBalance: stats.totalAllocatedDemoBalance,
        totalSimulatedPayouts: stats.totalSimulatedPayouts,
        totalActivityRecords: stats.totalActivityRecords,
        configuredGames: stats.configuredGames,
        supportChannelsConfigured: stats.supportChannelsConfigured,
        lastSuccessfulDbOperation: stats.lastSuccessfulDbOp,
        serverTime: new Date().toISOString(),
        nodeVersion: process.version
      }
    });
  } catch (err) {
    console.error("Admin system stats GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load system metrics" }, { status: 500 });
  }
}
