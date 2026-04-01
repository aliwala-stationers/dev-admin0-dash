import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Newsletter from "@/models/NewsLetter"

export async function GET() {
  await connectDB()
  const subscribers = await Newsletter.find({}).sort({ createdAt: -1 })
  return NextResponse.json(subscribers)
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const subscriber = await Newsletter.create(body)
    return NextResponse.json(subscriber, { status: 201 })
  } catch (error: any) {
    const message =
      error?.code === 11000 ? "Email already subscribed" : error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
