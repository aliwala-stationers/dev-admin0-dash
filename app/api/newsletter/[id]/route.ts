// @/app/api/newsletter/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Newsletter from "@/models/NewsLetter"
import mongoose from "mongoose"
import { jwtVerify } from "jose"
import { ADMIN_JWT_SECRET, AUTH_META } from "@/lib/auth/constants"
import { AUTH_ERRORS, AuthError } from "@/lib/auth/errors"

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * 🔐 Verify admin
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
 * 🔍 Validate ObjectId
 */
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

/**
 * 📦 Serialize
 */
function serializeSubscriber(doc: any) {
  return {
    id: doc._id.toString(),
    email: doc.email,
    createdAt: doc.createdAt,
  }
}

/**
 * 📄 GET (admin)
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin(req)

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid subscriber ID" },
        { status: 400 },
      )
    }

    await connectDB()

    const subscriber = await Newsletter.findById(id).lean()

    if (!subscriber) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      subscriber: serializeSubscriber(subscriber),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch subscriber" },
      { status: 500 },
    )
  }
}

/**
 * ✏️ UPDATE (admin)
 * ⚠️ Minimal use case (e.g., mark inactive later)
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin(req)

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid subscriber ID" },
        { status: 400 },
      )
    }

    await connectDB()

    const body = await req.json()

    /**
     * 🔐 Restrict update fields
     */
    const updateData: any = {}

    if (typeof body.email === "string") {
      const email = body.email.toLowerCase().trim()

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        )
      }

      updateData.email = email
    }

    const updated = await Newsletter.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updated) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      subscriber: serializeSubscriber(updated),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to update subscriber" },
      { status: 500 },
    )
  }
}

/**
 * ❌ DELETE (admin)
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin(req)

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid subscriber ID" },
        { status: 400 },
      )
    }

    await connectDB()

    const deleted = await Newsletter.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Subscriber deleted",
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to delete subscriber" },
      { status: 500 },
    )
  }
}
