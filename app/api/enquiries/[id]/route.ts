import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Enquiry from "@/models/Enquiry"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB()
  const { id } = await params

  const record = await Enquiry.findById(id)

  if (!record) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
  }
  return NextResponse.json(record)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()

    // Using direct model reference
    const updated = await Enquiry.findByIdAndUpdate(id, body, { new: true })

    if (!updated) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB()
    const { id } = await params

    await Enquiry.findByIdAndDelete(id)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
