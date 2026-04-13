// @/app/api/admin/me/route.ts

import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { ADMIN_JWT_SECRET, AUTH_COOKIES, AUTH_META } from "@/lib/auth/constants"

/**
 * @function GET
 * @summary Get current authenticated admin user
 */
export async function GET(): Promise<NextResponse> {
  try {
    /**
     * Step 1: Read cookie
     */
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIES.ADMIN)?.value

    if (!token?.trim()) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    /**
     * Step 2: Verify JWT (centralized config)
     */
    const { payload } = await jwtVerify(
      token.trim(),
      ADMIN_JWT_SECRET,
      AUTH_META.ADMIN,
    )

    /**
     * Step 3: Validate payload
     */
    const userId = payload.sub

    if (!userId || payload.role !== "admin") {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    /**
     * Step 4: Fetch user (lean for perf)
     */
    await connectDB()

    const user = await User.findById(userId)
      .select("name email role avatarUrl")
      .lean()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    /**
     * Step 5: Final role enforcement (defense-in-depth)
     */
    if (user.role !== "admin") {
      return NextResponse.json({ user: null }, { status: 403 })
    }

    /**
     * Step 6: Response
     */
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    })
  } catch {
    /**
     * Any failure = unauthenticated
     */
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
