// @/app/api/customers/route.ts

import { NextResponse, NextRequest } from "next/server"
import { jwtVerify } from "jose"
import connectDB from "@/lib/db"
import Customer from "@/models/Customer"
import { AuthError, AUTH_ERRORS } from "@/lib/customers/auth/errors"

/**
 * 🔐 ENV
 */
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

/**
 * 🔐 Verify admin JWT
 */
async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader) throw AUTH_ERRORS.UNAUTHORIZED()

  const [scheme, token] = authHeader.split(" ")

  if (scheme !== "Bearer" || !token) {
    throw AUTH_ERRORS.UNAUTHORIZED()
  }

  const { payload } = await jwtVerify(token, SECRET, {
    issuer: "admin",
    audience: "admin-panel",
  })

  if (payload.role !== "admin") {
    throw AUTH_ERRORS.FORBIDDEN()
  }

  return payload
}

/**
 * 📦 Serialize customer (reuse later)
 */
function serializeCustomer(customer: any) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    createdAt: customer.createdAt,
  }
}

/**
 * ➕ Create customer (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req)

    const body = await req.json()

    /**
     * Step 1: Validate
     */
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 },
      )
    }

    /**
     * Step 2: Normalize
     */
    const name = String(body.name).trim()
    const phone = String(body.phone).replace(/[^\d+]/g, "")
    const email = body.email
      ? String(body.email).toLowerCase().trim()
      : undefined

    /**
     * Step 3: Validate formats
     */
    if (!/^\+?\d{10,15}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone format" },
        { status: 400 },
      )
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      )
    }

    /**
     * Step 4: Payload (your style ✔)
     */
    const customerData = {
      name,
      email,
      phone,
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
     * Step 5: DB
     */
    await connectDB()

    /**
     * Step 6: Create
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

    /**
     * Step 7: Response
     */
    return NextResponse.json(serializeCustomer(customer), { status: 201 })
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

/**
 * 📄 List customers (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req)

    /**
     * Pagination
     */
    const limit = Math.min(
      Number(req.nextUrl.searchParams.get("limit")) || 20,
      100,
    )

    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const skip = (page - 1) * limit

    /**
     * DB
     */
    await connectDB()

    /**
     * Fetch
     */
    const [customers, total] = await Promise.all([
      Customer.find({}, "name email phone status createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(),
    ])

    /**
     * Response
     */
    return NextResponse.json({
      success: true,
      data: customers.map(serializeCustomer),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
