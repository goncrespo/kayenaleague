import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protección para rutas de usuario normal
  if ((pathname.startsWith("/profile") || pathname.startsWith("/dashboard")) && !token) {
    const signinUrl = new URL("/signin", req.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Protección para rutas de administración
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    try {
      const sessionToken = req.cookies.get("admin-session")?.value;

      if (!sessionToken) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      const payload = await verifyAdminSession(sessionToken);

      if (!payload) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    } catch (error) {
      console.error("Error en middleware de administración:", error);
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/admin/:path*"],
}; 