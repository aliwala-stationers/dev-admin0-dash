// @/app/api/brands/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Brand from "@/models/Brand"
import Product from "@/models/Product"
import mongoose from "mongoose"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"

type RouteContext = {
  params: Promise<{ id: string }>
}

type BrandDoc = {
  _id: any
  name: string
  slug: string
  logo?: string
  createdAt: Date
}

/**
 * 📦 Serialize brand
 */
function serializeBrand(brand: BrandDoc) {
  return {
    id: brand._id.toString(),
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo || "",
    createdAt: brand.createdAt,
  }
}

/**
 * 🔍 Validate ObjectId
 */
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

/**
 * 📄 GET brand
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    await connectDB()

    const brand = await Brand.findById(id).lean()

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      brand: serializeBrand(brand),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 },
    )
  }
}

/**
 * ✏️ UPDATE brand
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    await connectDB()

    const body = await req.json()

    /**
     * 🔍 Slug conflict
     */
    if (body.slug) {
      const conflict = await Brand.findOne({
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

    const updated = await Brand.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updated) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      brand: serializeBrand(updated),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 },
    )
  }
}

/**
 * ❌ DELETE brand
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await verifyAdmin()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    await connectDB()

    /**
     * 🔒 Prevent delete if used in products
     */
    const inUse = await Product.exists({ brand: id })

    if (inUse) {
      return NextResponse.json(
        { error: "Cannot delete brand linked to products" },
        { status: 400 },
      )
    }

    const deleted = await Brand.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Brand deleted",
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 },
    )
  }
}
