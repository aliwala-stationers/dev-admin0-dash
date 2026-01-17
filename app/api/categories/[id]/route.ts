import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  await connectDB();
  const { id } = await params;
  
  const category = await Category.findById(id);
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  // <--- CHANGED: Query by ID, not Name
  const productCount = await Product.countDocuments({ category: id });

  return NextResponse.json({ 
    ...category.toObject(), 
    productCount 
  });
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
  
  // Optional Safety: Prevent deleting a category if it has products
  /* const hasProducts = await Product.exists({ category: id });
  if (hasProducts) {
    return NextResponse.json({ error: "Cannot delete category containing products" }, { status: 400 });
  }
  */

  await Category.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}