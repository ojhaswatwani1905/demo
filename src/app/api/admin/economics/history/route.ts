import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminSession";
import { getEconomicsConfigHistory } from "@/lib/economics";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/economics/history
 * Retrieves configuration version history for economics.
 * Requires authenticated administrator session.
 */
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
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200) : 50;

    const history = await getEconomicsConfigHistory(limit);
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Admin economics history GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve economics history." },
      { status: 500 }
    );
  }
}
