import { NextRequest, NextResponse } from "next/server";
import { getAllDummyActivity, resetDummyActivity, recordAdminAuditLog } from "@/lib/db";
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
    const { searchParams } = new URL(req.url);
    const gameFilter = searchParams.get("game");
    const userFilter = searchParams.get("user");
    const minPayout = searchParams.get("minPayout") ? parseFloat(searchParams.get("minPayout")!) : null;

    let activity = await getAllDummyActivity(200);

    if (gameFilter && gameFilter !== "all") {
      activity = activity.filter(a => a.game.toLowerCase() === gameFilter.toLowerCase());
    }

    if (userFilter && userFilter.trim() !== "") {
      const q = userFilter.toLowerCase().trim();
      activity = activity.filter(a => a.username.toLowerCase().includes(q));
    }

    if (minPayout !== null && !isNaN(minPayout)) {
      activity = activity.filter(a => a.payout_amount >= minPayout);
    }

    return NextResponse.json({
      success: true,
      activity
    });
  } catch (err) {
    console.error("Admin activity GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load activity logs" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    await resetDummyActivity();

    await recordAdminAuditLog(
      auth.adminId || "admin",
      "ADMIN_ACTIVITY_RESET",
      "dummy_activity",
      "all",
      null,
      null,
      "Admin reset simulated activity ledger"
    );

    publishRealtimeEvent("ACTIVITY_UPDATED", { action: "reset" });

    return NextResponse.json({
      success: true,
      message: "Simulated activity ledger successfully refreshed with fresh realistic data."
    });
  } catch (err) {
    console.error("Admin activity DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to reset activity logs" }, { status: 500 });
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
