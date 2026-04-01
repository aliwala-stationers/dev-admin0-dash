import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Newsletter from "@/models/NewsLetter"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB()
  const { id } = await params
  const subscriber = await Newsletter.findById(id)
  if (!subscriber) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 })
  }
  return NextResponse.json(subscriber)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const subscriber = await Newsletter.findByIdAndUpdate(id, body, {
      new: true,
    })
    if (!subscriber) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 },
      )
    }
    return NextResponse.json(subscriber)
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
    await Newsletter.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
