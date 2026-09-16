import { NextRequest, NextResponse } from "next/server";
import { getAdminAuditLogs, getBalanceAuditLogs } from "@/lib/db";
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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "balance" | "admin" | "all"
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const adminLogs = await getAdminAuditLogs(limit);
    const balanceLogs = await getBalanceAuditLogs(undefined, limit);

    return NextResponse.json({
      success: true,
      adminLogs,
      balanceLogs
    });
  } catch (err) {
    console.error("Admin audit logs GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load audit logs" }, { status: 500 });
  }
}
