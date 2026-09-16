import { NextResponse } from "next/server";
import { getPromotions } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const promotions = await getPromotions(true);
    return NextResponse.json({ success: true, promotions });
  } catch (err) {
    console.error("Public promotions GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch promotions" }, { status: 500 });
  }
}
