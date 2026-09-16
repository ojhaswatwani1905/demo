import { NextResponse } from "next/server";
import { getBonusSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getBonusSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("Public bonus GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch bonus settings" }, { status: 500 });
  }
}
