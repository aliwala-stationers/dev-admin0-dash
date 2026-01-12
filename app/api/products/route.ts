import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// ▼ CRITICAL IMPORTS: These register the schemas so 'populate' works
import Category from "@/models/Category"; 
import Brand from "@/models/Brand"; 

export async function GET() {
  try {
    await connectDB();
    
    // Now populate will work because Category and Brand are registered
    const products = await Product.find({})
      .populate("category", "name") 
      .populate("brand", "name")
      .sort({ createdAt: -1 });
      
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Product Fetch Error:", error); // Good for debugging in Vercel logs
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    // Ensure these are loaded for validation too
    await Category.init(); 
    await Brand.init();

    const body = await req.json();
    
    // Check SKU uniqueness
    const skuExists = await Product.findOne({ sku: body.sku });
    if (skuExists) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
    }

    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}