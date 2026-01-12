import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  await connectDB();
  const { id } = await params; // Await params for Next.js 15
  
  const category = await Category.findById(id);
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  
  return NextResponse.json(category);
}

export async function PUT(req: Request, { params }: RouteContext) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  
  const category = await Category.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(category);
}

export async function DELETE(req: Request, { params }: RouteContext) {
  await connectDB();
  const { id } = await params;
  
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}