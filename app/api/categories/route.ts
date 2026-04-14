// @/app/api/categories/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { logServerError } from "@/lib/server/errorlogs"
import mongoose from "mongoose"

type CategoryDoc = {
  _id: any
  name: string
  slug: string
  description?: string
  status: boolean
  image?: string
  productCount?: number
  createdAt: Date
}

/**
 *  Serialize category
 */
function serializeCategory(category: CategoryDoc) {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    status: category.status,
    image: category.image || "",
    productCount: category.productCount || 0,
    createdAt: category.createdAt,
  }
}

/**
 * 📄 GET categories (admin)
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin()
    await connectDB()

    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])

    return NextResponse.json({
      success: true,
      data: categories.map(serializeCategory),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: "/api/categories",
        method: "GET",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch categories"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: "/api/categories",
      method: "GET",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ➕ POST category (admin)
 */
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin()
    await connectDB()

    const body = await req.json()
    const { name, slug, description, status, image } = body

    /**
     * 🔐 Validate
     */
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      )
    }

    /**
     * 🔍 Slug uniqueness
     */
    const exists = await Category.findOne({ slug })

    if (exists) {
      await logServerError({
        errorType: "duplicate",
        errorMessage: "Slug already exists",
        endpoint: "/api/categories",
        method: "POST",
        requestData: body,
      })
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 },
      )
    }

    /**
     * ➕ Create
     */
    const created = await Category.create({
      name: String(name).trim(),
      slug: String(slug).trim(),
      description: description?.trim() || "",
      status: status === false ? false : true,
      image: image || "",
    })

    return NextResponse.json(
      {
        success: true,
        category: serializeCategory(created.toObject()),
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: "/api/categories",
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
      error instanceof Error ? error.message : "Failed to create category"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: "/api/categories",
      method: "POST",
      requestData: await req.json().catch(() => ({})),
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
