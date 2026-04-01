// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose" // Ensure 'jose' is installed

const COOKIE_NAME = "aliwala_admin_token" // <--- MUST MATCH LOGIN API
const PUBLIC_PATHS = ["/admin/login"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Bypass logic
  if (!pathname.startsWith("/admin") || PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // 2. Token Check
  const token = req.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    // Redirect to login
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  // 3. Verify Token (Edge Compatible)
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
    await jwtVerify(token, secret)
    return NextResponse.next() // Gate Open
  } catch (err) {
    // Token invalid/expired -> Redirect
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"
    const res = NextResponse.redirect(url)
    res.cookies.delete(COOKIE_NAME)
    return res
  }
}

export const config = {
  matcher: ["/admin/:path*"],
}
