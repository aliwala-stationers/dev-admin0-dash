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
    const sortField = req.nextUrl.searchParams.get("sortField") || "createdAt"
    const sortOrder = req.nextUrl.searchParams.get("sortOrder") || "desc"

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

    // Enforce status: true for partial indexes to work
    // Partial indexes only work when status: true is included in query
    query.status = true

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

    // Resolve category/subcategory/brand to ObjectId (parallelized for performance)
    let categoryId: mongoose.Types.ObjectId | undefined
    let subcategoryId: mongoose.Types.ObjectId | undefined
    let brandId: mongoose.Types.ObjectId | undefined

    const [catDoc, subcatDoc, brandDoc] = await Promise.all([
      category && category !== "all"
        ? (() => {
            const orConditions: any[] = []
            if (mongoose.Types.ObjectId.isValid(category)) {
              orConditions.push({
                _id: new mongoose.Types.ObjectId(category),
              })
            }
            orConditions.push({ slug: category })
            orConditions.push({ name: category })
            return Category.findOne({ $or: orConditions })
          })()
        : Promise.resolve(null),
      subcategory && subcategory !== "all"
        ? (() => {
            const orConditions: any[] = []
            if (mongoose.Types.ObjectId.isValid(subcategory)) {
              orConditions.push({
                _id: new mongoose.Types.ObjectId(subcategory),
              })
            }
            orConditions.push({ slug: subcategory })
            orConditions.push({ name: subcategory })
            return Subcategory.findOne({ $or: orConditions })
          })()
        : Promise.resolve(null),
      brand && brand !== "all"
        ? (() => {
            const orConditions: any[] = []
            if (mongoose.Types.ObjectId.isValid(brand)) {
              orConditions.push({
                _id: new mongoose.Types.ObjectId(brand),
              })
            }
            orConditions.push({ slug: brand })
            orConditions.push({ name: brand })
            return Brand.findOne({ $or: orConditions })
          })()
        : Promise.resolve(null),
    ])

    if (catDoc) categoryId = catDoc._id
    if (subcatDoc) subcategoryId = subcatDoc._id
    if (brandDoc) brandId = brandDoc._id

    // Build query with resolved ObjectIds
    if (categoryId) query.category = categoryId
    if (subcategoryId) query.subcategory = subcategoryId
    if (brandId) query.brand = brandId

    // Use aggregation pipeline for sorting by populated fields
    const needsAggregation =
      sortField === "category" ||
      sortField === "subcategory" ||
      sortField === "brand"

    let products: any[]
    let total: number

    if (needsAggregation) {
      // Build sort object for aggregation
      const sortObj: any = {}
      sortObj[`${sortField}.name`] = sortOrder === "asc" ? 1 : -1

      // Build targeted aggregation pipeline - only lookup what's needed
      const pipeline: any[] = [{ $match: query }]

      // Only add lookup for the field being sorted
      if (sortField === "category") {
        pipeline.push({
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        })
        pipeline.push({
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        })
      }

      if (sortField === "brand") {
        pipeline.push({
          $lookup: {
            from: "brands",
            localField: "brand",
            foreignField: "_id",
            as: "brand",
          },
        })
        pipeline.push({
          $unwind: {
            path: "$brand",
            preserveNullAndEmptyArrays: true,
          },
        })
      }

      if (sortField === "subcategory") {
        pipeline.push({
          $lookup: {
            from: "subcategories",
            localField: "subcategory",
            foreignField: "_id",
            as: "subcategory",
          },
        })
        pipeline.push({
          $unwind: {
            path: "$subcategory",
            preserveNullAndEmptyArrays: true,
          },
        })
      }

      pipeline.push({ $sort: sortObj })

      // Add projection to reduce payload size - only include fields needed by frontend
      pipeline.push({
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          sku: 1,
          description: 1,
          b2cPrice: 1,
          price: 1,
          costPrice: 1,
          salePrice: 1,
          mrp: 1,
          b2bPrice: 1,
          b2bMinQty: 1,
          hsn: 1,
          tax: 1,
          upc: 1,
          barcode: 1,
          stock: 1,
          status: 1,
          images: 1,
          videoUrl: 1,
          specs: 1,
          isFeatured: 1,
          category: 1,
          brand: 1,
          subcategory: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      })

      // Use $facet to get both data and total count in single query
      const facetPipeline = [
        ...pipeline,
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: "count" }],
          },
        },
      ]

      const [result] = await Product.aggregate(facetPipeline).exec()
      products = result.data || []
      total = result.total?.[0]?.count || 0
    } else {
      // Regular find for non-populated field sorting (more efficient)
      const sortObj: any = {}
      sortObj[sortField] = sortOrder === "asc" ? 1 : -1

      const [productsResult, totalCount] = await Promise.all([
        Product.find(query)
          .populate("category", "name")
          .populate("brand", "name logo")
          .populate("subcategory", "name")
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query),
      ])
      products = productsResult
      total = totalCount
    }

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
