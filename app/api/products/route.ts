import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category"; // Required for population
import Brand from "@/models/Brand";       // Required for population

export async function GET() {
  try {
    await connectDB();
    // We populate category and brand to get the full objects back
    const products = await Product.find({})
      .populate("category", "name") 
      .populate("brand", "name")
      .sort({ createdAt: -1 });
      
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // 1. Validation: Check if SKU is unique
    const skuExists = await Product.findOne({ sku: body.sku });
    if (skuExists) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
    }

    // 2. Create Product
    const product = await Product.create(body);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}