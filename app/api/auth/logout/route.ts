// @/app/api/admin/logout/route.ts

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import connectDB from "@/lib/db"
import LoginHistory from "@/models/LoginHistory"

/**
 * @constant ADMIN_JWT_SECRET
 * @description Secret used to verify admin JWT tokens.
 */
if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error("ADMIN_JWT_SECRET is not defined")
}

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET

/**
 * @constant COOKIE_NAME
 * @description Name of the cookie storing admin session token.
 */
const COOKIE_NAME = "__admin_token"

/**
 * @function POST
 * @summary Admin logout endpoint
 * @description
 * Logs out an admin user by:
 *  - Verifying existing JWT (if present)
 *  - Logging logout event (non-blocking)
 *  - Clearing HttpOnly cookie
 *
 * Security:
 *  - Never fails logout even if token/logging fails
 *  - Verifies JWT issuer & audience
 *  - Prevents token misuse
 *
 * @param {Request} req - Incoming HTTP request
 *
 * @returns {Promise<NextResponse>} Always returns success response
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    /**
     * Step 1: Read cookie
     */
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    /**
     * Step 2: Attempt logout logging (non-blocking)
     */
    if (token) {
      try {
        const secret = new TextEncoder().encode(ADMIN_JWT_SECRET)

        const { payload } = await jwtVerify(token, secret, {
          issuer: "admin",
          audience: "admin-panel",
        })

        const userId = payload.sub

        if (userId) {
          await connectDB()

          const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            req.headers.get("x-real-ip") ||
            "unknown"

          const userAgent = req.headers.get("user-agent") || "unknown"

          await LoginHistory.create({
            userId,
            event: "LOGOUT",
            ipAddress: ip,
            device: userAgent,
          })
        }
      } catch (logError) {
        /**
         * Important:
         * Logout must never fail due to logging or token issues.
         */
        console.error("Logout logging failed:", logError)
      }
    }

    /**
     * Step 3: Clear cookie (always)
     */
    const response = NextResponse.json({ success: true })

    response.cookies.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "strict", // 🔥 stricter than lax (admin panel)
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // immediate expiration
    })

    return response
  } catch (error) {
    console.error("Logout Error:", error)

    /**
     * Even if something breaks,
     * logout should still succeed from client perspective.
     */
    return NextResponse.json({ success: true })
  }
}
