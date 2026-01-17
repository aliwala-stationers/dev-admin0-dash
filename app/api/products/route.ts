import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category"; 
import Brand from "@/models/Brand"; 

export async function GET() {
  try {
    await connectDB();
    
    const products = await Product.find({})
      .populate("category", "name") 
      .populate("brand", "name logo")
      .sort({ createdAt: -1 });
      
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Product Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    // Ensure these are loaded so Mongoose knows the schemas exist
    await Category.init(); 
    await Brand.init();

    const body = await req.json();
    
    // --- VALIDATION START ---
    // Check if SKU or Slug already exists anywhere in the DB
    const existingProduct = await Product.findOne({
      $or: [{ sku: body.sku }, { slug: body.slug }],
    });

    if (existingProduct) {
      if (existingProduct.sku === body.sku) {
        return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
      }
      if (existingProduct.slug === body.slug) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }
    // --- VALIDATION END ---

    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}