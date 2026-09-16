import { NextRequest, NextResponse } from "next/server";
import { getPromotions, createPromotion, updatePromotion, deletePromotion, recordAdminAuditLog } from "@/lib/db";
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
    const promotions = await getPromotions(false);
    return NextResponse.json({ success: true, promotions });
  } catch (err) {
    console.error("Admin promotions GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load promotions" }, { status: 500 });
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
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ success: false, error: "Promotion title is required" }, { status: 400 });
    }

    const created = await createPromotion({
      title: body.title.trim(),
      short_desc: body.short_desc || "",
      long_desc: body.long_desc || "",
      banner_image: body.banner_image || "/assets/ui/promotions_hero.jpg",
      cta_text: body.cta_text || "EXPLORE",
      start_date: body.start_date || undefined,
      end_date: body.end_date || undefined,
      display_order: Number(body.display_order || 0),
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true
    });

    await recordAdminAuditLog(
      auth.adminId || "admin",
      "ADMIN_PROMOTION_CREATE",
      "promotions",
      String(created.id),
      null,
      created,
      `Admin created promotion: ${created.title}`
    );

    publishRealtimeEvent("PROMOTION_UPDATED", { action: "create", promotion: created });

    return NextResponse.json({ success: true, promotion: created });
  } catch (err) {
    console.error("Admin promotions POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to create promotion" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Promotion ID is required" }, { status: 400 });
    }

    const updated = await updatePromotion(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Promotion not found" }, { status: 404 });
    }

    await recordAdminAuditLog(
      auth.adminId || "admin",
      "ADMIN_PROMOTION_UPDATE",
      "promotions",
      String(id),
      null,
      updated,
      `Admin updated promotion ID ${id}`
    );

    publishRealtimeEvent("PROMOTION_UPDATED", { action: "update", promotion: updated });

    return NextResponse.json({ success: true, promotion: updated });
  } catch (err) {
    console.error("Admin promotions PUT error:", err);
    return NextResponse.json({ success: false, error: "Failed to update promotion" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Promotion ID is required" }, { status: 400 });
    }

    const success = await deletePromotion(id);

    await recordAdminAuditLog(
      auth.adminId || "admin",
      "ADMIN_PROMOTION_DELETE",
      "promotions",
      String(id),
      null,
      null,
      `Admin deleted promotion ID ${id}`
    );

    publishRealtimeEvent("PROMOTION_UPDATED", { action: "delete", id });

    return NextResponse.json({ success });
  } catch (err) {
    console.error("Admin promotions DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete promotion" }, { status: 500 });
  }
}
