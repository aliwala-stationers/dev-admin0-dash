// @/app/api/categories/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import Product from "@/models/Product"
import mongoose from "mongoose"
import { jwtVerify, JWTPayload } from "jose"
import { ADMIN_JWT_SECRET, AUTH_META } from "@/lib/auth/constants"
import { AUTH_ERRORS, AuthError } from "@/lib/auth/errors"

type RouteContext = {
  params: Promise<{ id: string }>
}

type AdminJWTPayload = JWTPayload & {
  sub: string
  role: "admin"
}

type CategoryDoc = {
  _id: any
  name: string
  slug: string
  description?: string
  status: string
  image?: string
  parentId?: any
  createdAt: Date
}

/**
 * 🔐 Verify admin
 */
async function verifyAdmin(req: NextRequest): Promise<AdminJWTPayload> {
  const authHeader = req.headers.get("authorization")

  if (!authHeader) throw AUTH_ERRORS.UNAUTHORIZED()

  const [scheme, token] = authHeader.split(" ")

  if (scheme !== "Bearer" || !token?.trim()) {
    throw AUTH_ERRORS.UNAUTHORIZED()
  }

  const { payload } = await jwtVerify(token.trim(), ADMIN_JWT_SECRET, {
    issuer: AUTH_META.ADMIN.issuer,
    audience: AUTH_META.ADMIN.audience,
  })

  if (!payload.sub || payload.role !== "admin") {
    throw AUTH_ERRORS.FORBIDDEN()
  }

  return payload as AdminJWTPayload
}

/**
 * 📦 Serialize category
 */
function serializeCategory(category: CategoryDoc, productCount = 0) {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    status: category.status,
    image: category.image || "",
    parentId: category.parentId?.toString?.() || null,
    productCount,
    createdAt: category.createdAt,
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
  try {
    await verifyAdmin(req)

    const { id } = await params

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
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 },
    )
  }
}

/**
 * ✏️ UPDATE category
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin(req)

    const { id } = await params

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
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 },
        )
      }
    }

    /**
     * 🔗 Validate parentId
     */
    if (body.parentId && !isValidObjectId(body.parentId)) {
      return NextResponse.json({ error: "Invalid parentId" }, { status: 400 })
    }

    /**
     * ❗ Prevent self-parenting
     */
    if (body.parentId === id) {
      return NextResponse.json(
        { error: "Category cannot be its own parent" },
        { status: 400 },
      )
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
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    )
  }
}

/**
 * ❌ DELETE category
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin(req)

    const { id } = await params

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

    /**
     * 🔒 Safety: prevent delete if has children
     */
    const hasChildren = await Category.exists({ parentId: id })

    if (hasChildren) {
      return NextResponse.json(
        { error: "Cannot delete category with subcategories" },
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
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    )
  }
}
