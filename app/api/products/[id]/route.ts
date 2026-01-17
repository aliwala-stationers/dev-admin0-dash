import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET single product
export async function GET(req: Request, { params }: RouteContext) {
  try {
    await connectDB();
    const { id } = await params;
    
    const product = await Product.findById(id)
      .populate("category")
      .populate("brand");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE product
export async function PUT(req: Request, { params }: RouteContext) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // --- VALIDATION START ---
    // Check if SKU or Slug is being used by a DIFFERENT product
    // The query checks: (SKU matches OR Slug matches) AND (ID is NOT this product)
    const conflict = await Product.findOne({
      $and: [
        { _id: { $ne: id } }, // Exclude current product from check
        { $or: [{ sku: body.sku }, { slug: body.slug }] }
      ]
    });

    if (conflict) {
      if (conflict.sku === body.sku) {
        return NextResponse.json({ error: "SKU is already used by another product" }, { status: 400 });
      }
      if (conflict.slug === body.slug) {
        return NextResponse.json({ error: "Slug is already used by another product" }, { status: 400 });
      }
    }
    // --- VALIDATION END ---
    
    const product = await Product.findByIdAndUpdate(id, body, { 
      new: true, 
      runValidators: true 
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE product
export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await connectDB();
    const { id } = await params;
    
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}