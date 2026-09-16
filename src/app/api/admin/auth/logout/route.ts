import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, authenticateAdmin } from "@/lib/adminSession";
import { revokeAdminSession } from "@/lib/db";

export async function POST(req: Request) {
  // 1. Invalidate session in database so the token can never be reused
  const auth = await authenticateAdmin(req);
  if (auth.authenticated && auth.adminId) {
    await revokeAdminSession(auth.adminId);
  }

  // 2. Clear session cookie in response
  const res = NextResponse.json(
    { success: true, message: "Administrator logged out successfully." },
    { status: 200 }
  );

  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0)
  });

  return res;
}
