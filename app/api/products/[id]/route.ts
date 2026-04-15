// @/app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import Subcategory from "@/models/Subcategory"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { logServerError } from "@/lib/server/errorlogs"
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
    costPrice: product.costPrice,
    mrp: product.mrp,
    b2cPrice: product.b2cPrice,
    b2bPrice: product.b2bPrice,
    b2bMinQty: product.b2bMinQty,
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
    subcategory: product.subcategory
      ? {
          id: product.subcategory._id?.toString?.(),
          name: product.subcategory.name,
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
  // Hoisted outside the try/catch block so the error logger can access it cleanly.
  const { id } = await params

  try {
    await verifyAdmin()

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    await connectDB()

    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("brand", "name logo")
      .populate("subcategory", "name")
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
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/products/${id}`, // Clean reference
        method: "GET",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch product"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/products/${id}`, // Clean reference
      method: "GET",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ✏️ UPDATE product (PATCH style safer)
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  // Hoisted state container to preserve the request body for error logging.
  // This prevents the "body stream already read" fatal crash in the catch block.
  let parsedBody: Record<string, any> = {}

  try {
    await verifyAdmin()

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    await connectDB()
    await Subcategory.init()

    // Single point of stream consumption
    parsedBody = await req.json()

    // Handle empty subcategory - convert empty string to null
    if (parsedBody.subcategory === "" || parsedBody.subcategory === null) {
      parsedBody.subcategory = null
    }

    /**
     * 🔍 Conflict check
     */
    if (parsedBody.sku || parsedBody.slug) {
      const conflict = await Product.findOne({
        _id: { $ne: id },
        $or: [
          ...(parsedBody.sku ? [{ sku: parsedBody.sku }] : []),
          ...(parsedBody.slug ? [{ slug: parsedBody.slug }] : []),
        ],
      })

      if (conflict) {
        const errorMessage =
          conflict.sku === parsedBody.sku
            ? "SKU already used"
            : "Slug already used"
        await logServerError({
          errorType: "duplicate",
          errorMessage,
          endpoint: `/api/products/${id}`,
          method: "PUT",
          requestData: parsedBody,
        })
        return NextResponse.json({ error: errorMessage }, { status: 409 })
      }
    }

    /**
     * ✏️ Update
     */
    const updated = await Product.findByIdAndUpdate(id, parsedBody, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("brand", "name logo")
      .populate("subcategory", "name")
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
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/products/${id}`,
        method: "PUT",
        requestData: parsedBody, // Safe reference to the hoisted state
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to update product"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/products/${id}`,
      method: "PUT",
      requestData: parsedBody, // Safe reference to the hoisted state
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ❌ DELETE product
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    await verifyAdmin()

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
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/products/${id}`,
        method: "DELETE",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete product"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/products/${id}`,
      method: "DELETE",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
