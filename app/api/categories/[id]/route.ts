// @/app/api/categories/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import Product from "@/models/Product"
import mongoose from "mongoose"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { logServerError } from "@/lib/server/errorlogs"

type RouteContext = {
  params: Promise<{ id: string }>
}

type CategoryDoc = {
  _id: any
  name: string
  slug: string
  description?: string
  status: boolean
  image?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Serialize category
 */
function serializeCategory(category: CategoryDoc, productCount = 0) {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    status: category.status,
    image: category.image || "",
    productCount,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

/**
 * 🔍 Validate ObjectId
 */
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

/**
 * 📄 GET single category
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    await verifyAdmin()

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 },
      )
    }

    await connectDB()

    const category = await Category.findById(id).lean()

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const productCount = await Product.countDocuments({ category: id })

    return NextResponse.json({
      success: true,
      category: serializeCategory(category, productCount),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/categories/${id}`,
        method: "GET",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch category"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/categories/${id}`,
      method: "GET",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ✏️ UPDATE category
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    await verifyAdmin()

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 },
      )
    }

    await connectDB()

    const body = await req.json()

    /**
     * 🔍 Slug conflict (exclude current)
     */
    if (body.slug) {
      const conflict = await Category.findOne({
        _id: { $ne: id },
        slug: body.slug,
      })

      if (conflict) {
        await logServerError({
          errorType: "duplicate",
          errorMessage: "Slug already exists",
          endpoint: `/api/categories/${id}`,
          method: "PUT",
          requestData: body,
        })
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 },
        )
      }
    }

    /**
     * ✏️ Update
     */
    const updated = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      category: serializeCategory(updated),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/categories/${id}`,
        method: "PUT",
        requestData: await req.json().catch(() => ({})),
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to update category"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/categories/${id}`,
      method: "PUT",
      requestData: await req.json().catch(() => ({})),
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ❌ DELETE category
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    await verifyAdmin()

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 },
      )
    }

    await connectDB()

    /**
     * 🔒 Safety: prevent delete if products exist
     */
    const hasProducts = await Product.exists({ category: id })

    if (hasProducts) {
      return NextResponse.json(
        { error: "Cannot delete category with products" },
        { status: 400 },
      )
    }

    const deleted = await Category.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted",
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/categories/${id}`,
        method: "DELETE",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete category"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/categories/${id}`,
      method: "DELETE",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
