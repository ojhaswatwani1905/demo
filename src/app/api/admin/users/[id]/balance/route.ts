import { NextRequest, NextResponse } from "next/server";
import { adjustUserDemoBalance, recordAdminAuditLog } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";
import { publishRealtimeEvent } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function POST(
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
    const { amount, actionType, reason } = body;

    if (!actionType || !["add", "remove", "reset"].includes(actionType)) {
      return NextResponse.json(
        { success: false, error: "Invalid action type. Must be 'add', 'remove', or 'reset'." },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount || 0);
    if (actionType !== "reset" && (isNaN(numAmount) || numAmount <= 0)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid positive adjustment amount." },
        { status: 400 }
      );
    }

    const cleanReason = (reason || "Admin virtual balance adjustment").trim();

    // Perform atomic transaction in PostgreSQL / fallback
    const result = await adjustUserDemoBalance(
      userId,
      auth.adminId || "admin",
      numAmount,
      actionType as "add" | "remove" | "reset",
      cleanReason
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to adjust user balance." },
        { status: 400 }
      );
    }

    // Record administrative action audit entry
    await recordAdminAuditLog(
      auth.adminId || "admin",
      actionType === "add" ? "ADMIN_BALANCE_ADD" : actionType === "remove" ? "ADMIN_BALANCE_REMOVE" : "ADMIN_BALANCE_RESET",
      "users",
      String(userId),
      { balance: result.previousBalance },
      { balance: result.newBalance },
      cleanReason
    );

    // Broadcast instant real-time event so connected client updates without reload!
    publishRealtimeEvent("USER_BALANCE_UPDATED", {
      userId,
      user_id: userId,
      previousBalance: result.previousBalance,
      previous_balance: result.previousBalance,
      old_balance: result.previousBalance,
      newBalance: result.newBalance,
      new_balance: result.newBalance,
      amount: result.adjustmentAmount,
      adjustmentAmount: result.adjustmentAmount,
      action: result.actionType,
      actionType: result.actionType,
      reason: cleanReason,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Virtual balance successfully updated to $${result.newBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      new_balance: result.newBalance,
      previous_balance: result.previousBalance,
      data: result
    });
  } catch (err: any) {
    console.error("Admin balance adjustment error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error adjusting balance" },
      { status: 500 }
    );
  }
}
