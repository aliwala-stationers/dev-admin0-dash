import { NextResponse, NextRequest } from "next/server"
import { jwtVerify } from "jose"
import connectDB from "@/lib/db"
import Customer from "@/models/Customer"

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables")
}

/**
 * Verify JWT token and return payload
 * Throws error if token is invalid or missing
 */
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null

  if (!token) {
    throw new Error("UNAUTHORIZED")
  }

  const secret = new TextEncoder().encode(JWT_SECRET)
  const { payload } = await jwtVerify(token, secret)

  return payload
}

export async function POST(req: NextRequest) {
  try {
    // Verify token and check for admin role
    const payload = await verifyToken(req)

    // Role-based access control: only admins can create customers
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      )
    }

    // Database Connection
    await connectDB()

    // Parse Request Body
    const body = await req.json()

    // Validation
    const requiredFields = ["email", "name", "phone"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        )
      }
    }

    // Optional: Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      )
    }

    // Optional: Validate phone format (basic, adjust as needed)
    const phoneRegex = /^\+?[\d\s-]{10,}$/
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      )
    }

    // Input Sanitization and Whitelisting
    const customerData = {
      name: String(body.name).trim(),
      email: body.email ? String(body.email).toLowerCase().trim() : undefined,
      phone: String(body.phone).trim(),
      status: body.status === "inactive" ? "inactive" : "active", // Only allow active/inactive
      totalSpent: 0, // Backend-controlled, ignore client input
      orders: 0, // Backend-controlled, ignore client input
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

    // Create Customer - rely on MongoDB unique index for atomicity
    try {
      const customer = await Customer.create(customerData)
      // Return controlled response to avoid leaking internal fields
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
    } catch (dbError: any) {
      // Handle MongoDB duplicate key error (code 11000)
      if (dbError.code === 11000) {
        return NextResponse.json(
          { error: "Customer already exists with this email" },
          { status: 409 }, // Conflict is more appropriate for duplicate resource
        )
      }
      throw dbError // Re-throw for general error handling
    }
  } catch (error: any) {
    console.error("Add Customer Error:", error)
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify token and check for admin role
    const payload = await verifyToken(req)

    // Role-based access control: only admins can list customers
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      )
    }

    // Database Connection
    await connectDB()

    // Pagination
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 20
    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const skip = (page - 1) * limit

    // Fetch customers with pagination and projection (performance optimization)
    const [customers, total] = await Promise.all([
      Customer.find({}, "name email phone status createdAt") // Projection to fetch only needed fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(), // For total count
    ])

    // Return controlled response to avoid leaking internal fields
    const customerData = customers.map((customer) => ({
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      createdAt: customer.createdAt,
    }))

    return NextResponse.json(
      {
        success: true,
        data: customerData,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Get Customers Error:", error)
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
