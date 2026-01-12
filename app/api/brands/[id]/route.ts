import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Brand from "@/models/Brand";

// 1. Define the Context Type correctly (params is a Promise)
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  await connectDB();

  // 2. UNWRAP: Await the params to get the ID
  const { id } = await params;

  const brand = await Brand.findById(id);

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }
  return NextResponse.json(brand);
}

export async function PUT(req: Request, { params }: RouteContext) {
  await connectDB();

  // 2. UNWRAP
  const { id } = await params;

  const body = await req.json();
  const brand = await Brand.findByIdAndUpdate(id, body, { new: true });

  return NextResponse.json(brand);
}

export async function DELETE(req: Request, { params }: RouteContext) {
  await connectDB();

  // 2. UNWRAP
  const { id } = await params;

  await Brand.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
