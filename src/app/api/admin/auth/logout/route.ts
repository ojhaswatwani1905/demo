import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/adminSession";

export async function POST() {
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
