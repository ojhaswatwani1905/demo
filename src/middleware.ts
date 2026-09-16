import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin/* sub-routes (excluding the /admin login portal itself)
  if (pathname.startsWith("/admin/") && pathname !== "/admin") {
    const sessionCookie = req.cookies.get("betadrix_admin_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.redirect(new URL("/admin", req.url), 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
