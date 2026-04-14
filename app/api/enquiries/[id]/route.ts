// @/app/api/enquiries/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Enquiry from "@/models/Enquiry"
import mongoose from "mongoose"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { logServerError } from "@/lib/server/errorlogs"

type RouteContext = {
  params: Promise<{ id: string }>
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
  const { id } = await params

  try {
    await verifyAdmin()

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
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/enquiries/${id}`,
        method: "GET",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch enquiry"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/enquiries/${id}`,
      method: "GET",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ✏️ UPDATE (admin)
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    await verifyAdmin()

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
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/enquiries/${id}`,
        method: "PUT",
        requestData: await req.json().catch(() => ({})),
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to update enquiry"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/enquiries/${id}`,
      method: "PUT",
      requestData: await req.json().catch(() => ({})),
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ❌ DELETE (admin)
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    await verifyAdmin()

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
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/enquiries/${id}`,
        method: "DELETE",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete enquiry"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/enquiries/${id}`,
      method: "DELETE",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
