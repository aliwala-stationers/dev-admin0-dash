// @/app/api/customers/auth/verify-customer/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Customer from "@/models/Customer"
import { SignJWT } from "jose"
import admin from "@/lib/customers/firebase-admin"
import { JWT_SECRET } from "@/lib/customers/auth/constants"
import { AUTH_ERRORS, AuthError } from "@/lib/customers/auth/errors"
// import { rateLimit } from "@/lib/rate-limit" // optional

/**
 * @summary Verify or create customer after Firebase OTP
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firebaseToken, name } = body

    /**
     * Step 1: Validate input
     */
    if (!firebaseToken || typeof firebaseToken !== "string") {
      return NextResponse.json(
        { error: "Firebase token is required" },
        { status: 400 },
      )
    }

    /**
     * (Optional) Step 1.5: Rate limit
     */
    // const ip =
    //   req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
    // rateLimit(ip)

    /**
     * Step 2: Verify Firebase token
     */
    let decoded
    try {
      decoded = await admin.auth().verifyIdToken(firebaseToken)
    } catch {
      throw AUTH_ERRORS.INVALID_TOKEN()
    }

    const phone = decoded.phone_number

    if (!phone) {
      return NextResponse.json(
        { error: "Phone not found in token" },
        { status: 400 },
      )
    }

    /**
     * Step 3: Normalize phone
     */
    const normalizedPhone = phone.replace(/[^\d+]/g, "")

    /**
     * Step 4: Safe name
     */
    const safeName =
      typeof name === "string" && name.trim() ? name.trim() : "Customer"

    /**
     * Step 5: DB connection
     */
    await connectDB()

    /**
     * Step 6: Find existing
     */
    let customerDoc = await Customer.findOne({ phone: normalizedPhone })
    let isNewUser = false

    /**
     * Step 7: Create if not exists (race-safe)
     */
    if (!customerDoc) {
      isNewUser = true

      try {
        customerDoc = await Customer.create({
          phone: normalizedPhone,
          name: safeName,
          status: "active",
        })
      } catch (err: any) {
        if (err.code === 11000) {
          customerDoc = await Customer.findOne({ phone: normalizedPhone })
          isNewUser = false
        } else {
          throw err
        }
      }
    }

    /**
     * Step 8: Safety check
     */
    if (!customerDoc) {
      return NextResponse.json(
        { error: "Customer creation failed" },
        { status: 500 },
      )
    }

    /**
     * Step 9: Generate JWT
     */
    const token = await new SignJWT({
      sub: customerDoc._id.toString(),
      phone: customerDoc.phone,
      role: "customer",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setIssuer("mobile")
      .setAudience("customer-app")
      .sign(JWT_SECRET)

    /**
     * Step 10: Response
     */
    return NextResponse.json({
      success: true,
      isNewUser,
      customer: {
        id: customerDoc._id,
        name: customerDoc.name || "Customer",
        phone: customerDoc.phone,
        status: customerDoc.status,
      },
      token,
    })
  } catch (error: any) {
    console.error("Verify Customer Error:", error)

    /**
     * 🔥 Structured auth errors
     */
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    /**
     * 🔥 Fallback
     */
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
