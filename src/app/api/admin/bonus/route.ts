import { NextRequest, NextResponse } from "next/server";
import { getBonusSettings, updateBonusSettings, recordAdminAuditLog } from "@/lib/db";
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
    const settings = await getBonusSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("Admin bonus GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load bonus settings" }, { status: 500 });
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

  try {
    const body = await req.json();
    const prev = await getBonusSettings();
    const updated = await updateBonusSettings(body);

    await recordAdminAuditLog(
      auth.adminId || "admin",
      "ADMIN_BONUS_UPDATE",
      "bonus_settings",
      "1",
      prev,
      updated,
      "Admin updated bonus & faucet settings"
    );

    publishRealtimeEvent("BONUS_UPDATED", updated);

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("Admin bonus POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to update bonus settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
}
