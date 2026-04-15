// @/app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import Category from "@/models/Category"
import Brand from "@/models/Brand"
import Subcategory from "@/models/Subcategory"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { logServerError } from "@/lib/server/errorlogs"
import mongoose from "mongoose"

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
    price: product.b2cPrice || product.price, // Use b2cPrice as price for backward compatibility
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
    const category = req.nextUrl.searchParams.get("category") || ""
    const subcategory = req.nextUrl.searchParams.get("subcategory") || ""
    const brand = req.nextUrl.searchParams.get("brand") || ""

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
    const query: any = {}

    // Search by name, SKU, category name, subcategory name, or brand name
    if (search) {
      const searchRegex = { $regex: search, $options: "i" }

      // Find matching categories, subcategories, and brands
      const [matchingCategories, matchingSubcategories, matchingBrands] =
        await Promise.all([
          Category.find({ name: searchRegex }).select("_id"),
          Subcategory.find({ name: searchRegex }).select("_id"),
          Brand.find({ name: searchRegex }).select("_id"),
        ])

      const categoryIds = matchingCategories.map((c: any) => c._id)
      const subcategoryIds = matchingSubcategories.map((s: any) => s._id)
      const brandIds = matchingBrands.map((b: any) => b._id)

      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
        ...(subcategoryIds.length > 0
          ? [{ subcategory: { $in: subcategoryIds } }]
          : []),
        ...(brandIds.length > 0 ? [{ brand: { $in: brandIds } }] : []),
      ]
    }

    // Filter by category (convert string to ObjectId)
    if (category && category !== "all") {
      try {
        query.category = new mongoose.Types.ObjectId(category)
      } catch (e) {
        // If invalid ObjectId, try to find by slug instead
        const catDoc = await Category.findOne({ slug: category })
        if (catDoc) {
          query.category = catDoc._id
        }
      }
    }

    // Filter by subcategory (convert string to ObjectId)
    if (subcategory && subcategory !== "all") {
      try {
        query.subcategory = new mongoose.Types.ObjectId(subcategory)
      } catch (e) {
        // If invalid ObjectId, try to find by slug instead
        const subcatDoc = await Subcategory.findOne({ slug: subcategory })
        if (subcatDoc) {
          query.subcategory = subcatDoc._id
        }
      }
    }

    // Filter by brand (convert string to ObjectId)
    if (brand && brand !== "all") {
      try {
        query.brand = new mongoose.Types.ObjectId(brand)
      } catch (e) {
        // If invalid ObjectId, try to find by slug instead
        const brandDoc = await Brand.findOne({ slug: brand })
        if (brandDoc) {
          query.brand = brandDoc._id
        }
      }
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
     * � Convert string IDs to ObjectIds for relations
     */
    if (body.category) {
      try {
        body.category = new mongoose.Types.ObjectId(body.category)
      } catch (e) {
        // If invalid ObjectId, try to find by slug
        const catDoc = await Category.findOne({ slug: body.category })
        if (catDoc) {
          body.category = catDoc._id
        }
      }
    }

    if (body.subcategory) {
      try {
        body.subcategory = new mongoose.Types.ObjectId(body.subcategory)
      } catch (e) {
        // If invalid ObjectId, try to find by slug
        const subcatDoc = await Subcategory.findOne({ slug: body.subcategory })
        if (subcatDoc) {
          body.subcategory = subcatDoc._id
        }
      }
    }

    if (body.brand) {
      try {
        body.brand = new mongoose.Types.ObjectId(body.brand)
      } catch (e) {
        // If invalid ObjectId, try to find by slug
        const brandDoc = await Brand.findOne({ slug: body.brand })
        if (brandDoc) {
          body.brand = brandDoc._id
        }
      }
    }

    /**
     * �� Validate required fields
     */
    if (!body.name || !body.sku || !body.slug) {
      await logServerError({
        errorType: "validation",
        errorMessage: "Missing required fields",
        endpoint: "/api/products",
        method: "POST",
        requestData: body,
      })
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
      const errorMessage =
        existingProduct.sku === body.sku
          ? "SKU already exists"
          : "Slug already exists"

      await logServerError({
        errorType: "duplicate",
        errorMessage,
        endpoint: "/api/products",
        method: "POST",
        requestData: body,
      })

      return NextResponse.json({ error: errorMessage }, { status: 409 })
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
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: "/api/products",
        method: "POST",
        requestData: await req.json().catch(() => ({})),
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create product"

    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: "/api/products",
      method: "POST",
      requestData: await req.json().catch(() => ({})),
      stackTrace: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
