// @/app/api/auth/profile/route.ts

import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { ADMIN_JWT_SECRET, AUTH_COOKIES, AUTH_META } from "@/lib/auth/constants"
import { logServerError } from "@/lib/server/errorlogs"

/**
 * @function PATCH
 * @summary Update current admin user profile
 */
export async function PATCH(req: NextRequest) {
  try {
    /**
     * Step 1: Read cookie and verify JWT
     */
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIES.ADMIN)?.value

    if (!token?.trim()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { payload } = await jwtVerify(
      token.trim(),
      ADMIN_JWT_SECRET,
      AUTH_META.ADMIN,
    )

    const userId = payload.sub

    if (!userId || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /**
     * Step 2: Parse request body
     */
    const body = await req.json()
    const { name, avatarUrl } = body

    /**
     * Step 3: Validate input
     */
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (avatarUrl && typeof avatarUrl !== "string") {
      return NextResponse.json({ error: "Invalid avatar URL" }, { status: 400 })
    }

    /**
     * Step 4: Update user in database
     */
    await connectDB()

    const updateData: any = { name: name.trim() }
    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .select("name email role avatarUrl")
      .lean()

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    /**
     * Step 5: Return updated user data
     */
    return NextResponse.json({
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl || "",
      },
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update profile"

    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: "/api/auth/profile",
      method: "PATCH",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
