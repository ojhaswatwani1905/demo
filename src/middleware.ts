import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/dashboard routes: Redirect unauthenticated requests to /admin
  if (pathname === "/admin/dashboard" || pathname.startsWith("/admin/dashboard/")) {
    const sessionCookie = req.cookies.get("betadrix_admin_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard", "/admin/dashboard/:path*"],
};
