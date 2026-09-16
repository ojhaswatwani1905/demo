import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";

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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();

    let users = await getAllUsers(200);

    if (search) {
      users = users.filter(
        u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search) || String(u.id).includes(search)
      );
    }

    // Sanitize: ensure password hashes are NEVER returned in response
    const sanitized = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      balance: Number(u.balance || 1250),
      is_active: u.is_active !== undefined ? u.is_active : true,
      created_at: u.created_at,
      last_activity: u.last_activity || u.created_at,
      status: u.is_active ? "Active" : "Disabled"
    }));

    return NextResponse.json({
      success: true,
      users: sanitized
    });
  } catch (err) {
    console.error("Admin users GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load users" },
      { status: 500 }
    );
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
  return NextResponse.json({ success: false, error: "Direct user creation through admin is restricted. Use standard registration." }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  return POST(req);
}
