import { NextRequest, NextResponse } from "next/server";
import { getGameConfigs, updateGameConfig, recordAdminAuditLog } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";
import { publishRealtimeEvent } from "@/lib/realtime";

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
    const games = await getGameConfigs();
    return NextResponse.json({ success: true, games });
  } catch (err) {
    console.error("Admin games GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load game configurations" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const gameId = body.gameId || body.game_id;
    const { gameId: _gid, game_id: _g_id, ...updates } = body;
    if (!gameId) {
      return NextResponse.json({ success: false, error: "Game ID is required" }, { status: 400 });
    }

    const updated = await updateGameConfig(gameId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Game configuration not found" }, { status: 404 });
    }

    await recordAdminAuditLog(
      auth.adminId || "admin",
      "ADMIN_GAME_UPDATE",
      "game_configs",
      gameId,
      null,
      updated,
      `Admin updated game configuration for ${gameId}`
    );

    publishRealtimeEvent("GAME_CONFIG_UPDATED", updated);

    return NextResponse.json({ success: true, game: updated });
  } catch (err) {
    console.error("Admin games PUT error:", err);
    return NextResponse.json({ success: false, error: "Failed to update game configuration" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return PUT(req);
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }
  return NextResponse.json({ success: false, error: "Game creation restricted. Only authorized Spyke games are supported." }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }
  return NextResponse.json({ success: false, error: "Authorized game removal not allowed" }, { status: 405 });
}
