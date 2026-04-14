// @/app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import mongoose from "mongoose"

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * 📦 Serialize product
 */
function serializeProduct(product: any) {
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice,
    hsn: product.hsn,
    tax: product.tax,
    upc: product.upc,
    barcode: product.barcode,
    stock: product.stock,
    status: product.status,
    images: product.images,
    videoUrl: product.videoUrl,
    specs: product.specs,
    isFeatured: product.isFeatured,
    category: product.category
      ? {
          id: product.category._id?.toString?.(),
          name: product.category.name,
        }
      : null,
    brand: product.brand
      ? {
          id: product.brand._id?.toString?.(),
          name: product.brand.name,
          logo: product.brand.logo,
        }
      : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

/**
 * 🔍 Validate ObjectId
 */
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

/**
 * 📄 GET single product
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    await connectDB()

    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("brand", "name logo")
      .lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product: serializeProduct(product),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    )
  }
}

/**
 * ✏️ UPDATE product (PATCH style safer)
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    await connectDB()

    const body = await req.json()

    /**
     * 🔍 Conflict check
     */
    if (body.sku || body.slug) {
      const conflict = await Product.findOne({
        _id: { $ne: id },
        $or: [
          ...(body.sku ? [{ sku: body.sku }] : []),
          ...(body.slug ? [{ slug: body.slug }] : []),
        ],
      })

      if (conflict) {
        return NextResponse.json(
          {
            error:
              conflict.sku === body.sku
                ? "SKU already used"
                : "Slug already used",
          },
          { status: 409 },
        )
      }
    }

    /**
     * ✏️ Update
     */
    const updated = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("brand", "name logo")
      .lean()

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product: serializeProduct(updated),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    )
  }
}

/**
 * ❌ DELETE product
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    await connectDB()

    const deleted = await Product.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted",
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    )
  }
}
