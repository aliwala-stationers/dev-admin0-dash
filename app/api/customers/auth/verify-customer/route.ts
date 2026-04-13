// @/app/api/auth/verify-customer/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Customer from "@/models/Customer"
import { SignJWT } from "jose"
import admin from "@/lib/firebase-admin"

// 🔐 ENV VALIDATION
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const JWT_SECRET = process.env.JWT_SECRET

/**
 * @function POST
 * @summary Verify or create customer after Firebase OTP
 * @description
 * - Verifies Firebase ID token
 * - Extracts phone securely
 * - Finds or creates customer
 * - Returns app JWT
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    const { firebaseToken, name } = body

    /**
     * 🔥 Step 1: Validate Firebase token presence
     */
    if (!firebaseToken || typeof firebaseToken !== "string") {
      return NextResponse.json(
        { error: "Firebase token is required" },
        { status: 400 },
      )
    }

    /**
     * 🔐 Step 2: Verify Firebase token (CRITICAL)
     */
    const decoded = await admin.auth().verifyIdToken(firebaseToken)

    const phone = decoded.phone_number

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number not found in token" },
        { status: 400 },
      )
    }

    const normalizedPhone = phone.replace(/\s+/g, "")

    /**
     * Step 3: Find existing customer
     */
    let customer = await Customer.findOne({ phone: normalizedPhone })

    let isNewUser = false

    /**
     * Step 4: Create if new
     */
    if (!customer) {
      isNewUser = true

      customer = await Customer.create({
        phone: normalizedPhone,
        name: name ? String(name).trim() : "Customer",
        status: "active",
      })
    }

    /**
     * 🔐 Step 5: Generate YOUR app JWT
     */
    const secret = new TextEncoder().encode(JWT_SECRET)

    const token = await new SignJWT({
      sub: customer._id.toString(),
      phone: customer.phone,
      role: "customer",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setIssuer("mobile")
      .setAudience("customer-app")
      .sign(secret)

    /**
     * Step 6: Response
     */
    return NextResponse.json({
      success: true,
      isNewUser,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        status: customer.status,
      },
      token,
    })
  } catch (error: any) {
    console.error("Verify Customer Error:", error)

    /**
     * 🔥 Handle Firebase errors cleanly
     */
    if (
      error.code === "auth/argument-error" ||
      error.code === "auth/id-token-expired"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired Firebase token" },
        { status: 401 },
      )
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    )
  }
}
