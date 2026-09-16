import { NextRequest, NextResponse } from "next/server";
import { getVipTiers, createVipTier, updateVipTier, deleteVipTier, recordAdminAuditLog } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";
import { publishRealtimeEvent } from "@/lib/realtime";

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
    const tiers = await getVipTiers(false);
    return NextResponse.json({ success: true, tiers });
  } catch (err) {
    console.error("Admin VIP GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load VIP tiers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "VIP Tier name is required" }, { status: 400 });
    }

    const created = await createVipTier({
      name: body.name.trim(),
      badge: body.badge || body.name.toUpperCase(),
      min_activity: Number(body.min_activity || 0),
      demo_bonus: Number(body.demo_bonus || 0),
      benefits: Array.isArray(body.benefits) ? body.benefits : [],
      display_order: Number(body.display_order || 0),
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true
    });

    await recordAdminAuditLog(
      auth.adminId || "admin",
      "ADMIN_VIP_CREATE",
      "vip_tiers",
      String(created.id),
      null,
      created,
      `Admin created VIP tier: ${created.name}`
    );

    publishRealtimeEvent("VIP_UPDATED", { action: "create", tier: created });

    return NextResponse.json({ success: true, tier: created });
  } catch (err) {
    console.error("Admin VIP POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to create VIP tier" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!id) {
      return NextResponse.json({ success: false, error: "VIP tier ID is required" }, { status: 400 });
    }

    const updated = await updateVipTier(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "VIP tier not found" }, { status: 404 });
    }

    await recordAdminAuditLog(
      auth.adminId || "admin",
      "ADMIN_VIP_UPDATE",
      "vip_tiers",
      String(id),
      null,
      updated,
      `Admin updated VIP tier ID ${id}`
    );

    publishRealtimeEvent("VIP_UPDATED", { action: "update", tier: updated });

    return NextResponse.json({ success: true, tier: updated });
  } catch (err) {
    console.error("Admin VIP PUT error:", err);
    return NextResponse.json({ success: false, error: "Failed to update VIP tier" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return PUT(req);
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ success: false, error: "VIP tier ID is required" }, { status: 400 });
    }

    const success = await deleteVipTier(id);

    await recordAdminAuditLog(
      auth.adminId || "admin",
      "ADMIN_VIP_DELETE",
      "vip_tiers",
      String(id),
      null,
      null,
      `Admin deleted VIP tier ID ${id}`
    );

    publishRealtimeEvent("VIP_UPDATED", { action: "delete", id });

    return NextResponse.json({ success });
  } catch (err) {
    console.error("Admin VIP DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete VIP tier" }, { status: 500 });
  }
}
