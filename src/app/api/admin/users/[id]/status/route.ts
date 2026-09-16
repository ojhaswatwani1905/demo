import { NextRequest, NextResponse } from "next/server";
import { toggleUserStatus, recordAdminAuditLog } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";
import { publishRealtimeEvent } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    const { isActive } = body;
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ success: false, error: "isActive boolean required" }, { status: 400 });
    }

    const success = await toggleUserStatus(userId, isActive);
    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to update user status" }, { status: 400 });
    }

    await recordAdminAuditLog(
      auth.adminId || "admin",
      isActive ? "ADMIN_USER_ENABLE" : "ADMIN_USER_DISABLE",
      "users",
      String(userId),
      { is_active: !isActive },
      { is_active: isActive },
      `Admin toggled account status to ${isActive ? "Active" : "Disabled"}`
    );

    publishRealtimeEvent("USER_STATUS_UPDATED", {
      userId,
      isActive,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, isActive });
  } catch (err) {
    console.error("Admin user status PATCH error:", err);
    return NextResponse.json({ success: false, error: "Failed to update user status" }, { status: 500 });
  }
}
