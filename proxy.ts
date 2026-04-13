// proxy.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { ADMIN_JWT_SECRET, AUTH_COOKIES, AUTH_META } from "@/lib/auth/constants"

const PUBLIC_PATHS = ["/admin/login"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  /**
   * ⚡ Skip static assets & API
   */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next()
  }

  /**
   * 🔓 Non-admin routes
   */
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  /**
   * 🔓 Public admin routes
   */
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  if (isPublic) {
    return NextResponse.next()
  }

  /**
   * 🔐 Get token
   */
  const token = req.cookies.get(AUTH_COOKIES.ADMIN)?.value

  /**
   * 🔁 Helper: redirect to login
   */
  const redirectToLogin = () => {
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  if (!token?.trim()) {
    return redirectToLogin()
  }

  /**
   * 🔐 Verify token
   */
  try {
    await jwtVerify(token.trim(), ADMIN_JWT_SECRET, {
      issuer: AUTH_META.ADMIN.issuer,
      audience: AUTH_META.ADMIN.audience,
    })

    return NextResponse.next()
  } catch (err: any) {
    const res = redirectToLogin()

    /**
     * 🔥 Clean cookie if invalid
     */
    res.cookies.delete(AUTH_COOKIES.ADMIN)

    return res
  }
}

export const config = {
  matcher: ["/admin/:path*"],
}
