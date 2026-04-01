import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose" // You need to read the token first
import connectDB from "@/lib/db"
import LoginHistory from "@/models/LoginHistory"

const COOKIE_NAME = "aliwala_admin_token"
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET!

export async function POST(req: Request) {
  const cookieStore = cookies()
  const token = (await cookieStore).get(COOKIE_NAME)?.value
  console.log("token", token)
  // 1. If we have a token, log the logout event
  if (token) {
    try {
      // We perform a "Silent Verification" just to get the ID
      const secret = new TextEncoder().encode(ADMIN_JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      const userId = payload.sub

      if (userId) {
        await connectDB()

        const userAgent = req.headers.get("user-agent") || "unknown"
        const ip = req.headers.get("x-forwarded-for") || "unknown"

        await LoginHistory.create({
          userId,
          event: "LOGOUT",
          ipAddress: ip,
          device: userAgent,
        })
      }
    } catch (e) {
      // If token is invalid, we just ignore the log and proceed to clear cookie
      console.error("Logout Log Error", e)
    }
  }

  // 2. Nuke the cookie (Existing logic)
  ;(await cookieStore).delete(COOKIE_NAME)

  return NextResponse.json({ success: true })
}
