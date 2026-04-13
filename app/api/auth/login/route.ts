// @/app/api/admin/login/route.ts

import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db"
import User from "@/models/User"
import LoginHistory from "@/models/LoginHistory"

/**
 * @constant JWT_SECRET
 * @description Secret used for signing admin JWT tokens.
 * Must be defined in environment variables.
 */
if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error("ADMIN_JWT_SECRET is not defined")
}

const JWT_SECRET = process.env.ADMIN_JWT_SECRET

/**
 * @constant COOKIE_NAME
 * @description Name of the HTTP-only cookie storing admin session token.
 */
const COOKIE_NAME = "__admin_token"

/**
 * @constant COOKIE_MAX_AGE
 * @description Cookie lifespan in seconds (8 hours).
 */
const COOKIE_MAX_AGE = 60 * 60 * 8

/**
 * @function POST
 * @summary Admin login endpoint
 * @description
 * Authenticates an admin user using email and password.
 * If valid:
 *  - Generates a signed JWT (admin scope)
 *  - Stores it in an HttpOnly cookie
 *  - Logs login event
 *
 * Security:
 *  - Prevents credential enumeration
 *  - Uses bcrypt for password validation
 *  - Enforces admin role
 *  - Uses HttpOnly + Secure cookies
 *
 * @param {Request} req - Incoming HTTP request containing JSON body
 *
 * @returns {Promise<NextResponse>} JSON response with user info or error
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    /**
     * Step 1: Parse and validate input
     */
    const body = await req.json().catch(() => ({}))
    const { email, password } = body

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { ok: false, message: "Invalid input format" },
        { status: 400 },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    /**
     * Step 2: Connect to database
     */
    await connectDB()

    /**
     * Step 3: Fetch user (including password)
     */
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    )

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 401 },
      )
    }

    /**
     * Step 4: Validate password
     */
    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 401 },
      )
    }

    /**
     * Step 5: Enforce admin role
     */
    if (user.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Access denied" },
        { status: 403 },
      )
    }

    /**
     * Step 6: Generate JWT token
     */
    const secret = new TextEncoder().encode(JWT_SECRET)

    const token = await new SignJWT({
      sub: user._id.toString(),
      email: user.email,
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .setIssuer("admin")
      .setAudience("admin-panel")
      .sign(secret)

    /**
     * Step 7: Log login event (non-blocking)
     */
    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"

      const userAgent = req.headers.get("user-agent") || "unknown"

      await LoginHistory.create({
        userId: user._id,
        event: "LOGIN_SUCCESS",
        ipAddress: ip,
        device: userAgent,
      })
    } catch (logError) {
      console.error("Login logging failed:", logError)
    }

    /**
     * Step 8: Prepare response payload
     */
    const userPayload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl || "",
    }

    const response = NextResponse.json({
      ok: true,
      user: userPayload,
    })

    /**
     * Step 9: Set secure HttpOnly cookie
     */
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
    })

    return response
  } catch (error) {
    console.error("Admin Login Error:", error)

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    )
  }
}
