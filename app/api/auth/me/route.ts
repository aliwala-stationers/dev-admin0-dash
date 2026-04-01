import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import connectDB from "@/lib/db"
import User from "@/models/User"

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!
const COOKIE_NAME = "aliwala_admin_token"

export async function GET() {
  const cookieStore = cookies()
  const token = (await cookieStore).get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    await connectDB()

    // Fetch fresh data (in case role changed/user deleted)
    const user = await User.findById(payload.sub).select("-password")

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
