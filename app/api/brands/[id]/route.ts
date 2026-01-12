import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Brand from "@/models/Brand";

// Helper to grab ID from params
// Next.js 15+ params are async, but for route handlers the second arg is context
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const brand = await Brand.findById(params.id);
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  return NextResponse.json(brand);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const brand = await Brand.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json(brand);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  await Brand.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}