// @/app/api/subcategories/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subcategory from "@/models/Subcategory"
import Product from "@/models/Product"
import mongoose from "mongoose"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"

type RouteContext = {
  params: Promise<{ id: string }>
}

type SubcategoryDoc = {
  _id: any
  name: string
  slug: string
  description?: string
  status: string
  image?: string
  category?: any
  createdAt: Date
  updatedAt: Date
}

/**
 * 📦 Serialize subcategory
 */
function serializeSubcategory(subcategory: SubcategoryDoc, productCount = 0) {
  return {
    id: subcategory._id.toString(),
    name: subcategory.name,
    slug: subcategory.slug,
    description: subcategory.description || "",
    status: subcategory.status,
    image: subcategory.image || "",
    category: subcategory.category?.toString?.() || null,
    productCount,
    createdAt: subcategory.createdAt,
    updatedAt: subcategory.updatedAt,
  }
}

/**
 * 🔍 Validate ObjectId
 */
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

/**
 * 📄 GET single subcategory
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid subcategory ID" },
        { status: 400 },
      )
    }

    await connectDB()

    const subcategory = await Subcategory.findById(id).lean()

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 },
      )
    }

    const productCount = await Product.countDocuments({ subcategory: id })

    return NextResponse.json({
      success: true,
      subcategory: serializeSubcategory(subcategory, productCount),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch subcategory" },
      { status: 500 },
    )
  }
}

/**
 * ✏️ UPDATE subcategory
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid subcategory ID" },
        { status: 400 },
      )
    }

    await connectDB()

    const body = await req.json()

    /**
     * 🔍 Slug conflict (exclude current)
     */
    if (body.slug) {
      const conflict = await Subcategory.findOne({
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
     * 🔗 Validate category (if provided)
     */
    if (body.category && !isValidObjectId(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    /**
     * ✏️ Update
     */
    const updated = await Subcategory.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updated) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      subcategory: serializeSubcategory(updated),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to update subcategory" },
      { status: 500 },
    )
  }
}

/**
 * ❌ DELETE subcategory
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid subcategory ID" },
        { status: 400 },
      )
    }

    await connectDB()

    /**
     * 🔒 Safety: prevent delete if products exist
     */
    const hasProducts = await Product.exists({ subcategory: id })

    if (hasProducts) {
      return NextResponse.json(
        { error: "Cannot delete subcategory with products" },
        { status: 400 },
      )
    }

    const deleted = await Subcategory.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Subcategory deleted",
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 },
    )
  }
}
