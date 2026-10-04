import { NextRequest, NextResponse } from "next/server";
import { getRecentActivity, addDummyActivity } from "@/lib/db";
import { publishRealtimeEvent } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activity = await getRecentActivity(20);
    return NextResponse.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live activity" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, game, payout_amount, multiplier, bet_amount, user_id, balance } = body;

    const cleanUsername = typeof username === "string" && username.trim() !== ""
      ? username.trim().slice(0, 50)
      : "Demo Player";

    const cleanGame = typeof game === "string" && game.trim() !== ""
      ? game.trim().slice(0, 30)
      : "Demo Game";

    const cleanPayout = typeof payout_amount === "number" && !isNaN(payout_amount) && payout_amount >= 0
      ? Number(payout_amount.toFixed(2))
      : 0;

    const cleanMultiplier = typeof multiplier === "number" && !isNaN(multiplier) && multiplier >= 0
      ? Number(multiplier.toFixed(2))
      : 0;

    const cleanBet = typeof bet_amount === "number" && !isNaN(bet_amount) && bet_amount >= 0
      ? Number(bet_amount.toFixed(2))
      : (cleanMultiplier > 0 ? Number((cleanPayout / cleanMultiplier).toFixed(2)) : cleanPayout);

    // 1. Persist to authoritative database / fallback store
    const persisted = await addDummyActivity({
      username: cleanUsername,
      game: cleanGame,
      payout_amount: cleanPayout,
      multiplier: cleanMultiplier
    });

    const fullRecord = {
      ...persisted,
      bet_amount: cleanBet,
      payout_amount: cleanPayout,
      multiplier: cleanMultiplier,
      user_id: typeof user_id === "number" ? user_id : 1
    };

    // 2. Broadcast live activity event (NO refresh required for Admin Activity, Admin Dashboard, or user ticker)
    publishRealtimeEvent("ACTIVITY_RECORDED", fullRecord);
    publishRealtimeEvent("ACTIVITY_UPDATED", { action: "new_activity", record: fullRecord });

    // 3. If balance updated from authoritative gameplay settlement, broadcast balance update
    if (typeof balance === "number" && !isNaN(balance)) {
      const numericBalance = Number(balance.toFixed(2));
      publishRealtimeEvent("USER_BALANCE_UPDATED", {
        userId: typeof user_id === "number" ? user_id : 1,
        user_id: typeof user_id === "number" ? user_id : 1,
        newBalance: numericBalance,
        new_balance: numericBalance,
        amount: cleanPayout > 0 ? cleanPayout : cleanBet,
        action: cleanPayout > 0 ? "win" : "bet",
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      activity: fullRecord
    }, { status: 201 });
  } catch (err: any) {
    console.error("Activity POST error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to record activity" },
      { status: 500 }
    );
  }
}
