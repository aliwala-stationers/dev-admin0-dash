// proxy.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// 🔐 ENV VALIDATION
if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error("ADMIN_JWT_SECRET is not defined")
}

const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
const COOKIE_NAME = "__admin_token"

const PUBLIC_PATHS = ["/admin/login"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  /**
   * ⚡ Skip static assets
   */
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next()
  }

  /**
   * 🔓 Allow non-admin routes
   */
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  /**
   * 🔓 Allow public admin routes
   */
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  if (isPublic) {
    return NextResponse.next()
  }

  /**
   * 🔐 Check token
   */
  const token = req.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  /**
   * 🔐 Verify token
   */
  try {
    await jwtVerify(token, SECRET, {
      issuer: "admin",
      audience: "admin-panel",
    })

    return NextResponse.next()
  } catch {
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"

    const res = NextResponse.redirect(url)
    res.cookies.delete(COOKIE_NAME)

    return res
  }
}

/**
 * 🎯 Apply only to admin routes
 */
export const config = {
  matcher: ["/admin/:path*"],
}
