import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminSession";

export async function GET(req: Request) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated || !auth.adminId) {
    return NextResponse.json(
      { authenticated: false, error: auth.error || "Unauthenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    adminId: auth.adminId
  });
}
