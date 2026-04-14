// @/app/api/products/search/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import Category from "@/models/Category"
import Brand from "@/models/Brand"
import Subcategory from "@/models/Subcategory"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { logServerError } from "@/lib/server/errorlogs"

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
 * 🔍 GET → Search products with advanced filters
 * This is a dedicated search endpoint optimized for search operations
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin()

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const subcategory = searchParams.get("subcategory") || ""
    const brand = searchParams.get("brand") || ""
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
    const page = Number(searchParams.get("page")) || 1
    const skip = (page - 1) * limit

    /**
     * DB
     */
    await connectDB()
    await Category.init()
    await Brand.init()
    await Subcategory.init()

    /**
     * Build search query
     */
    const query: any = {}

    // Search by name, SKU, or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category
    }

    // Filter by subcategory
    if (subcategory && subcategory !== "all") {
      query.subcategory = subcategory
    }

    // Filter by brand
    if (brand && brand !== "all") {
      query.brand = brand
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .populate("brand", "name logo")
        .populate("subcategory", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: products.map(serializeProduct),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: "/api/products/search",
        method: "GET",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to search products"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: "/api/products/search",
      method: "GET",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
