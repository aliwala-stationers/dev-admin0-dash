// @/app/api/enquiries/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Enquiry from "@/models/Enquiry"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { logServerError } from "@/lib/server/errorlogs"

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
 * 📄 GET enquiries (ADMIN ONLY)
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin()
    await connectDB()

    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: enquiries.map(serializeEnquiry),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: "/api/enquiries",
        method: "GET",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch enquiries"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: "/api/enquiries",
      method: "GET",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ➕ POST enquiry (PUBLIC)
 */
export async function POST(req: Request) {
  try {
    await connectDB()

    const body = await req.json()
    const { name, email, phone, message } = body

    /**
     * 🔐 Validation
     */
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 },
      )
    }

    const normalizedName = String(name).trim()
    const normalizedEmail = String(email).toLowerCase().trim()
    const normalizedMessage = String(message).trim()
    const normalizedPhone = phone ? String(phone).trim() : ""

    /**
     * Email validation
     */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      )
    }

    /**
     * Basic message length control (anti-spam)
     */
    if (normalizedMessage.length < 5 || normalizedMessage.length > 2000) {
      return NextResponse.json(
        { error: "Message length invalid" },
        { status: 400 },
      )
    }

    /**
     * ➕ Create
     */
    const created = await Enquiry.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      message: normalizedMessage,
      status: "new",
    })

    return NextResponse.json(
      {
        success: true,
        enquiry: serializeEnquiry(created.toObject()),
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit enquiry"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: "/api/enquiries",
      method: "POST",
      requestData: await (req as Request).json().catch(() => ({})),
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
