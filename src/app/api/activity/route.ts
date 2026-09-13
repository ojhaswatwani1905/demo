import { NextResponse } from "next/server";
import { INITIAL_DEMO_ACTIVITY } from "@/data/mockActivity";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_DEMO_ACTIVITY,
    timestamp: new Date().toISOString(),
    isDemo: true,
    notice: "Sample activity stream for demonstration purposes only"
  });
}
