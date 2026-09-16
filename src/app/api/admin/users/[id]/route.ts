import { NextRequest, NextResponse } from "next/server";
import { getUserDetail } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export async function GET(
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

    const detail = await getUserDetail(userId);
    if (!detail) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: detail });
  } catch (err) {
    console.error("Admin user detail GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch user details" }, { status: 500 });
  }
}
