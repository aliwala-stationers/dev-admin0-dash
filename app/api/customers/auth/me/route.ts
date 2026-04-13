// @/app/api/customer/auth/me/route.ts

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Customer from "@/models/Customer"
import { verifyCustomer } from "@/lib/customers/auth/verifyCustomer"
import { AuthError } from "@/lib/customers/auth/errors"

/**
 * @summary Serialize customer for API response
 */
function serializeCustomer(customer: any) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    avatar: customer.avatar || "",
    addresses: customer.addresses || [],
    createdAt: customer.createdAt,
  }
}

/**
 * @summary Get current customer profile
 */
export async function GET(req: Request) {
  try {
    /**
     * 🔐 Step 1: Verify customer JWT
     */
    const payload = await verifyCustomer(req)
    const customerId = payload.sub

    if (!customerId) {
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
    const customer = await Customer.findById(customerId)
      .select("name email phone status avatar addresses createdAt")
      .lean()

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
  } catch (error: any) {
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
