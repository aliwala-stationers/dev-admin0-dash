// @/app/api/admin/login/route.ts

import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db"
import User from "@/models/User"
import LoginHistory from "@/models/LoginHistory"
import { ADMIN_JWT_SECRET, AUTH_COOKIES, AUTH_META } from "@/lib/auth/constants"

/**
 * @constant COOKIE_MAX_AGE
 * @description 8 hours session
 */
const COOKIE_MAX_AGE = 60 * 60 * 8

/**
 * @function POST
 * @summary Admin login endpoint
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    /**
     * Step 1: Parse input safely
     */
    const body = await req.json().catch(() => null)

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, message: "Invalid request body" },
        { status: 400 },
      )
    }

    const { email, password } = body

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 400 },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    /**
     * Step 2: DB
     */
    await connectDB()

    /**
     * Step 3: Fetch user
     */
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    )

    /**
     * 🔒 Prevent user enumeration
     */
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 401 },
      )
    }

    /**
     * Step 4: Password check
     */
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 401 },
      )
    }

    /**
     * Step 5: Admin enforcement
     */
    if (user.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Access denied" },
        { status: 403 },
      )
    }

    /**
     * Step 6: Generate JWT (centralized config)
     */
    const token = await new SignJWT({
      sub: user._id.toString(),
      email: user.email,
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .setIssuer(AUTH_META.ADMIN.issuer)
      .setAudience(AUTH_META.ADMIN.audience)
      .sign(ADMIN_JWT_SECRET)

    /**
     * Step 7: Async logging (non-blocking)
     */
    void (async () => {
      try {
        const ip =
          req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          req.headers.get("x-real-ip") ||
          "unknown"

        const userAgent = req.headers.get("user-agent") || "unknown"

        await LoginHistory.create({
          userId: user._id,
          event: "LOGIN",
          ipAddress: ip,
          device: userAgent,
        })
      } catch (err) {
        console.error("LoginHistory error:", err)
      }
    })()

    /**
     * Step 8: Response payload
     */
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    })

    /**
     * Step 9: Cookie (centralized name)
     */
    response.cookies.set({
      name: AUTH_COOKIES.ADMIN,
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
