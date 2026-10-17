import { NextResponse, type NextRequest } from "next/server";
import { HOME_BY_ROLE, SESSION_COOKIE } from "@/lib/constants";
import { verifyToken } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // /portal is the admin's preview of a vendor's portal, so it needs the admin role
  const portal = pathname.startsWith("/admin") || pathname.startsWith("/portal") ? "ADMIN" : "VENDOR";
  if (session.role !== portal) {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[session.role], req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/portal/:path*"],
};
