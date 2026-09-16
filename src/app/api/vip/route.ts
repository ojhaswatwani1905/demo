import { NextResponse } from "next/server";
import { getVipTiers } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tiers = await getVipTiers(true);
    return NextResponse.json({ success: true, tiers });
  } catch (err) {
    console.error("Public VIP GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch VIP tiers" }, { status: 500 });
  }
}
