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
    const users = await getAllUsers(100);
    // Add active status for demonstration
    const sanitized = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      created_at: u.created_at,
      status: "Active"
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
  return NextResponse.json({ success: false, error: "Not implemented" }, { status: 501 });
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

