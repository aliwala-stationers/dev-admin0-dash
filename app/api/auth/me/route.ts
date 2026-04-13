// @/app/api/admin/me/route.ts

import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import connectDB from "@/lib/db"
import User from "@/models/User"

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
 * @function GET
 * @summary Get current authenticated admin user
 * @description
 * Validates admin session from HttpOnly cookie and returns fresh user data.
 *
 * Flow:
 *  - Read JWT from cookie
 *  - Verify token (issuer + audience)
 *  - Fetch user from DB
 *  - Return sanitized user object
 *
 * Security:
 *  - Rejects invalid/expired tokens
 *  - Enforces admin role
 *  - Avoids leaking sensitive fields
 *
 * @returns {Promise<NextResponse>} Authenticated user or null
 */
export async function GET(): Promise<NextResponse> {
  try {
    /**
     * Step 1: Read cookie
     */
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    /**
     * Step 2: Verify JWT
     */
    const secret = new TextEncoder().encode(ADMIN_JWT_SECRET)

    const { payload } = await jwtVerify(token, secret, {
      issuer: "admin",
      audience: "admin-panel",
    })

    /**
     * Step 3: Validate payload
     */
    const userId = payload.sub

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    /**
     * Step 4: Fetch fresh user data
     */
    await connectDB()

    const user = await User.findById(userId).select("name email role avatarUrl")

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    /**
     * Step 5: Enforce admin role (CRITICAL)
     */
    if (user.role !== "admin") {
      return NextResponse.json({ user: null }, { status: 403 })
    }

    /**
     * Step 6: Return sanitized response
     */
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    })
  } catch (error) {
    /**
     * Any failure = unauthenticated
     */
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
