import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  await connectDB();
  const categories = await Category.find({}).sort({ createdAt: -1 });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Check for duplicate slug
    const exists = await Category.findOne({ slug: body.slug });
    if (exists) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}