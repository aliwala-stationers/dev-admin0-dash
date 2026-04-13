import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import connectDB from "@/lib/db"
import Customer from "@/models/Customer"

const DUMMY_JWT_SECRET = "iernierubvsueyvbeukervbkuerv293823n23"

export async function POST(req: Request) {
  try {
    // Authentication Check
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const secret = new TextEncoder().encode(DUMMY_JWT_SECRET)
      await jwtVerify(token, secret)
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      )
    }

    // Database Connection
    await connectDB()

    // Parse Request Body
    const body = await req.json()

    // Validation
    if (!body.email || !body.name || !body.phone) {
      return NextResponse.json(
        {
          error: "Missing required fields: email, name, and phone are required",
        },
        { status: 400 },
      )
    }

    // Check for existing customer
    const existingCustomer = await Customer.findOne({ email: body.email })
    if (existingCustomer) {
      return NextResponse.json(
        { error: "A customer with this email already exists" },
        { status: 400 },
      )
    }

    // Create Customer
    const customer = await Customer.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      status: body.status || "active",
      totalSpent: body.totalSpent || 0,
      orders: body.orders || 0,
      addresses: body.addresses || [],
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error("Add Customer Error:", error)
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    await connectDB()
    const customers = await Customer.find({}).sort({ createdAt: -1 })
    return NextResponse.json(customers)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
