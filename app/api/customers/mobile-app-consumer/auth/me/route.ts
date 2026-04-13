// @/app/api/customers/mobile-app-consumer/auth/me/route.ts

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Customer from "@/models/Customer"
import {
  verifyCustomer,
  type CustomerJWTPayload,
} from "@/lib/customers/auth/verifyCustomer"
import { AuthError } from "@/lib/auth/errors"

/**
 * 🧾 Customer shape (lean doc)
 */
type CustomerDoc = {
  _id: any
  name?: string
  email?: string
  phone: string
  status: string
  avatar?: string
  addresses?: any[]
  createdAt: Date
}

/**
 * @summary Serialize customer for API response
 */
function serializeCustomer(customer: CustomerDoc) {
  return {
    id: customer._id.toString(),
    name: customer.name || "Customer",
    email: customer.email || "",
    phone: customer.phone,
    status: customer.status,
    avatar: customer.avatar || "",
    addresses: customer.addresses ?? [],
    createdAt: customer.createdAt,
  }
}

/**
 * @summary Get current customer profile
 */
export async function GET(req: Request) {
  try {
    /**
     * 🔐 Step 1: Verify JWT
     */
    const payload = (await verifyCustomer(req)) as CustomerJWTPayload

    if (!payload.sub) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 },
      )
    }

    /**
     * Step 2: DB
     */
    await connectDB()

    /**
     * Step 3: Fetch
     */
    const customer = await Customer.findById(payload.sub)
      .select("name email phone status avatar addresses createdAt")
      .lean<CustomerDoc>()

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    /**
     * Step 4: Response
     */
    return NextResponse.json({
      success: true,
      customer: serializeCustomer(customer),
    })
  } catch (error: unknown) {
    console.error("Customer Me Error:", error)

    /**
     * 🔥 Structured error handling
     */
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
