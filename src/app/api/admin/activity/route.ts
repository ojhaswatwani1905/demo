import { NextRequest, NextResponse } from "next/server";
import { getAllDummyActivity } from "@/lib/db";
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
    const activity = await getAllDummyActivity(100);
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
