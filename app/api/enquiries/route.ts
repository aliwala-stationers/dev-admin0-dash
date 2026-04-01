import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Enquiry from "@/models/Enquiry"

export async function GET() {
  await connectDB()
  // Direct model usage - no function wrapper needed
  const enquiries = await Enquiry.find({}).sort({ createdAt: -1 })
  return NextResponse.json(enquiries)
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    // Standardized creation
    const record = await Enquiry.create(body)
    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    // Basic error handling consistent with the Newsletter pattern
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
