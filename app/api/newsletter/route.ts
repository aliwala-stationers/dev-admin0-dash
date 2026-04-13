// @/app/api/newsletter/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Newsletter from "@/models/NewsLetter"
import { jwtVerify } from "jose"
import { ADMIN_JWT_SECRET, AUTH_META } from "@/lib/auth/constants"
import { AUTH_ERRORS, AuthError } from "@/lib/auth/errors"

/**
 * 🔐 Verify admin (for GET)
 */
async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader) throw AUTH_ERRORS.UNAUTHORIZED()

  const [scheme, token] = authHeader.split(" ")

  if (scheme !== "Bearer" || !token?.trim()) {
    throw AUTH_ERRORS.UNAUTHORIZED()
  }

  const { payload } = await jwtVerify(token.trim(), ADMIN_JWT_SECRET, {
    issuer: AUTH_META.ADMIN.issuer,
    audience: AUTH_META.ADMIN.audience,
  })

  if (payload.role !== "admin") {
    throw AUTH_ERRORS.FORBIDDEN()
  }

  return payload
}

/**
 * 📦 Serialize subscriber
 */
function serializeSubscriber(doc: any) {
  return {
    id: doc._id.toString(),
    email: doc.email,
    createdAt: doc.createdAt,
  }
}

/**
 * 📄 GET subscribers (ADMIN ONLY)
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req)
    await connectDB()

    const subscribers = await Newsletter.find({}).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: subscribers.map(serializeSubscriber),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 },
    )
  }
}

/**
 * ➕ POST subscribe (PUBLIC)
 */
export async function POST(req: Request) {
  try {
    await connectDB()

    const body = await req.json()
    const { email } = body

    /**
     * 🔐 Validate email
     */
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      )
    }

    /**
     * ➕ Create (idempotent UX)
     */
    try {
      const created = await Newsletter.create({
        email: normalizedEmail,
      })

      return NextResponse.json(
        {
          success: true,
          subscriber: serializeSubscriber(created.toObject()),
        },
        { status: 201 },
      )
    } catch (err: any) {
      /**
       * 🔁 Duplicate email = success (UX pattern)
       */
      if (err.code === 11000) {
        return NextResponse.json({
          success: true,
          message: "Already subscribed",
        })
      }

      throw err
    }
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
