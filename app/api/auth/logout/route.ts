// @/app/api/admin/logout/route.ts

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import connectDB from "@/lib/db"
import LoginHistory from "@/models/LoginHistory"
import { ADMIN_JWT_SECRET, AUTH_COOKIES, AUTH_META } from "@/lib/auth/constants"
import { logServerError } from "@/lib/server/errorlogs"

/**
 * @function POST
 * @summary Admin logout endpoint
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    /**
     * Step 1: Read cookie
     */
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIES.ADMIN)?.value

    /**
     * Step 2: Non-blocking logout logging
     */
    if (token?.trim()) {
      void (async () => {
        try {
          const { payload } = await jwtVerify(
            token.trim(),
            ADMIN_JWT_SECRET,
            AUTH_META.ADMIN,
          )

          if (!payload.sub) return

          await connectDB()

          const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            req.headers.get("x-real-ip") ||
            "unknown"

          const userAgent = req.headers.get("user-agent") || "unknown"

          await LoginHistory.create({
            userId: payload.sub,
            event: "LOGOUT",
            ipAddress: ip,
            device: userAgent,
          })
        } catch (err) {
          console.error("Logout logging failed:", err)
        }
      })()
    }

    /**
     * Step 3: Always clear cookie
     */
    const response = NextResponse.json({ success: true })

    response.cookies.set({
      name: AUTH_COOKIES.ADMIN,
      value: "",
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    })

    return response
  } catch (error: unknown) {
    console.error("Logout Error:", error)

    /**
     * Logout must NEVER fail
     * Log error non-blocking
     */
    void (async () => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown logout error"
      await logServerError({
        errorType: "server",
        errorMessage,
        endpoint: "/api/auth/logout",
        method: "POST",
        stackTrace: error instanceof Error ? error.stack : undefined,
      })
    })()

    return NextResponse.json({ success: true })
  }
}
