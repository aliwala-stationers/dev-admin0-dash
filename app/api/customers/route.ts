// @/app/api/customers/route.ts

import { NextResponse, NextRequest } from "next/server"
import { jwtVerify } from "jose"
import connectDB from "@/lib/db"
import Customer from "@/models/Customer"

// 🔐 ENV VALIDATION
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const JWT_SECRET = process.env.JWT_SECRET

/**
 * 🔐 Verify admin token
 */
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null

  if (!token) throw new Error("UNAUTHORIZED")

  const secret = new TextEncoder().encode(JWT_SECRET)

  const { payload } = await jwtVerify(token, secret, {
    issuer: "admin",
    audience: "admin-panel",
  })

  if (!payload || payload.role !== "admin") {
    throw new Error("FORBIDDEN")
  }

  return payload
}

export async function POST(req: NextRequest) {
  try {
    await verifyToken(req)

    await connectDB()

    const body = await req.json()

    /**
     * ✅ FIX: email is optional
     */
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Missing required fields: name and phone" },
        { status: 400 },
      )
    }

    // Email validation (only if provided)
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        )
      }
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      )
    }

    /**
     * ✅ Sanitization
     */
    const customerData = {
      name: String(body.name).trim(),
      email: body.email ? String(body.email).toLowerCase().trim() : undefined,
      phone: String(body.phone).trim(),
      status: body.status === "inactive" ? "inactive" : "active",
      totalSpent: 0,
      orders: 0,
      addresses: Array.isArray(body.addresses)
        ? body.addresses.map((addr: any) => ({
            type: ["shipping", "billing", "delivery"].includes(addr?.type)
              ? addr.type
              : "shipping",
            street: String(addr?.street || "").trim(),
            city: String(addr?.city || "").trim(),
            state: String(addr?.state || "").trim(),
            zipCode: String(addr?.zipCode || "").trim(),
            country: String(addr?.country || "").trim(),
            isDefault: Boolean(addr?.isDefault),
          }))
        : [],
    }

    /**
     * ✅ Atomic create
     */
    let customer
    try {
      customer = await Customer.create(customerData)
    } catch (err: any) {
      if (err.code === 11000) {
        return NextResponse.json(
          { error: "Customer already exists with this phone" },
          { status: 409 },
        )
      }
      throw err
    }

    return NextResponse.json(
      {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        createdAt: customer.createdAt,
      },
      { status: 201 },
    )
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await verifyToken(req)

    await connectDB()

    /**
     * ✅ FIX: limit guard
     */
    const limit = Math.min(
      Number(req.nextUrl.searchParams.get("limit")) || 20,
      100,
    )

    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const skip = (page - 1) * limit

    const [customers, total] = await Promise.all([
      Customer.find({}, "name email phone status createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(),
    ])

    return NextResponse.json({
      success: true,
      data: customers.map((c) => ({
        id: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
        createdAt: c.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    )
  }
}
