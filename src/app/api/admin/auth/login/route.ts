import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findAdminByAdminId } from "@/lib/db";
import { signAdminToken, buildAdminCookie } from "@/lib/adminSession";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminId, password } = body;

    if (!adminId || !password || typeof adminId !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide both Admin ID and Password." },
        { status: 400 }
      );
    }

    const admin = await findAdminByAdminId(adminId);
    if (!admin) {
      // Intentionally generic error message to prevent account enumeration
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // Generate signed session token
    const token = signAdminToken(admin.admin_id);

    const res = NextResponse.json(
      {
        success: true,
        adminId: admin.admin_id,
        message: "Administrator authenticated successfully."
      },
      { status: 200 }
    );

    res.cookies.set({
      name: "betadrix_admin_session",
      value: token,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60
    });

    return res;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { success: false, error: "Authentication system encountered an error." },
      { status: 500 }
    );
  }
}
