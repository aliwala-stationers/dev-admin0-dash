// @/app/api/enquiries/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Enquiry from "@/models/Enquiry"
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
 * 📦 Serialize enquiry
 */
function serializeEnquiry(doc: any) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone || "",
    message: doc.message,
    status: doc.status || "new",
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
      return NextResponse.json({ error: "Invalid enquiry ID" }, { status: 400 })
    }

    await connectDB()

    const enquiry = await Enquiry.findById(id).lean()

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      enquiry: serializeEnquiry(enquiry),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch enquiry" },
      { status: 500 },
    )
  }
}

/**
 * ✏️ UPDATE (admin)
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin(req)

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid enquiry ID" }, { status: 400 })
    }

    await connectDB()

    const body = await req.json()

    /**
     * 🔐 Restrict updates (important)
     */
    const updateData: any = {}

    // Only allow status updates (safe pattern)
    if (typeof body.status === "string") {
      const allowed = ["new", "in-progress", "resolved"]

      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 },
        )
      }

      updateData.status = body.status
    }

    const updated = await Enquiry.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updated) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      enquiry: serializeEnquiry(updated),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to update enquiry" },
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
      return NextResponse.json({ error: "Invalid enquiry ID" }, { status: 400 })
    }

    await connectDB()

    const deleted = await Enquiry.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry deleted",
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to delete enquiry" },
      { status: 500 },
    )
  }
}
