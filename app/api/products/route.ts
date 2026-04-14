// @/app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import Category from "@/models/Category"
import Brand from "@/models/Brand"
import Subcategory from "@/models/Subcategory"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"

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
 * 📄 GET → Admin list products
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin()

    /**
     * Pagination + filters
     */
    const limit = Math.min(
      Number(req.nextUrl.searchParams.get("limit")) || 20,
      100,
    )

    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const skip = (page - 1) * limit

    const search = req.nextUrl.searchParams.get("search") || ""

    /**
     * DB
     */
    await connectDB()
    await Category.init()
    await Brand.init()
    await Subcategory.init()

    /**
     * Query
     */
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } },
          ],
        }
      : {}

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
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    console.error("Products fetch error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 },
    )
  }
}

/**
 * ➕ POST → Create product (admin)
 */
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin()

    await connectDB()
    await Category.init()
    await Brand.init()
    await Subcategory.init()

    const body = await req.json()

    /**
     * 🔐 Validate required fields
     */
    if (!body.name || !body.sku || !body.slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    /**
     * 🔍 Check uniqueness
     */
    const existingProduct = await Product.findOne({
      $or: [{ sku: body.sku }, { slug: body.slug }],
    })

    if (existingProduct) {
      return NextResponse.json(
        {
          error:
            existingProduct.sku === body.sku
              ? "SKU already exists"
              : "Slug already exists",
        },
        { status: 409 },
      )
    }

    /**
     * ➕ Create
     */
    const created = await Product.create(body)

    return NextResponse.json(
      {
        success: true,
        product: serializeProduct(created),
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    )
  }
}
